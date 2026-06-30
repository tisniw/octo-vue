/** 通用工具类型 — 被任意 o-* 模块复用的基础类型 */

/** 可空值 */
export type Nullable<T> = T | null

/** 可选值 */
export type Optional<T> = T | undefined

/** 异步值 */
export type Awaitable<T> = T | Promise<T>

/** 任意函数 */
export type AnyFn = (...args: any[]) => any

/** 任意对象 */
export type AnyObject = Record<string, any>

/** 深度 Readonly */
export type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K]
}

/** 深度 Partial */
export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K]
}

/** 宽松类型（允许函数 / 对象 / 数组） */
export type Loose<T> = T | object | any[] | ((...args: any[]) => any)

/** 平台类型（运行时平台） */
export type RuntimePlatform = 'browser' | 'node' | 'unknown'

/** 运行环境 */
export type Runtime = 'browser' | 'ssr' | 'webworker' | 'node' | 'test'

/** 任意数组 */
export type AnyArray = any[] | readonly any[]
