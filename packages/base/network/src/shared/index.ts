// 公共能力模块

// 取消
export { createCancelController } from './cancel'
export type { HttpCancelController } from './cancel'

// 超时
export { TimeoutScheduler, resolveTimeout } from './timeout'
export type { TimeoutStack } from './timeout'

// 重试
export {
  withRetry,
  calculateDelay,
  defaultRetryConfig,
  DEFAULT_RETRYABLE_KINDS,
  DEFAULT_RETRYABLE_STATUS,
} from './retry'
export type { RetryConfig } from './retry'

// 去重
export {
  RequestDedupeManager,
  getDedupeManager,
  disposeDedupeManager,
  generateIdentity,
} from './dedupe'
export type { RequestIdentity } from './dedupe'

// 错误体系
export {
  NetworkException,
  TimeoutError,
  CancelError,
  ServerError,
  ClientError,
  BusinessError,
  UnknownError,
  classifyError,
  RETRYABLE_STATUS,
} from './error'
export type { BusinessCodeSemantics, StatusSemantics } from './error'

// 类型守卫
export {
  isNetworkError,
  isNetworkException,
  isServerError,
  isClientError,
  isBusinessError,
  isUnknownError,
  isTimeoutError,
  isCancelError,
} from './error/guards'

// 响应解包
export { unwrapResponse, checkBusinessCode, unwrapBusinessResponse } from './response'
export type { ApiResponse, BusinessData } from './response'

// 数据转换器
export {
  jsonRequestTransformer,
  formDataRequestTransformer,
  bigIntStringTransformer,
  timestampTransformer,
  bigIntParseTransformer,
  apiResponseUnwrap,
} from './response/transformers'
export type { RequestTransformer, ResponseTransformer } from './response/transformers'

// 拦截器
export {
  createInterceptors,
  runRequestInterceptors,
  runResponseInterceptors,
  runErrorInterceptors,
} from './interceptors'
export type {
  RequestInterceptor,
  ResponseInterceptor,
  ErrorInterceptor,
  InterceptorSet,
  HttpInterceptors,
  TemporaryInterceptors,
} from './interceptors'

// 内置拦截器
export {
  createTokenInterceptor,
  createDeviceInterceptor,
  createRequestLogInterceptor,
  createResponseLogInterceptor,
  createErrorHandlerInterceptor,
  registerBuiltinInterceptors,
} from './interceptors/builtin'
export type {
  TokenInterceptorConfig,
  DeviceInterceptorConfig,
  LogInterceptorConfig,
  ErrorHandlerInterceptorConfig,
  BuiltinInterceptorsConfig,
} from './interceptors/builtin'

// 全局配置
export { setHttpConfig, getHttpConfig } from './inject'
export type { GlobalHttpConfig } from './inject'

// 进度
export { createProgressTracker, asAxiosProgress } from './progress'
export type {
  ProgressEvent,
  ProgressCallback,
  ProgressTrackerConfig,
  ProgressSubscription,
  ProgressTracker,
} from './progress'

// 文件传输
export {
  uploadFile,
  uploadFiles,
  downloadFile,
  downloadAndSave,
  triggerBrowserDownload,
  createUploadTask,
  createDownloadTask,
} from './transfer'
export type { UploadConfig, DownloadConfig } from './transfer'