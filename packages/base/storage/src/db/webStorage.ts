import type { StorageAdapter } from './types'
import { StorageError } from '../shared/error'
import { jsonSerializer } from '../shared/serializer'
import type { Serializer } from '../shared/serializer'
import type { JsonValue } from '../shared/types'

/**
 * Web Storage 适配器抽象基类。
 * local / session 共用 JSON 序列化、命名空间、异常包装逻辑。
 */
export abstract class WebStorageAdapter implements StorageAdapter {
  /** 底层存储(由子类注入:window.localStorage / window.sessionStorage) */
  protected abstract readonly storage: globalThis.Storage

  /** 命名空间前缀,避免与其它库冲突 */
  protected abstract readonly namespace: string

  /** 序列化策略,默认 JSON */
  protected readonly serializer: Serializer = jsonSerializer

  /** 适配器名,用于错误信息 */
  protected abstract readonly adapterName: 'local' | 'session'

  get<V>(key: string): V | undefined {
    const fullKey = this.namespaced(key)
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
  }

  remove(key: string): void {
    const fullKey = this.namespaced(key)
    this.storage.removeItem(fullKey)
  }

  keys(): string[] {
    const prefix = `${this.namespace}:`
    const result: string[] = []
    for (let i = 0; i < this.storage.length; i++) {
      const fullKey = this.storage.key(i)
      if (fullKey && fullKey.startsWith(prefix)) {
        result.push(fullKey.slice(prefix.length))
      }
    }
    return result
  }

  clear(): void {
    const prefix = `${this.namespace}:`
    const toRemove: string[] = []
    for (let i = 0; i < this.storage.length; i++) {
      const fullKey = this.storage.key(i)
      if (fullKey && fullKey.startsWith(prefix)) {
        toRemove.push(fullKey)
      }
    }
    toRemove.forEach((k) => this.storage.removeItem(k))
  }

  /** 加命名空间前缀 */
  private namespaced(key: string): string {
    return `${this.namespace}:${key}`
  }
}
