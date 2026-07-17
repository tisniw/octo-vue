import { IndexedDBAdapter } from './indexedDB'
import { localStorageAdapter } from './localStorage'
import { createMemoryAdapter } from './memory'
import { OPFSAdapter, type OPFSAdapterOptions } from './opfs'
import { sessionStorageAdapter } from './sessionStorage'
import { WebStorageAdapter } from './webStorage'
import type { StorageAdapter, WebStorageType, IndexedDBAdapterOptions } from './types'
import type { Serializer } from '../shared/serializer'

/**
 * 获取默认适配器实例。
 * - 'local' / 'session' 返回模块级单例
 * - 'memory' 每次返回新实例
 * - 'indexeddb' 返回默认配置的 IndexedDBAdapter 新实例
 * - 'opfs' 返回默认 rootName='octovue-storage' 的 OPFSAdapter 新实例
 */
export function getStorage(type: 'local'): StorageAdapter
export function getStorage(type: 'session'): StorageAdapter
export function getStorage(type: 'memory'): StorageAdapter
export function getStorage(type: 'indexeddb'): IndexedDBAdapter
export function getStorage(type: 'indexeddb', options: IndexedDBAdapterOptions): IndexedDBAdapter
export function getStorage(type: 'opfs'): OPFSAdapter
export function getStorage(type: 'opfs', options: OPFSAdapterOptions): OPFSAdapter
export function getStorage(
  type: WebStorageType | 'indexeddb' | 'opfs',
  // 不同 backend 对应不同 options,JS 不会因 type 字段做 union narrowing,
  //   业务方需按 type 传对应 options;TS 重载在调用点已经约束过,这里是联合签名
  options?: IndexedDBAdapterOptions | OPFSAdapterOptions,
): StorageAdapter | IndexedDBAdapter | OPFSAdapter {
  switch (type) {
    case 'local':
      return localStorageAdapter
    case 'session':
      return sessionStorageAdapter
    case 'memory':
      return createMemoryAdapter()
    case 'indexeddb':
      return new IndexedDBAdapter(
        (options as IndexedDBAdapterOptions | undefined) ?? {
          name: 'octovue-storage',
          store: 'kv',
          version: 1,
        },
      )
    case 'opfs':
      return new OPFSAdapter((options as OPFSAdapterOptions | undefined) ?? {})
  }
}

// 创建自定义 WebStorage 适配器
export function createWebStorageAdapter(options: {
  storage: globalThis.Storage
  namespace: string
  adapterName: 'local' | 'session'
  serializer?: Serializer
  // 容量上限,字节,0 或 undefined 表示不限制,超出后按 LRU 淘汰
  maxBytes?: number
}): StorageAdapter {
  class CustomAdapter extends WebStorageAdapter {
    // 抽象字段,父类要求子类声明,实际值通过 Object.assign 在构造后注入
    protected readonly storage!: globalThis.Storage
    protected readonly namespace!: string
    protected readonly adapterName!: 'local' | 'session'

    constructor() {
      super({
        serializer: options.serializer,
        maxBytes: options.maxBytes,
      })
      // readonly 字段需在构造后赋值,用 unknown 桥接绕过 readonly 限制
      Object.assign(this as unknown as Record<string, unknown>, {
        storage: options.storage,
        namespace: options.namespace,
        adapterName: options.adapterName,
      })
      // 注入完毕后重建索引,子类字段已就绪
      this.rebuildIndex()
    }
  }

  return new CustomAdapter()
}
