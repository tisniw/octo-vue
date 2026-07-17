import { WebStorageAdapter, type WebStorageAdapterOptions } from './webStorage'
import type { StorageAdapter } from './types'

// SessionStorage 适配器配置,继承 WebStorageAdapterOptions,固定 namespace 与 storage
export interface SessionStorageAdapterOptions
  extends Omit<WebStorageAdapterOptions, 'namespace' | 'storage' | 'adapterName'> {}

// SessionStorage 适配器内部类,固定 namespace='octovue:session' 与 window.sessionStorage 注入
class SessionStorageAdapter extends WebStorageAdapter {
  protected readonly storage: globalThis.Storage = window.sessionStorage
  protected readonly namespace = 'octovue:session'
  protected readonly adapterName = 'session' as const

  constructor() {
    // class field 在 super() 返回后才初始化,父类构造里的 rebuildIndex() 此时还看不到 namespace/storage
    // 显式 super 后再补一次 rebuildIndex,确保 keyIndex / currentBytes 反映真实数据
    super()
    this.rebuildIndex()
  }
}

/**
 * 浏览器 sessionStorage 适配器。
 * 同步,容量约 5MB,仅当前标签页有效,默认单例零配置无 maxBytes 限制
 */
export const sessionStorageAdapter: StorageAdapter = new SessionStorageAdapter()

/**
 * 创建带容量管理的 sessionStorage 适配器,超出 maxBytes 后按 LRU 自动淘汰最早未访问的条目
 */
export function createSessionStorageAdapter(
  options: SessionStorageAdapterOptions = {}
): StorageAdapter {
  return new (class extends WebStorageAdapter {
    protected readonly storage: globalThis.Storage = window.sessionStorage
    protected readonly namespace = 'octovue:session'
    protected readonly adapterName = 'session' as const

    constructor() {
      super(options)
      // 同上,super 后再 rebuild 一次
      this.rebuildIndex()
    }
  })()
}