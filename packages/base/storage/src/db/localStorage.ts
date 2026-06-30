import { WebStorageAdapter } from './webStorage'
import type { StorageAdapter } from './types'

class LocalStorageAdapter extends WebStorageAdapter {
  protected readonly storage: globalThis.Storage = window.localStorage
  protected readonly namespace = 'octovue:local'
  protected readonly adapterName = 'local' as const
}

/**
 * 浏览器 localStorage 适配器。
 * 同步,容量约 5MB,跨标签页共享,刷新不丢失。
 */
export const localStorageAdapter: StorageAdapter = new LocalStorageAdapter()
