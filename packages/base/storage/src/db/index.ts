export { localStorageAdapter } from './localStorage'
export { sessionStorageAdapter } from './sessionStorage'
export { createMemoryAdapter } from './memory'
export { getStorage, createWebStorageAdapter } from './factory'
export { IndexedDBAdapter } from './indexedDB'
export type {
  StorageAdapter,
  WebStorageType,
  IndexedDBAdapterOptions,
  UpgradeCallback,
} from './types'
