// 同步或异步值,让上层 API 在 Web Storage 与 IndexedDB 之间共用同一份类型契约
export type MaybePromise<T> = T | Promise<T>

// 可空值
export type Nullable<T> = T | null

// 可选值
export type Optional<T> = T | undefined

// 任意函数
export type AnyFn = (...args: any[]) => any

// 任意可序列化值,JSON-safe
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue }

// StorageAdapter 类型参数约束,不强制 JSON-safe,允许 Blob 与 File
export type StorageValue = unknown
