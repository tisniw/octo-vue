// 存储错误分类
export type StorageErrorKind =
  | 'quota'         // 容量超限
  | 'not-found'     // 数据库未找到
  | 'version'       // 版本不兼容
  | 'unknown'       // 未知错误

// 存储错误基类
export class StorageError extends Error {
  readonly kind: StorageErrorKind
  readonly cause?: unknown
  readonly adapter?: string

  constructor(
    message: string,
    options?: {
      kind?: StorageErrorKind
      cause?: unknown
      adapter?: string
    }
  ) {
    super(message)
    this.name = 'StorageError'
    this.kind = options?.kind ?? 'unknown'
    this.cause = options?.cause
    this.adapter = options?.adapter

    // 修复原型链,使 instanceof 正常工作
    Object.setPrototypeOf(this, new.target.prototype)
  }
}
