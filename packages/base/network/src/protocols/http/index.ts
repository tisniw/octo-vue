// HTTP 协议模块入口
export { HttpClient, http } from './client'
export { InternalHttpClient } from './pipeline'
export { createChainBuilder } from './chain'
export {
  all,
  any,
  allSettled,
  sequence,
  map,
  concurrent,
} from './concurrent'
export type { SettledResult } from './concurrent'
export { upload, download, downloadAndSave } from './transfer'

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
  InternalHttpRequestConfig,
} from './types'

// 共享能力 re-export
export {
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
  isNetworkError,
  isTimeoutError,
  isCancelError,
  isServerError,
  isClientError,
  isBusinessError,
  isUnknownError,
  // 取消/超时/重试/去重
  createCancelController,
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
  // 进度
  createProgressTracker,
  asAxiosProgress,
  // 全局配置
  setHttpConfig,
  getHttpConfig,
} from '../../shared'

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
} from '../../shared'