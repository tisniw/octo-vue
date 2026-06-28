import { WsClientImpl } from './client'
import type { WsClient, WsClientConfig, WsManager } from './types'

/**
 * WS 管理器 — URL 单例
 */
export class WsManagerImpl implements WsManager {
  private connections = new Map<string, WsClient<unknown>>()

  /** 创建独立管理器 */
  static create(): WsManagerImpl {
    return new WsManagerImpl()
  }

  connect<T = unknown>(url: string, config?: WsClientConfig): WsClient<T> {
    const existing = this.connections.get(url)
    if (existing) return existing as WsClient<T>

    const client = new WsClientImpl<T>(url, config) as WsClient<unknown>
    this.connections.set(url, client)
    return client as WsClient<T>
  }

  close(url: string, code?: number, reason?: string): void {
    const client = this.connections.get(url)
    if (client) {
      client.close(code, reason)
      this.connections.delete(url)
    }
  }

  closeAll(code?: number, reason?: string): void {
    this.connections.forEach((client) => client.close(code, reason))
    this.connections.clear()
  }

  get size(): number {
    return this.connections.size
  }

  get urls(): string[] {
    return Array.from(this.connections.keys())
  }
}

/** 默认全局管理器 */
export const ws: WsManagerImpl = new WsManagerImpl()