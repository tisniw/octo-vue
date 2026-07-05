import { GeometryError } from '../shared/error.js'
import { MATRIX_EPSILON } from '../shared/constants.js'
import type { Radian } from '../shared/types.js'

/**
 * 2D 仿射变换矩阵
 *
 * 6 元素 [a, b, c, d, tx, ty] 表示 3×3 矩阵:
 *   | a  c  tx |
 *   | b  d  ty |
 *   | 0  0  1  |
 *
 * 链式 API,不可变(所有变换返回新实例)。
 */
export class Matrix2D {
  readonly __brand = 'Matrix2D' as const
  readonly a: number
  readonly b: number
  readonly c: number
  readonly d: number
  readonly tx: number
  readonly ty: number

  constructor(a: number, b: number, c: number, d: number, tx: number, ty: number) {
    this.a = a; this.b = b; this.c = c; this.d = d; this.tx = tx; this.ty = ty
    return Object.freeze(this)
  }

  static identity(): Matrix2D { return new Matrix2D(1, 0, 0, 1, 0, 0) }
  static from(a: number, b: number, c: number, d: number, tx: number, ty: number): Matrix2D {
    return new Matrix2D(a, b, c, d, tx, ty)
  }
  static translate(tx: number, ty: number): Matrix2D { return new Matrix2D(1, 0, 0, 1, tx, ty) }
  static rotate(angle: Radian): Matrix2D {
    const cos = Math.cos(angle); const sin = Math.sin(angle)
    return new Matrix2D(cos, sin, -sin, cos, 0, 0)
  }
  static scale(sx: number, sy?: number): Matrix2D {
    sy = sy ?? sx; return new Matrix2D(sx, 0, 0, sy, 0, 0)
  }

  translate(tx: number, ty: number): Matrix2D {
    return new Matrix2D(
      this.a, this.b, this.c, this.d,
      this.a * tx + this.c * ty + this.tx,
      this.b * tx + this.d * ty + this.ty,
    )
  }
  rotate(angle: Radian): Matrix2D {
    const cos = Math.cos(angle); const sin = Math.sin(angle)
    return new Matrix2D(
      this.a * cos + this.c * sin,
      this.b * cos + this.d * sin,
      this.a * -sin + this.c * cos,
      this.b * -sin + this.d * cos,
      this.tx, this.ty,
    )
  }
  scale(sx: number, sy?: number): Matrix2D {
    sy = sy ?? sx
    return new Matrix2D(this.a * sx, this.b * sx, this.c * sy, this.d * sy, this.tx, this.ty)
  }
}

export function multiply(a: Matrix2D, b: Matrix2D): Matrix2D {
  return new Matrix2D(
    a.a * b.a + a.c * b.b,
    a.b * b.a + a.d * b.b,
    a.a * b.c + a.c * b.d,
    a.b * b.c + a.d * b.d,
    a.a * b.tx + a.c * b.ty + a.tx,
    a.b * b.tx + a.d * b.ty + a.ty,
  )
}

export function invert(m: Matrix2D): Matrix2D {
  const det = m.a * m.d - m.b * m.c
  if (Math.abs(det) < MATRIX_EPSILON) {
    throw new GeometryError('Matrix is not invertible (determinant ≈ 0)', { kind: 'unsupported', module: 'matrix' })
  }
  const inv = 1 / det
  return new Matrix2D(
    m.d * inv, -m.b * inv, -m.c * inv, m.a * inv,
    (m.c * m.ty - m.d * m.tx) * inv,
    (m.b * m.tx - m.a * m.ty) * inv,
  )
}

export function transpose(m: Matrix2D): Matrix2D {
  return new Matrix2D(m.a, m.c, m.b, m.d, m.ty, m.tx)
}

export function determinant(m: Matrix2D): number {
  return m.a * m.d - m.b * m.c
}
