import { NetworkError } from '../../types/error'
import type { ErrorKind } from '../../types/error'

/** 网络异常(连接失败 / DNS 错误 / CORS) */
export class NetworkException extends NetworkError {
  readonly kind = 'network' as const
  constructor(message: string = 'Network error', options?: { cause?: unknown }) {
    super(message, options)
  }
}

/** 请求超时(可重试) */
export class TimeoutError extends NetworkError {
  readonly kind = 'timeout' as const
  readonly timeout: number
  constructor(message: string = 'Request timeout', timeout: number = 0, options?: { cause?: unknown }) {
    super(message, options)
    this.timeout = timeout
  }
}

/** 主动取消(不可重试) */
export class CancelError extends NetworkError {
  readonly kind = 'cancel' as const
  constructor(message: string = 'Request cancelled', options?: { cause?: unknown }) {
    super(message, options)
  }
}

/** 服务端错误(5xx,可重试) */
export class ServerError extends NetworkError {
  readonly kind = 'server' as const
  readonly status: number
  readonly body?: unknown
  constructor(message: string, status: number, body?: unknown, options?: { cause?: unknown }) {
    super(message, options)
    this.status = status
    this.body = body
  }
}

/** 客户端错误(4xx,非业务码,不可重试) */
export class ClientError extends NetworkError {
  readonly kind = 'client' as const
  readonly status: number
  readonly body?: unknown
  constructor(message: string, status: number, body?: unknown, options?: { cause?: unknown }) {
    super(message, options)
    this.status = status
    this.body = body
  }
}

/** 业务错误(code !== success,可按业务决定是否重试) */
export class BusinessError extends NetworkError {
  readonly kind = 'business' as const
  readonly code: number
  readonly data?: unknown
  constructor(message: string, code: number, data?: unknown, options?: { cause?: unknown }) {
    super(message, options)
    this.code = code
    this.data = data
  }
}

/** 兜底错误(解析失败 / 未知异常) */
export class UnknownError extends NetworkError {
  readonly kind = 'unknown' as const
  constructor(message: string = 'Unknown error', options?: { cause?: unknown }) {
    super(message, options)
  }
}

/** 业务码语义 */
export interface BusinessCodeSemantics {
  success: number
  unauthorized?: number
  tokenExpired?: number
  forbidden?: number
}

/** 状态码语义 */
export interface StatusSemantics {
  success?: number[]
  statusMap?: Record<number, () => NetworkError>
}

/** 错误工厂:根据 axios 错误统一归类 */
export function classifyError(err: unknown, semantics?: BusinessCodeSemantics): NetworkError {
  if (err instanceof NetworkError) return err

  if (err instanceof Error) {
    // 超时
    if (err.message?.includes('timeout') || err.message?.includes('ETIMEDOUT')) {
      return new TimeoutError(err.message, 0, { cause: err })
    }
    // 网络错误
    if (err.message?.includes('Network Error') || err.message?.includes('ECONNREFUSED')) {
      return new NetworkException(err.message, { cause: err })
    }
    // 取消
    if (err.message?.includes('cancelled') || err.message?.includes('aborted')) {
      return new CancelError(err.message, { cause: err })
    }
  }

  // axios 错误对象
  const axiosError = err as { response?: { status: number; data?: unknown }; request?: unknown }
  if (axiosError.response) {
    const { status, data } = axiosError.response
    if (status >= 500) {
      return new ServerError(`Server error ${status}`, status, data, { cause: err })
    }
    if (status >= 400) {
      return new ClientError(`Client error ${status}`, status, data, { cause: err })
    }
  }

  return new UnknownError(err instanceof Error ? err.message : 'Unknown error', { cause: err })
}

/** 默认可重试的 HTTP 状态码 */
export const RETRYABLE_STATUS: ReadonlyArray<number> = [408, 425, 429, 500, 502, 503, 504]