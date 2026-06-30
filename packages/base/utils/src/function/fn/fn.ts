import type { AnyFn } from '../../shared/types.js'

export interface DebounceOptions {
  /** 等待时间（毫秒，默认 200） */
  wait?: number
  /** 是否在等待期前触发（默认 false，leading-edge 不触发） */
  leading?: boolean
  /** 是否在等待期后触发（默认 true） */
  trailing?: boolean
}

export interface DebouncedFn<T extends AnyFn> {
  (...args: Parameters<T>): void
  cancel(): void
  flush(): void
  pending(): boolean
}

/**
 * 防抖
 * 默认 trailing 触发，leading 不触发。
 */
export function debounce<T extends AnyFn>(
  fn: T,
  wait = 200,
  options: DebounceOptions = {}
): DebouncedFn<T> {
  const { leading = false, trailing = true } = options
  let timer: ReturnType<typeof setTimeout> | null = null
  let lastArgs: Parameters<T> | null = null

  function invoke() {
    if (lastArgs) {
      fn(...lastArgs)
      lastArgs = null
    }
  }

  function startTimer() {
    timer = setTimeout(() => {
      timer = null
      if (trailing && lastArgs) invoke()
    }, wait)
  }

  const debounced = (...args: Parameters<T>) => {
    lastArgs = args
    if (timer) {
      return
    }
    if (leading) {
      fn(...args)
      startTimer()
      return
    }
    startTimer()
  }

  debounced.cancel = () => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
    lastArgs = null
  }

  debounced.flush = () => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
    invoke()
  }

  debounced.pending = () => timer !== null

  return debounced
}

/**
 * 节流
 * 保证在指定 wait 内最多触发一次。
 */
export function throttle<T extends AnyFn>(
  fn: T,
  wait = 200
): DebouncedFn<T> {
  return debounce(fn, wait, { leading: true, trailing: false })
}

/**
 * 仅执行一次，后续调用返回首次结果。
 */
export function once<T extends AnyFn>(fn: T): T {
  let called = false
  let result: ReturnType<T>

  return function (...args: Parameters<T>): ReturnType<T> {
    if (!called) {
      called = true
      result = fn(...args)
    }
    return result
  } as T
}

/**
 * 函数记忆化（基于 Map 缓存，引用相等比较）。
 */
export function memoize<T extends AnyFn>(
  fn: T,
  resolver?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>()

  return function (...args: Parameters<T>): ReturnType<T> {
    const key = resolver ? resolver(...args) : JSON.stringify(args)
    if (cache.has(key)) {
      return cache.get(key) as ReturnType<T>
    }
    const result = fn(...args)
    cache.set(key, result)
    return result
  } as T
}

/**
 * 从右到左组合函数（数学函数复合）。
 * compose(f, g, h)(x) === f(g(h(x)))
 */
export function compose<R>(f0: () => R): () => R
export function compose<A, R>(
  f1: (a: A) => R,
  f0: (a: A) => A
): (a: A) => R
export function compose<A, B, R>(
  f2: (b: B) => R,
  f1: (a: A) => B,
  f0: (a: A) => A
): (a: A) => R
export function compose(...fns: Array<(...args: any[]) => any>): (...args: any[]) => any
export function compose(...fns: Array<(...args: any[]) => any>): (...args: any[]) => any {
  return (...args: any[]) =>
    fns.reduceRight(
      (acc, fn, index) => (index === fns.length - 1 ? fn(...acc) : fn(acc)),
      args
    )
}

/**
 * 从左到右管道（数据流方向）。
 * pipe(f, g, h)(x) === h(g(f(x)))
 */
export function pipe<R>(f0: () => R): () => R
export function pipe<A, R>(f1: (a: A) => R, f0: (a: A) => A): (a: A) => R
export function pipe<A, B, R>(
  f2: (b: B) => R,
  f1: (a: A) => B,
  f0: (a: A) => A
): (a: A) => R
export function pipe(...fns: Array<(...args: any[]) => any>): (...args: any[]) => any
export function pipe(...fns: Array<(...args: any[]) => any>): (...args: any[]) => any {
  return (...args: any[]) =>
    fns.reduce(
      (acc, fn, index) => (index === 0 ? fn(...acc) : fn(acc)),
      args
    )
}

export type Curried<F extends AnyFn> = F extends (...args: infer A) => infer R
  ? A extends [infer First, ...infer Rest]
    ? (arg: First) => Rest extends []
      ? R
      : Curried<(...args: Rest) => R>
    : () => R
  : never

/**
 * 柯里化（收集参数至原函数 arity 后调用）。
 */
export function curry<F extends AnyFn>(fn: F): Curried<F> {
  function curried(...args: any[]): any {
    if (args.length >= fn.length) {
      return fn(...args)
    }
    return (...nextArgs: any[]) => curried(...args, ...nextArgs)
  }
  return curried as Curried<F>
}

/**
 * 偏函数（预填左侧部分参数）。
 */
export function partial<F extends AnyFn>(
  fn: F,
  ...presetArgs: any[]
): (...rest: any[]) => ReturnType<F> {
  return (...rest) => fn(...presetArgs, ...rest)
}
