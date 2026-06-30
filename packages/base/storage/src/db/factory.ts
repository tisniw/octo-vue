import { IndexedDBAdapter } from './indexedDB'
import { localStorageAdapter } from './localStorage'
import { createMemoryAdapter } from './memory'
import { sessionStorageAdapter } from './sessionStorage'
import { WebStorageAdapter } from './webStorage'
import type { StorageAdapter, WebStorageType } from './types'
import { jsonSerializer } from '../shared/serializer'
import type { Serializer } from '../shared/serializer'

/** 获取默认适配器实例。
 * - 'local' / 'session' 返回模块级单例
 * - 'memory' 每次返回新实例
 * - 'indexeddb' 返回默认配置的 IndexedDBAdapter 新实例
 */
export function getStorage(type: 'local'): StorageAdapter
export function getStorage(type: 'session'): StorageAdapter
export function getStorage(type: 'memory'): StorageAdapter
export function getStorage(type: 'indexeddb'): IndexedDBAdapter
export function getStorage(
  type: WebStorageType | 'indexeddb'
): StorageAdapter | IndexedDBAdapter {
  switch (type) {
    case 'local':
      return localStorageAdapter
    case 'session':
      return sessionStorageAdapter
    case 'memory':
      return createMemoryAdapter()
    case 'indexeddb':
      return new IndexedDBAdapter({ name: 'octovue-storage', store: 'kv', version: 1 })
  }
}

/** 创建自定义 WebStorage 适配器 */
export function createWebStorageAdapter(options: {
  storage: globalThis.Storage
  namespace: string
  adapterName: 'local' | 'session'
  serializer?: Serializer
}): StorageAdapter {
  class CustomAdapter extends WebStorageAdapter {
    protected readonly storage = options.storage
    protected readonly namespace = options.namespace
    protected readonly adapterName = options.adapterName
    protected readonly serializer: Serializer = options.serializer ?? jsonSerializer
  }

  return new CustomAdapter()
}
