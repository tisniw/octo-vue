import type { Radian } from '../shared/types.js'
import type { Point } from '../primitive/types.js'
import { Point as PointFn } from '../primitive/factories.js'
import type { Decomposed2D } from './types.js'
import type { Matrix3D } from './Matrix3D.js'
import { Matrix2D, multiply } from './Matrix2D.js'
import type { Matrix2D as Matrix2DType } from './Matrix2D.js'

/** 矩阵分解 */
export function decompose(m: Matrix2DType): Decomposed2D {
  const translate: Point = PointFn(m.tx, m.ty)
  const sx = Math.hypot(m.a, m.b)
  const sy = Math.hypot(m.c, m.d)
  const rotate: Radian = Math.atan2(m.b, m.a)
  const skew: Radian = Math.atan2(-m.c * m.d + m.a * m.b, m.a * m.d + m.b * m.c) - rotate
  return { translate: { x: translate.x, y: translate.y }, rotate, scale: { x: sx, y: sy }, skew }
}

/** 矩阵合成 */
export function compose(parts: Decomposed2D): Matrix2DType {
  return Matrix2D.identity()
    .translate(parts.translate.x, parts.translate.y)
    .rotate(parts.rotate)
    .scale(parts.scale.x, parts.scale.y)
}

/** 两个 Matrix2D 是否近似相等 */
export function equals(a: Matrix2DType, b: Matrix2DType, epsilon = 1e-10): boolean {
  return (
    Math.abs(a.a - b.a) < epsilon && Math.abs(a.b - b.b) < epsilon &&
    Math.abs(a.c - b.c) < epsilon && Math.abs(a.d - b.d) < epsilon &&
    Math.abs(a.tx - b.tx) < epsilon && Math.abs(a.ty - b.ty) < epsilon
  )
}

/** 两个 Matrix3D 是否近似相等 */
export function equals3D(a: Matrix3D, b: Matrix3D, epsilon = 1e-10): boolean {
  for (let i = 0; i < 16; i++) {
    if (Math.abs(a.m[i] - b.m[i]) >= epsilon) return false
  }
  return true
}
