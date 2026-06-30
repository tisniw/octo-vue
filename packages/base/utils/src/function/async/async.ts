/** 延时（返回 Promise，单位毫秒） */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export class TimeoutError extends Error {
  constructor(message = 'Operation timed out') {
    super(message)
    this.name = 'TimeoutError'
  }
}

/** 超时包装（超过 timeout 抛出 TimeoutError） */
export function withTimeout<T>(promise: Promise<T>, timeout: number): Promise<T> {
  return Promise.race([
    promise,
    sleep(timeout).then(() => Promise.reject(new TimeoutError())),
  ])
}

export interface RetryOptions {
  /** 最大尝试次数（含首次，默认 3） */
  retries?: number
  /** 重试间隔（毫秒，默认 100） */
  delay?: number
  /** 是否指数退避（默认 true，delay = delay * 2^attempt） */
  backoff?: boolean
  /** 谓词：返回 true 才重试（默认总是重试） */
  retryIf?: (error: unknown) => boolean
}

/** 重试一个返回 Promise 的函数 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const { retries = 3, delay = 100, backoff = true, retryIf } = options
  let lastError: unknown
  let currentDelay = delay

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      if (attempt === retries - 1) break
      if (retryIf && !retryIf(error)) break
      await sleep(currentDelay)
      if (backoff) currentDelay *= 2
    }
  }

  throw lastError
}

/** 并行（全部成功才返回，失败立即 reject） */
export function parallel<T>(tasks: Array<() => Promise<T>>): Promise<T[]> {
  return Promise.all(tasks.map((task) => task()))
}

/** 竞速（首个 settle 决定结果） */
export function race<T>(tasks: Array<() => Promise<T>>): Promise<T> {
  return Promise.race(tasks.map((task) => task()))
}

/** 全部 settle（永不 reject） */
export function allSettled<T>(
  tasks: Array<() => Promise<T>>
): Promise<
  Array<
    | { status: 'fulfilled'; value: T }
    | { status: 'rejected'; reason: unknown }
  >
> {
  return Promise.allSettled(tasks.map((task) => task())) as Promise<
    Array<
      | { status: 'fulfilled'; value: T }
      | { status: 'rejected'; reason: unknown }
    >
  >
}
