import type { NetworkError } from '../../types/error'

/** SSE 就绪状态 */
export type SseReadyState = 'connecting' | 'open' | 'closed' | 'reconnecting'

/** 订阅句柄 */
export interface SseSubscription {
  unsubscribe(): void
}

/** 原始事件 */
export interface SseRawEvent {
  id?: string
  event?: string
  data: string
}

/** 事件处理器 */
export type SseEventHandler<T = unknown> = (data: T, event: SseRawEvent) => void

/** 生命周期处理器 */
export type SseLifecycleHandler<T = void> = (data: T) => void

/** 自动重连配置 */
export interface SseReconnectConfig {
  enabled?: boolean
  maxRetries?: number
  baseDelay?: number
  maxDelay?: number
  jitter?: boolean
  noRetryOn?: (error: NetworkError) => boolean
}

/** 心跳配置 */
export interface SseHeartbeatConfig {
  timeout?: number
  eventName?: string
  onComment?: boolean
  onTimeout?: (lastEventId: string | undefined) => void
}

/** 客户端配置 */
export interface SseClientConfig {
  params?: Record<string, string | number>
  withCredentials?: boolean
  reconnect?: SseReconnectConfig
  heartbeat?: SseHeartbeatConfig
  dataParser?: (raw: string) => unknown
  resumeFrom?: string
  resumeParam?: string
}

/** SSE 客户端接口 */
export interface SseClient<T = unknown> {
  on(event: string, handler: SseEventHandler<unknown>): SseSubscription
  onMessage(handler: SseEventHandler<T>): SseSubscription
  on(event: 'open' | 'error' | 'reconnect', handler: SseLifecycleHandler): SseSubscription
  close(): void
  pause(): void
  resume(): void
  readonly readyState: SseReadyState
  readonly lastEventId: string | undefined
}

/** 连接池接口 */
export interface ISseConnectionPool {
  acquire<T = unknown>(url: string, config?: SseClientConfig): SseClient<T>
  release(url: string): void
  close(url: string): void
  closeAll(): void
  readonly size: number
  readonly urls: string[]
}