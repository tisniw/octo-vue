import { WebStorageAdapter } from './webStorage'
import type { StorageAdapter } from './types'

class SessionStorageAdapter extends WebStorageAdapter {
  protected readonly storage: globalThis.Storage = window.sessionStorage
  protected readonly namespace = 'octovue:session'
  protected readonly adapterName = 'session' as const
}

/**
 * 浏览器 sessionStorage 适配器。
 * 同步,容量约 5MB,仅当前标签页有效。
 */
export const sessionStorageAdapter: StorageAdapter = new SessionStorageAdapter()
