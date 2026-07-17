import { WebStorageAdapter, type WebStorageAdapterOptions } from './webStorage'
import type { StorageAdapter } from './types'

// LocalStorage 适配器配置,继承 WebStorageAdapterOptions,固定 namespace 与 storage
export interface LocalStorageAdapterOptions
  extends Omit<WebStorageAdapterOptions, 'namespace' | 'storage' | 'adapterName'> {}

// LocalStorage 适配器内部类,固定 namespace='octovue:local' 与 window.localStorage 注入
class LocalStorageAdapter extends WebStorageAdapter {
  protected readonly storage: globalThis.Storage = window.localStorage
  protected readonly namespace = 'octovue:local'
  protected readonly adapterName = 'local' as const

  constructor() {
    // class field 在 super() 返回后才初始化,父类构造里的 rebuildIndex() 此时还看不到 namespace/storage
    // 显式 super 后再补一次 rebuildIndex,确保 keyIndex / currentBytes 反映真实数据
    super()
    this.rebuildIndex()
  }
}

/**
 * 浏览器 localStorage 适配器。
 * 同步,容量约 5MB,跨标签页共享,刷新不丢失,默认单例零配置无 maxBytes 限制
 */
export const localStorageAdapter: StorageAdapter = new LocalStorageAdapter()

/**
 * 创建带容量管理的 localStorage 适配器,超出 maxBytes 后按 LRU 自动淘汰最早未访问的条目
 */
export function createLocalStorageAdapter(
  options: LocalStorageAdapterOptions = {}
): StorageAdapter {
  return new (class extends WebStorageAdapter {
    protected readonly storage: globalThis.Storage = window.localStorage
    protected readonly namespace = 'octovue:local'
    protected readonly adapterName = 'local' as const

    constructor() {
      super(options)
      // 同上,super 后再 rebuild 一次
      this.rebuildIndex()
    }
  })()
}