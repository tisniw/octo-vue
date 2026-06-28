/** 错误分类(7 类) */
export type ErrorKind =
  | 'network'
  | 'timeout'
  | 'cancel'
  | 'server'
  | 'client'
  | 'business'
  | 'unknown'

/** 网络错误基类 */
export abstract class NetworkError extends Error {
  abstract readonly kind: ErrorKind
  readonly cause?: unknown

  constructor(message: string, options?: { cause?: unknown }) {
    super(message)
    this.name = new.target.name
    this.cause = options?.cause
    // 修复原型链,使 instanceof 正常工作
    Object.setPrototypeOf(this, new.target.prototype)
  }
}