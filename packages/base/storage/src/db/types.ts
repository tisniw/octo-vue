import type { MaybePromise, StorageValue } from '../shared/types'

/**
 * 统一键值存储接口。
 * 同步(local / session / memory)与异步(indexeddb)实现共享同一份契约。
 */
export interface StorageAdapter<T extends StorageValue = StorageValue> {
  /** 取值;不存在时返回 undefined */
  get<V extends T = T>(key: string): MaybePromise<V | undefined>

  /** 写入 */
  set(key: string, value: T): MaybePromise<void>

  /** 删除单个 key */
  remove(key: string): MaybePromise<void>

  /** 列出所有 key */
  keys(): MaybePromise<string[]>

  /** 清空全部 */
  clear(): MaybePromise<void>
}

/** 适配器类型联合(Web Storage + Memory) */
export type WebStorageType = 'local' | 'session' | 'memory'

/** IndexedDB 适配器构造函数选项 */
export interface IndexedDBAdapterOptions {
  /** 数据库名(默认 'octovue-storage') */
  name?: string
  /** object store 名(默认 'kv') */
  store?: string
  /** 数据库版本,触发 onupgradeneeded 时升级(默认 1) */
  version?: number
  /**
   * upgrade 回调。
   * 首次打开或 version 提升时调用,用于建表 / 加索引。
   * 业务方在此声明 store schema。
   */
  upgrade?: (db: IDBDatabase, oldVersion: number) => void
}

/** upgrade 回调签名 */
export type UpgradeCallback = (db: IDBDatabase, oldVersion: number) => void
