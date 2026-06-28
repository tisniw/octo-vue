/** 异步值 */
export type Awaitable<T> = T | Promise<T>

/** 可空值 */
export type Nullable<T> = T | null

/** 可选值 */
export type Optional<T> = T | undefined

/** 任意函数 */
export type AnyFn = (...args: any[]) => any