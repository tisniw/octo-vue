// @octovue/storage 主入口,聚合所有子模块提供统一导入路径

// 共享层
export * from './shared'

// db 模块
export {
  localStorageAdapter,
  createLocalStorageAdapter,
  sessionStorageAdapter,
  createSessionStorageAdapter,
  createMemoryAdapter,
  getStorage,
  createWebStorageAdapter,
  IndexedDBAdapter,
  OPFSAdapter,
  FSAAdapter,
  saveDirectoryHandle,
  loadDirectoryHandle,
  clearDirectoryHandle,
  isFSAHandlePersistenceAvailable,
  createBlobAdapter,
  resolveBlobBackendType,
  detectBestBlobBackend,
  isOPFSAvailable,
  isFSAAvailable,
} from './db/index'
export type {
  StorageAdapter,
  WebStorageType,
  IndexedDBAdapterOptions,
  UpgradeCallback,
  WebStorageAdapterOptions,
  LocalStorageAdapterOptions,
  SessionStorageAdapterOptions,
  OPFSAdapterOptions,
  FSAAdapterOptions,
  PersistedDirectoryHandle,
  BlobBackendType,
  CreateBlobAdapterOptions,
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
export {
  AssetStore,
  assetStore,
  type AssetStoreOptions,
  type AssetInfo,
  type DirectoryBindingInfo,
} from './asset/index'
