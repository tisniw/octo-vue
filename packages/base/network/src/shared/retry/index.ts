import { NetworkError } from '../../types/error'
import type { ErrorKind } from '../../types/error'
import { RETRYABLE_STATUS as RETRYABLE_STATUS_ARR } from '../error'

/** 重试配置 */
export interface RetryConfig {
  /** 最大重试次数,默认 3 */
  maxRetries?: number
  /** 基础延迟(ms),默认 1000 */
  baseDelay?: number
  /** 最大延迟(ms),默认 30000 */
  maxDelay?: number
  /** 是否启用抖动,默认 true */
  jitter?: boolean
  /** 按 HTTP 状态码决定是否重试,默认仅 5xx */
  retryOnStatus?: (status: number) => boolean
  /** 按错误类型决定是否重试,默认仅 network / timeout / server */
  retryOnError?: (kind: ErrorKind) => boolean
}

/** 默认可重试的错误类型 */
export const DEFAULT_RETRYABLE_KINDS: ReadonlySet<ErrorKind> = new Set<ErrorKind>([
  'network',
  'timeout',
  'server',
])

/** 默认可重试的 HTTP 状态码(从 error 模块引用单一来源) */
export const DEFAULT_RETRYABLE_STATUS: ReadonlySet<number> = new Set<number>(
  RETRYABLE_STATUS_ARR
)

/** 默认重试配置 */
export const defaultRetryConfig: Required<RetryConfig> = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 30000,
  jitter: true,
  retryOnStatus: (status: number) => DEFAULT_RETRYABLE_STATUS.has(status),
  retryOnError: (kind: ErrorKind) => DEFAULT_RETRYABLE_KINDS.has(kind),
}

/** 计算退避延迟(指数退避 + 抖动) */
export function calculateDelay(
  attempt: number,
  config: Pick<Required<RetryConfig>, 'baseDelay' | 'maxDelay' | 'jitter'>
): number {
  let delay = Math.min(config.baseDelay * Math.pow(2, attempt), config.maxDelay)
  if (config.jitter) {
    delay = Math.random() * delay
  }
  return Math.floor(delay)
}

/** 从错误中提取 ErrorKind */
function extractErrorKind(error: unknown): ErrorKind | undefined {
  if (error instanceof NetworkError) {
    return error.kind
  }
  return undefined
}

/** 从错误中提取 HTTP 状态码 */
function extractStatus(error: unknown): number | undefined {
  if (error instanceof NetworkError && 'status' in error) {
    return Number((error as { status: unknown }).status)
  }
  if (typeof error === 'object' && error !== null && 'status' in error) {
    const status = (error as { status: unknown }).status
    if (typeof status === 'number') return status
  }
  return undefined
}

/** 重试执行器 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = {},
  onRetry?: (attempt: number, delay: number, error: unknown) => void
): Promise<T> {
  const merged = { ...defaultRetryConfig, ...config }
  let lastError: unknown

  for (let attempt = 0; attempt <= merged.maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      if (attempt >= merged.maxRetries) break

      const kind = extractErrorKind(error)
      const status = extractStatus(error)

      const shouldRetry =
        (kind !== undefined && merged.retryOnError(kind)) ||
        (status !== undefined && merged.retryOnStatus(status))

      if (!shouldRetry) throw error

      const delay = calculateDelay(attempt, merged)
      onRetry?.(attempt, delay, error)
      await sleep(delay)
    }
  }

  throw lastError
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}