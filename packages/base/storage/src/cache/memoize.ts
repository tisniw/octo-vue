// 同步函数记忆化,默认按 JSON.stringify(args) 作为 key,可选 keyResolver 自定义
export function memoize<Args extends any[], R>(
  fn: (...args: Args) => R,
  keyResolver?: (...args: Args) => string
): (...args: Args) => R {
  const cache = new Map<string, R>()

  return function memoized(...args: Args): R {
    const key = keyResolver
      ? keyResolver(...args)
      : JSON.stringify(args)

    if (cache.has(key)) {
      return cache.get(key)!
    }

    const result = fn(...args)
    cache.set(key, result)
    return result
  }
}
