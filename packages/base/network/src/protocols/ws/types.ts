/** WS 就绪状态 */
export type WsReadyState =
  | 'init'
  | 'connecting'
  | 'open'
  | 'closing'
  | 'closed'
  | 'reconnecting'

/** 订阅句柄 */
export interface WsSubscription {
  unsubscribe(): void
}

/** 文本消息 */
export interface WsTextMessage {
  kind: 'text'
  data: string
}

/** 二进制消息 */
export interface WsBinaryMessage {
  kind: 'binary'
  data: ArrayBuffer | Blob
}

/** 类型化消息 */
export interface WsTypedMessage<T = unknown> {
  kind: 'typed'
  type: string
  data: T
  requestId?: string
}

/** 出站消息 */
export type WsOutgoing = WsTextMessage | WsBinaryMessage | WsTypedMessage

/** 生命周期事件 */
export interface WsLifecycleEvent {
  code?: number
  reason?: string
  attempt?: number
  delay?: number
}

/** 消息处理器 */
export type WsMessageHandler<T = unknown> = (message: T) => void

/** 任意消息处理器 */
export type WsAnyHandler = (message: WsTypedMessage, raw: MessageEvent) => void

/** 生命周期处理器 */
export type WsLifecycleHandler<T = void> = (data: T) => void

/** 重连配置 */
export interface WsReconnectConfig {
  enabled?: boolean
  maxRetries?: number
  baseDelay?: number
  maxDelay?: number
  jitter?: boolean
  noRetryCodes?: number[]
}

/** 心跳配置 */
export interface WsHeartbeatConfig {
  interval?: number
  payload?: WsOutgoing
  timeout?: number
  onTimeout?: () => void
}

/** 消息队列配置 */
export interface WsQueueConfig {
  enabled?: boolean
  maxSize?: number
  overflowStrategy?: 'drop' | 'throw'
}

/** 编解码器 */
export interface WsCodec {
  encode(message: WsTypedMessage): ArrayBuffer | string
  decode(raw: string | ArrayBuffer | Blob): Promise<WsTypedMessage>
}

/** 客户端配置 */
export interface WsClientConfig {
  reconnect?: WsReconnectConfig
  heartbeat?: WsHeartbeatConfig
  queue?: WsQueueConfig
  codec?: WsCodec
  protocols?: string | string[]
}

/** WS 客户端接口 */
export interface WsClient<T = unknown> {
  on(type: string, handler: WsMessageHandler<unknown>): WsSubscription
  onAny(handler: WsAnyHandler): WsSubscription
  on(event: 'open' | 'close' | 'error' | 'reconnect', handler: WsLifecycleHandler): WsSubscription
  send(message: WsOutgoing): void
  request<TResp, TReq = unknown>(
    type: string,
    data: TReq,
    options?: { timeout?: number; requestId?: string }
  ): Promise<TResp>
  close(code?: number, reason?: string): void
  pause(): void
  resume(): void
  readonly readyState: WsReadyState
}

/** 请求-响应选项 */
export interface WsRequestOptions {
  timeout?: number
  requestId?: string
}

/** 不触发重连的关闭码 */
export const NO_RETRY_CLOSE_CODES: ReadonlyArray<number> = [1000, 1001, 4001, 4003]

/** WS 管理器接口 */
export interface WsManager {
  connect<T = unknown>(url: string, config?: WsClientConfig): WsClient<T>
  close(url: string, code?: number, reason?: string): void
  closeAll(code?: number, reason?: string): void
  readonly size: number
  readonly urls: string[]
}