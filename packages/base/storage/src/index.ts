/**
 * @octovue/storage 主入口。
 * 聚合所有子模块,提供统一导入路径。
 */

// 共享类型(从 0.0.0)
export * from './shared/types'
export * from './shared/error'
export * from './shared/serializer'

// db 模块
export {
  localStorageAdapter,
  sessionStorageAdapter,
  createMemoryAdapter,
  getStorage,
  IndexedDBAdapter,
} from './db/index'
export type {
  StorageAdapter,
  WebStorageType,
  IndexedDBAdapterOptions,
  UpgradeCallback,
} from './db/index'

// cache 模块
export { LRUCache, TTLCache } from './cache/index'
export { memoize } from './cache/memoize'
export { memoizeAsync } from './cache/memoizeAsync'

// store 模块
export { createStore } from './store/createStore'
export { persistPlugin } from './store/persistPlugin'
export { resetStores, resetStore } from './store/reset'
export type {
  PersistOptions,
  StoreOptions,
} from './store/types'

// asset 模块
export { AssetStore, assetStore } from './asset/index'
export type {
  AssetStoreOptions,
  AssetInfo,
} from './asset/index'
