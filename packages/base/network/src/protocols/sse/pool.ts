import { SseClientImpl } from './client'
import type {
  ISseConnectionPool,
  SseClient,
  SseClientConfig,
} from './types'

/**
 * SSE 连接池 — URL 单例 + 引用计数
 */
export class SseConnectionPool implements ISseConnectionPool {
  private connections = new Map<string, {
    client: SseClient<unknown>
    refCount: number
    config?: SseClientConfig
  }>()

  /** 创建独立池 */
  static create(): SseConnectionPool {
    return new SseConnectionPool()
  }

  acquire<T = unknown>(url: string, config?: SseClientConfig): SseClient<T> {
    const existing = this.connections.get(url)
    if (existing) {
      existing.refCount++
      return existing.client as SseClient<T>
    }
    const client = new SseClientImpl<T>(url, config) as SseClient<unknown>
    this.connections.set(url, { client, refCount: 1, config })
    return client as SseClient<T>
  }

  release(url: string): void {
    const entry = this.connections.get(url)
    if (!entry) return
    entry.refCount--
    if (entry.refCount <= 0) {
      entry.client.close()
      this.connections.delete(url)
    }
  }

  close(url: string): void {
    const entry = this.connections.get(url)
    if (!entry) return
    entry.client.close()
    this.connections.delete(url)
  }

  closeAll(): void {
    this.connections.forEach((entry) => entry.client.close())
    this.connections.clear()
  }

  get size(): number {
    return this.connections.size
  }

  get urls(): string[] {
    return Array.from(this.connections.keys())
  }
}

/** 默认全局连接池 */
export const sse: SseConnectionPool = new SseConnectionPool()