import { IndexedDBAdapter } from '../db/indexedDB'

export interface AssetStoreOptions {
  /** 数据库名(默认 'octovue-assets') */
  name?: string
  /** object store 名(默认 'blobs') */
  store?: string
  /** 数据库版本(默认 1) */
  version?: number
  /** 升级回调 */
  upgrade?: (db: IDBDatabase, oldVersion: number) => void
}

interface URLEntry {
  /** createObjectURL 返回的 URL */
  url: string
  /** 引用计数 */
  refCount: number
}

export interface AssetInfo {
  /** 资产 key */
  key: string
  /** Blob 大小(字节) */
  size: number
  /** Blob MIME 类型 */
  type: string
  /** 最后修改时间(若有) */
  lastModified?: number
}

/**
 * 文件资产存储。
 * 底层复用 IndexedDBAdapter 存 Blob,上层管理 ObjectURL 引用计数。
 */
export class AssetStore {
  protected adapter: IndexedDBAdapter

  /** URL 引用计数表(纯内存) */
  protected urlMap = new Map<string, URLEntry>()

  constructor(options: AssetStoreOptions = {}) {
    this.adapter = new IndexedDBAdapter({
      name: options.name ?? 'octovue-assets',
      store: options.store ?? 'blobs',
      version: options.version ?? 1,
      upgrade: options.upgrade,
    })
  }

  // ============== 持久化操作 ==============

  /** 写入 Blob */
  async save(key: string, blob: Blob): Promise<void> {
    return this.adapter.set(key, blob)
  }

  /** 写入 File(等价于 save(file.name, file)) */
  async saveFile(file: File): Promise<string> {
    await this.save(file.name, file)
    return file.name
  }

  /** 取回原始 Blob */
  async get(key: string): Promise<Blob | undefined> {
    return this.adapter.get<Blob>(key)
  }

  /** 删除单个资产(同时释放对应 URL) */
  async remove(key: string): Promise<void> {
    // 1. 同步释放 URL(refCount 强制归零)
    this.forceRevokeURL(key)
    // 2. 删除 IndexedDB 数据
    return this.adapter.remove(key)
  }

  /** 列出所有资产元信息 */
  async list(): Promise<AssetInfo[]> {
    const keys = await this.adapter.keys()
    const items = await Promise.all(
      keys.map(async (key) => {
        const blob = await this.adapter.get<Blob>(key)
        if (!blob) return null
        const info: AssetInfo = {
          key,
          size: blob.size,
          type: blob.type,
        }
        const lastModified = (blob as File).lastModified
        if (typeof lastModified === 'number') {
          info.lastModified = lastModified
        }
        return info
      })
    )
    return items.filter((x): x is AssetInfo => x !== null)
  }

  /** 清空全部资产(同时释放所有 URL) */
  async clear(): Promise<void> {
    this.urlMap.forEach((entry) => {
      URL.revokeObjectURL(entry.url)
    })
    this.urlMap.clear()
    return this.adapter.clear()
  }

  // ============== URL 引用计数操作 ==============

  /**
   * 取 ObjectURL。
   * 自动 refCount + 1;首次创建时调 URL.createObjectURL。
   */
  async getURL(key: string): Promise<string> {
    const entry = this.urlMap.get(key)
    if (entry) {
      // 已有 URL:refCount +1
      entry.refCount++
      return entry.url
    }

    // 首次:从 IndexedDB 取 blob
    const blob = await this.adapter.get<Blob>(key)
    if (!blob) {
      throw new Error(`Asset not found: ${key}`)
    }

    // 创建 ObjectURL
    const url = URL.createObjectURL(blob)
    this.urlMap.set(key, { url, refCount: 1 })
    return url
  }

  /**
   * 释放 ObjectURL。
   * refCount -1,归零时自动 URL.revokeObjectURL。
   */
  releaseURL(key: string): void {
    const entry = this.urlMap.get(key)
    if (!entry) return

    entry.refCount--
    if (entry.refCount <= 0) {
      URL.revokeObjectURL(entry.url)
      this.urlMap.delete(key)
    }
  }

  /** 私有:强制 revoke(remove 时调用) */
  protected forceRevokeURL(key: string): void {
    const entry = this.urlMap.get(key)
    if (entry) {
      URL.revokeObjectURL(entry.url)
      this.urlMap.delete(key)
    }
  }

  /** 当前活跃的 URL 数(用于监控) */
  get urlCount(): number {
    return this.urlMap.size
  }
}

/**
 * 全局 AssetStore 单例。
 * 默认绑定 octovue-assets / blobs,够大多数场景使用。
 */
export const assetStore: AssetStore = new AssetStore()
