import type { StorageAdapter } from './types'
import { StorageError } from '../shared/error'
import { jsonSerializer } from '../shared/serializer'
import type { Serializer } from '../shared/serializer'
import type { JsonValue } from '../shared/types'

// WebStorage 适配器配置
export interface WebStorageAdapterOptions {
  // 命名空间前缀
  namespace: string
  // 底层存储,localStorage 或 sessionStorage
  storage: globalThis.Storage
  // 适配器名,用于错误信息
  adapterName: 'local' | 'session'
  // 自定义序列化器
  serializer?: Serializer
  /**
   * 容量上限,字节,UTF-8 估算。
   * 超出后按 LRU 顺序自动淘汰最早未访问的条目,
   * 0 或 undefined 表示不限制,仅作用于当前 namespace
   */
  maxBytes?: number
}

// 估算字符串 UTF-8 字节数
function utf8Bytes(s: string): number {
  return new Blob([s]).size
}

/**
 * Web Storage 适配器抽象基类。
 * local 与 session 共用 JSON 序列化、命名空间、异常包装、容量管理
 *
 * 容量管理:
 * - 构造时扫描整个 namespace 建立 keyIndex / accessOrder / recordBytes
 * - set 时若超出 maxBytes,按 LRU 淘汰最早条目
 * - get 命中时更新 LRU 顺序,使其排在末尾
 */
export abstract class WebStorageAdapter implements StorageAdapter {
  // 底层存储,由子类注入 window.localStorage 或 window.sessionStorage
  protected abstract readonly storage: globalThis.Storage

  // 命名空间前缀,避免与其它库冲突
  protected abstract readonly namespace: string

  // 序列化策略,默认 JSON
  protected readonly serializer: Serializer

  // 适配器名,用于错误信息
  protected abstract readonly adapterName: 'local' | 'session'

  // 容量上限,字节,0 表示不限制
  protected readonly maxBytes: number

  // namespace 下所有 key 索引,O(1) keys/clear
  protected readonly keyIndex = new Set<string>()

  // LRU 访问顺序,Map 迭代顺序即访问顺序,末尾最新,头部最旧
  protected readonly accessOrder = new Map<string, true>()

  // 单条记录字节数缓存,估算,避免容量检查时反复读 storage
  protected readonly recordBytes = new Map<string, number>()

  // 当前 namespace 占用字节数,Σ recordBytes
  protected currentBytes = 0

  // 容量检查是否启用
  protected get hasCapacityLimit(): boolean {
    return this.maxBytes > 0
  }

  constructor(options?: Partial<WebStorageAdapterOptions>) {
    this.serializer = options?.serializer ?? jsonSerializer
    this.maxBytes = options?.maxBytes ?? 0
    this.rebuildIndex()
  }

  // 启动时同步索引、字节计数、LRU 顺序
  protected rebuildIndex(): void {
    this.keyIndex.clear()
    this.accessOrder.clear()
    this.recordBytes.clear()
    this.currentBytes = 0

    const prefix = `${this.namespace}:`
    for (let i = 0; i < this.storage.length; i++) {
      const fullKey = this.storage.key(i)
      if (fullKey && fullKey.startsWith(prefix)) {
        const key = fullKey.slice(prefix.length)
        const raw = this.storage.getItem(fullKey)
        if (raw !== null) {
          const bytes = utf8Bytes(fullKey) + utf8Bytes(raw)
          this.keyIndex.add(key)
          this.accessOrder.set(key, true)
          this.recordBytes.set(key, bytes)
          this.currentBytes += bytes
        }
      }
    }
  }

  get<V>(key: string): V | undefined {
    const fullKey = this.namespaced(key)
    // LRU 顺序更新,命中即移到末尾
    if (this.keyIndex.has(key)) {
      this.accessOrder.delete(key)
      this.accessOrder.set(key, true)
    }
    try {
      const raw = this.storage.getItem(fullKey)
      if (raw === null) return undefined
      return this.serializer.deserialize(raw) as V
    } catch (err) {
      throw new StorageError(
        `Failed to get key "${key}" from ${this.adapterName}Storage`,
        { cause: err, adapter: this.adapterName, kind: 'unknown' }
      )
    }
  }

  set(key: string, value: unknown): void {
    const fullKey = this.namespaced(key)
    let raw: string
    try {
      raw = this.serializer.serialize(value as JsonValue)
    } catch (err) {
      throw new StorageError(
        `Failed to serialize value for key "${key}"`,
        { cause: err, adapter: this.adapterName, kind: 'unknown' }
      )
    }

    // 计算新记录字节数
    const newRecordBytes = utf8Bytes(fullKey) + utf8Bytes(raw)
    // 旧记录字节数,若已存在
    const oldRecordBytes = this.recordBytes.get(key) ?? 0
    const projectedBytes = this.currentBytes - oldRecordBytes + newRecordBytes

    // 容量检查:超出 maxBytes 时按 LRU 淘汰
    if (this.hasCapacityLimit && projectedBytes > this.maxBytes) {
      this.evictUntil(projectedBytes - this.maxBytes)
    }

    try {
      this.storage.setItem(fullKey, raw)
    } catch (err) {
      if (err instanceof Error && err.name === 'QuotaExceededError') {
        throw new StorageError(
          `Quota exceeded for key "${key}" in ${this.adapterName}Storage`,
          { cause: err, adapter: this.adapterName, kind: 'quota' }
        )
      }
      throw new StorageError(
        `Failed to set key "${key}" in ${this.adapterName}Storage`,
        { cause: err, adapter: this.adapterName, kind: 'unknown' }
      )
    }

    // 写成功:更新索引 + 字节计数 + LRU
    this.keyIndex.add(key)
    this.accessOrder.delete(key)
    this.accessOrder.set(key, true)
    this.recordBytes.set(key, newRecordBytes)
    this.currentBytes = this.currentBytes - oldRecordBytes + newRecordBytes
  }

  remove(key: string): void {
    const fullKey = this.namespaced(key)
    const oldBytes = this.recordBytes.get(key) ?? 0
    this.storage.removeItem(fullKey)
    this.keyIndex.delete(key)
    this.accessOrder.delete(key)
    this.recordBytes.delete(key)
    this.currentBytes -= oldBytes
  }

  keys(): string[] {
    return Array.from(this.keyIndex)
  }

  clear(): void {
    const prefix = `${this.namespace}:`
    this.keyIndex.forEach((key) => {
      this.storage.removeItem(`${prefix}${key}`)
    })
    this.keyIndex.clear()
    this.accessOrder.clear()
    this.recordBytes.clear()
    this.currentBytes = 0
  }

  // 当前 namespace 占用字节数,估算
  get usageBytes(): number {
    return this.currentBytes
  }

  // 容量上限,0 表示无限制
  get capacityBytes(): number {
    return this.maxBytes
  }

  // 当前 namespace 条目数,O(1)
  get size(): number {
    return this.keyIndex.size
  }

  // 加命名空间前缀
  protected namespaced(key: string): string {
    return `${this.namespace}:${key}`
  }

  // 私有,按 LRU 顺序淘汰,直到能容纳 needBytes
  protected evictUntil(needBytes: number): void {
    // 复制 keys 以安全地在迭代中删除
    const orderedKeys = Array.from(this.accessOrder.keys())
    for (const key of orderedKeys) {
      if (needBytes <= 0) break
      const bytes = this.recordBytes.get(key) ?? 0
      this.remove(key) // remove 会更新 currentBytes / recordBytes / accessOrder
      needBytes -= bytes
    }
  }
}