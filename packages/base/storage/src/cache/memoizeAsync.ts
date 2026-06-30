import { LRUCache } from './LRU'

/**
 * 异步函数按 TTL 记忆化。
 * 并发请求共享同一 Promise,避免竞态。
 */
export function memoizeAsync<Args extends any[], R>(
  fn: (...args: Args) => Promise<R>,
  ttl: number,
  maxSize: number
): (...args: Args) => Promise<R> {
  const resultCache = new LRUCache<string, { value: R; expires: number }>(maxSize)
  const inflight = new Map<string, Promise<R>>()

  return function memoized(...args: Args): Promise<R> {
    const key = JSON.stringify(args)
    const now = Date.now()

    // 1. 已缓存的已完成值
    const cached = resultCache.get(key)
    if (cached && now < cached.expires) {
      return Promise.resolve(cached.value)
    }

    // 2. 正在 in-flight 的请求(避免重复发起)
    const pending = inflight.get(key)
    if (pending) {
      return pending
    }

    // 3. 发起新请求,并登记 in-flight
    const promise = fn(...args)
      .then((value) => {
        resultCache.set(key, { value, expires: now + ttl })
        inflight.delete(key)
        return value
      })
      .catch((err) => {
        inflight.delete(key)
        throw err
      })

    inflight.set(key, promise)
    return promise
  }
}
