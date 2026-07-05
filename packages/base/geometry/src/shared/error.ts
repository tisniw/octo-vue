/** 几何错误分类(5 类) */
export type GeometryErrorKind =
  | 'degenerate'      // 退化情形(零长度向量 / 零面积多边形 / 奇异矩阵)
  | 'invalid-input'   // 非法输入(NaN / Infinity / 负半径)
  | 'unsupported'     // 不支持的操作(如 2D 矩阵求逆 0 行列式)
  | 'precision'       // 精度溢出(连续矩阵乘法后数值漂移)
  | 'unknown'         // 未知错误

/** 几何错误基类 */
export class GeometryError extends Error {
  readonly kind: GeometryErrorKind
  readonly cause?: unknown
  readonly module?: string   // 哪个模块抛出(matrix / transform / collision ...)

  constructor(
    message: string,
    options?: {
      kind?: GeometryErrorKind
      cause?: unknown
      module?: string
    }
  ) {
    super(message)
    this.name = 'GeometryError'
    this.kind = options?.kind ?? 'unknown'
    this.cause = options?.cause
    this.module = options?.module

    // 修复 transpiled 代码中 instanceof 的判断
    Object.setPrototypeOf(this, new.target.prototype)
  }
}
