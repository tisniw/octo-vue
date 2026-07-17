import { StorageError } from '../shared/error'
import type { StorageAdapter } from './types'
import type { IndexedDBAdapterOptions } from './types'

// IndexedDB 适配器,异步,支持任意 structured clone 类型
export class IndexedDBAdapter implements StorageAdapter {
  readonly name: string
  readonly store: string
  readonly version: number

  // 数据库连接的 Promise,首次打开时 resolve
  protected dbPromise: Promise<IDBDatabase>

  // upgrade 回调,首次打开时执行
  protected readonly upgrade?: IndexedDBAdapterOptions['upgrade']

  constructor(options: IndexedDBAdapterOptions = {}) {
    this.name = options.name ?? 'octovue-storage'
    this.store = options.store ?? 'kv'
    this.version = options.version ?? 1
    this.upgrade = options.upgrade

    // 懒打开,仅创建 Promise,不立即打开
    this.dbPromise = this.openDB()
  }

  // 私有,打开数据库
  protected openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (typeof indexedDB === 'undefined') {
        reject(new StorageError(
          'IndexedDB is not available in this environment',
          { kind: 'not-found', adapter: 'indexeddb' }
        ))
        return
      }

      const req = indexedDB.open(this.name, this.version)

      req.onupgradeneeded = (event) => {
        const db = req.result
        const oldVersion = event.oldVersion
        try {
          // 1. 默认建 store
          if (!db.objectStoreNames.contains(this.store)) {
            db.createObjectStore(this.store)
          }
          // 2. 业务方扩展,例如加索引
          this.upgrade?.(db, oldVersion)
        } catch (err) {
          reject(new StorageError(
            `Failed to upgrade IndexedDB "${this.name}"`,
            { cause: err, adapter: 'indexeddb', kind: 'version' }
          ))
        }
      }

      req.onsuccess = () => resolve(req.result)

      req.onerror = () => {
        const err = req.error
        // VersionError,其它标签页占用旧版本
        if (err?.name === 'VersionError') {
          reject(new StorageError(
            `IndexedDB version conflict for "${this.name}"`,
            { cause: err, adapter: 'indexeddb', kind: 'version' }
          ))
        } else {
          reject(new StorageError(
            `Failed to open IndexedDB "${this.name}"`,
            { cause: err, adapter: 'indexeddb', kind: 'not-found' }
          ))
        }
      }

      req.onblocked = () => {
        // 其它标签页仍持有旧连接,需要它们关闭
        reject(new StorageError(
          `IndexedDB "${this.name}" is blocked by another connection`,
          { adapter: 'indexeddb', kind: 'unknown' }
        ))
      }
    })
  }

  async get<V>(key: string): Promise<V | undefined> {
    const db = await this.dbPromise
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.store, 'readonly')
      const store = tx.objectStore(this.store)
      const req = store.get(key)
      req.onsuccess = () => resolve(req.result as V | undefined)
      req.onerror = () => reject(this.wrapError(req.error, 'get', key))
    })
  }

  async set(key: string, value: unknown): Promise<void> {
    const db = await this.dbPromise
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.store, 'readwrite')
      const store = tx.objectStore(this.store)
      const req = store.put(value, key)
      req.onsuccess = () => resolve()
      req.onerror = () => reject(this.wrapError(req.error, 'set', key))
    })
  }

  async remove(key: string): Promise<void> {
    const db = await this.dbPromise
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.store, 'readwrite')
      const store = tx.objectStore(this.store)
      const req = store.delete(key)
      req.onsuccess = () => resolve()
      req.onerror = () => reject(this.wrapError(req.error, 'remove', key))
    })
  }

  async keys(): Promise<string[]> {
    const db = await this.dbPromise
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.store, 'readonly')
      const store = tx.objectStore(this.store)
      const req = store.getAllKeys()
      req.onsuccess = () => resolve(req.result as string[])
      req.onerror = () => reject(this.wrapError(req.error, 'keys'))
    })
  }

  async clear(): Promise<void> {
    const db = await this.dbPromise
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.store, 'readwrite')
      const store = tx.objectStore(this.store)
      const req = store.clear()
      req.onsuccess = () => resolve()
      req.onerror = () => reject(this.wrapError(req.error, 'clear'))
    })
  }

  // 主动释放连接
  close(): void {
    // 注意,dbPromise 可能在 pending,close 后再次操作会失败
    this.dbPromise.then((db) => db.close()).catch(() => {})
  }

  // 估算 IndexedDB 整体占用字节数(通过 navigator.storage.estimate)
  // 注意:返回的是整个 origin 在 OPFS+IDB+其它 storage 的总占用,非本 database 独占
  //   - 与 OPFSAdapter.estimatedQuotaUsage 行为对称,便于上层做统一的配额预警
  async estimatedQuotaUsage(): Promise<number | undefined> {
    if (typeof navigator !== 'undefined' && navigator.storage?.estimate) {
      const est = await navigator.storage.estimate()
      return est.usage ?? 0
    }
    return undefined
  }

  // 私有,包装 IndexedDB 错误为 StorageError
  protected wrapError(cause: unknown, op: string, key?: string): StorageError {
    if (cause instanceof Error && cause.name === 'QuotaExceededError') {
      return new StorageError(
        `IndexedDB quota exceeded in ${op}${key ? ` for key "${key}"` : ''}`,
        { cause, adapter: 'indexeddb', kind: 'quota' }
      )
    }
    return new StorageError(
      `IndexedDB ${op} failed${key ? ` for key "${key}"` : ''}`,
      { cause, adapter: 'indexeddb', kind: 'unknown' }
    )
  }
}
