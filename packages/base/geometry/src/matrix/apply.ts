import type { Point, Vector } from '../primitive/types.js'
import { Point as PointFn, Vector as VectorFn } from '../primitive/factories.js'
import type { Matrix2D } from './Matrix2D.js'

export function applyPoint(m: Matrix2D, p: Point): Point {
  return PointFn(
    m.a * p.x + m.c * p.y + m.tx,
    m.b * p.x + m.d * p.y + m.ty,
  )
}

export function applyVector(m: Matrix2D, v: Vector): Vector {
  return VectorFn(
    m.a * v.x + m.c * v.y,
    m.b * v.x + m.d * v.y,
  )
}
