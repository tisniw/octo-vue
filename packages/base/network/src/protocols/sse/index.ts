// SSE 协议模块入口
export { SseClientImpl, createSseClient } from './client'
export { SseConnectionPool, sse } from './pool'

export type {
  SseClient,
  SseClientConfig,
  SseSubscription,
  SseReadyState,
  SseEventHandler,
  SseLifecycleHandler,
  SseRawEvent,
  SseReconnectConfig,
  SseHeartbeatConfig,
  ISseConnectionPool,
} from './types'