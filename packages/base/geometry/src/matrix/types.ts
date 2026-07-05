/** Matrix2D 分解结果 */
export interface Decomposed2D {
  readonly translate: { readonly x: number; readonly y: number }
  readonly rotate: number
  readonly scale: { readonly x: number; readonly y: number }
  readonly skew: number
}
