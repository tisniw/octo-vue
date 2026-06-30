// @octovue/network 主入口
// 三个平铺命名空间:http / ws / sse
// 可选伞形聚合:network = { http, ws, sse }

import { http } from './protocols/http'
import { ws } from './protocols/ws'
import { sse } from './protocols/sse'

// ===== HTTP =====
export { HttpClient, http } from './protocols/http'
export type {
  HttpMethod,
  HttpResponseType,
  HttpRequestConfig,
  HttpClientConfig,
  HttpChain,
  HttpProgressEvent,
  BusinessResponse,
  UploadConfig,
  DownloadConfig,
} from './protocols/http'

// ===== WebSocket =====
export { WsManagerImpl, ws, WsClientImpl } from './protocols/ws'
export { jsonCodec, NO_RETRY_CLOSE_CODES } from './protocols/ws'
export type {
  WsClient,
  WsClientConfig,
  WsSubscription,
  WsReadyState,
  WsOutgoing,
  WsTextMessage,
  WsBinaryMessage,
  WsTypedMessage,
  WsCodec,
  WsReconnectConfig,
  WsHeartbeatConfig,
  WsQueueConfig,
  WsLifecycleEvent,
  WsLifecycleHandler,
  WsMessageHandler,
  WsAnyHandler,
  WsManager,
  WsRequestOptions,
  WsEventMap,
} from './protocols/ws'

// ===== SSE =====
export { SseConnectionPool, sse, createSseClient, SseClientImpl } from './protocols/sse'
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
  SseEventMap,
} from './protocols/sse'

// ===== 共享能力 =====
export {
  // 取消
  createCancelController,
  // 错误
  NetworkException,
  TimeoutError,
  CancelError,
  ServerError,
  ClientError,
  BusinessError,
  UnknownError,
  classifyError,
  RETRYABLE_STATUS,
  // 类型守卫
  isNetworkError,
  isNetworkException,
  isServerError,
  isClientError,
  isBusinessError,
  isUnknownError,
  isTimeoutError,
  isCancelError,
  // 超时/重试/去重
  TimeoutScheduler,
  resolveTimeout,
  withRetry,
  calculateDelay,
  defaultRetryConfig,
  DEFAULT_RETRYABLE_KINDS,
  DEFAULT_RETRYABLE_STATUS,
  RequestDedupeManager,
  getDedupeManager,
  disposeDedupeManager,
  generateIdentity,
  // 响应解包
  unwrapResponse,
  checkBusinessCode,
  unwrapBusinessResponse,
  // 转换器
  jsonRequestTransformer,
  formDataRequestTransformer,
  bigIntStringTransformer,
  timestampTransformer,
  bigIntParseTransformer,
  apiResponseUnwrap,
  // 拦截器
  createInterceptors,
  runRequestInterceptors,
  runResponseInterceptors,
  runErrorInterceptors,
  createTokenInterceptor,
  createDeviceInterceptor,
  createRequestLogInterceptor,
  createResponseLogInterceptor,
  createErrorHandlerInterceptor,
  registerBuiltinInterceptors,
  // 进度
  createProgressTracker,
  asAxiosProgress,
  // 文件传输
  uploadFile,
  uploadFiles,
  createUploadTask,
  downloadFile,
  createDownloadTask,
  triggerBrowserDownload,
  resumeDownload,
  httpPostForm,
  // 全局配置
  setHttpConfig,
  getHttpConfig,
} from './shared'

export type {
  HttpCancelController,
  TimeoutStack,
  RetryConfig,
  RequestIdentity,
  ApiResponse,
  BusinessData,
  RequestTransformer,
  ResponseTransformer,
  RequestInterceptor,
  ResponseInterceptor,
  ErrorInterceptor,
  InterceptorSet,
  HttpInterceptors,
  TemporaryInterceptors,
  TokenInterceptorConfig,
  DeviceInterceptorConfig,
  LogInterceptorConfig,
  ErrorHandlerInterceptorConfig,
  BuiltinInterceptorsConfig,
  ProgressEvent,
  ProgressCallback,
  ProgressTrackerConfig,
  ProgressSubscription,
  ProgressTracker,
  GlobalHttpConfig,
  BusinessCodeSemantics,
  StatusSemantics,
} from './shared'

export { NetworkError } from './types/error'
export type { ErrorKind } from './types/error'
export type {
  Awaitable,
  Nullable,
  Optional,
  AnyFn,
} from './types/utility'

// ===== 伞形聚合(单导入风格) =====
/**
 * 三个协议的伞形聚合入口
 *
 * @example
 * ```ts
 * import { network } from '@octovue/network'
 * network.http.get(url)
 * network.ws.connect('wss://...').on(...)
 * network.sse.acquire('/events').on(...)
 * ```
 */
export const network = {
  http,
  ws,
  sse,
} as const