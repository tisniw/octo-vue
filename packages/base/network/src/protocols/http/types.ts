import type { RetryConfig } from '../../shared/retry'
import type { TemporaryInterceptors } from '../../shared/interceptors'
import type { ProgressCallback } from '../../shared/progress'

/** HTTP 方法 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS'

/** 响应类型 */
export type HttpResponseType = 'json' | 'text' | 'blob' | 'arraybuffer' | 'stream'

/** 单次请求配置 */
export interface HttpRequestConfig {
  /** 完整 URL(由调用方传入,client 内部读取) */
  url?: string
  /** HTTP 方法(由调用方传入,client 内部读取) */
  method?: HttpMethod
  baseURL?: string
  params?: Record<string, unknown>
  headers?: Record<string, string>
  timeout?: number
  withCredentials?: boolean
  responseType?: HttpResponseType
  signal?: AbortSignal
  /** 请求体(POST/PUT/PATCH 用) */
  data?: unknown
  /** 是否启用去重(默认 true) */
  dedupe?: boolean
  /** 重试配置(覆盖客户端默认) */
  retry?: RetryConfig
  /** 临时拦截器(单次请求作用域) */
  interceptors?: TemporaryInterceptors
  /** 上传进度回调 */
  onUploadProgress?: ProgressCallback
  /** 下载进度回调 */
  onDownloadProgress?: ProgressCallback
  /** 大数字处理模式 */
  bigIntMode?: 'native' | 'string' | false
  /** 请求数据转换钩子 */
  transformRequest?: ((data: unknown) => unknown) | ((data: unknown) => unknown)[]
  /** 响应数据转换钩子 */
  transformResponse?: ((data: unknown) => unknown) | ((data: unknown) => unknown)[]
}

/** 客户端配置 */
export interface HttpClientConfig {
  baseURL?: string
  timeout?: number
  headers?: Record<string, string>
  withCredentials?: boolean
  retry?: RetryConfig
  dedupe?: boolean
}

/** 业务响应(双层解包) */
export interface BusinessResponse<T = unknown> {
  code: number
  message: string
  data: T
  [key: string]: unknown
}

/** 进度事件 */
export interface HttpProgressEvent {
  loaded: number
  total: number
  ratio: number
}

/** 上传配置 */
export interface UploadConfig extends HttpRequestConfig {
  fields?: Record<string, unknown>
  fieldName?: string
  buildFormData?: (form: FormData) => void
}

/** 下载配置 */
export interface DownloadConfig extends HttpRequestConfig {
  responseType?: 'blob' | 'arraybuffer'
  rangeStart?: number
  rangeEnd?: number
}

/** 内部 HTTP 请求配置(扩展 axios AxiosRequestConfig) */
export interface InternalHttpRequestConfig {
  url?: string
  method?: string
  baseURL?: string
  params?: Record<string, unknown>
  headers?: Record<string, string>
  data?: unknown
  timeout?: number
  withCredentials?: boolean
  responseType?: HttpResponseType
  signal?: AbortSignal
  onUploadProgress?: (event: { loaded: number; total?: number }) => void
  onDownloadProgress?: (event: { loaded: number; total?: number }) => void
  // 用户配置的元数据
  _meta?: {
    dedupe?: boolean
    retry?: RetryConfig
    interceptors?: TemporaryInterceptors
    transformRequest?: HttpRequestConfig['transformRequest']
    transformResponse?: HttpRequestConfig['transformResponse']
    bigIntMode?: HttpRequestConfig['bigIntMode']
  }
}

/** 链式构造器(泛型推断响应类型) */
export interface HttpChain<T = unknown> {
  url(url: string): HttpChain<T>
  baseURL(base: string): HttpChain<T>
  header(key: string, value: string): HttpChain<T>
  headers(headers: Record<string, string>): HttpChain<T>
  param(key: string, value: unknown): HttpChain<T>
  params(params: Record<string, unknown>): HttpChain<T>
  data(data: unknown): HttpChain<T>
  timeout(ms: number): HttpChain<T>
  responseType(type: HttpResponseType): HttpChain<T>
  send(): Promise<T>
  /** 取消请求(在 send() 之后调用) */
  cancel(reason?: string): void
}