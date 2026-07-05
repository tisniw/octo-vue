import { GeometryError } from '../shared/error.js'
import type { Point, Line } from '../primitive/types.js'
import { Point as PointFn } from '../primitive/factories.js'
import { Matrix2D, multiply } from '../matrix/Matrix2D.js'
import { applyPoint } from '../matrix/apply.js'
import type { Transform } from './types.js'

/** Transform 描述符 → Matrix2D */
export function toMatrix(op: Transform): Matrix2D {
  switch (op.type) {
    case 'translate':
      return Matrix2D.translate(op.dx, op.dy)
    case 'rotate': {
      const origin = op.origin ?? PointFn(0, 0)
      return Matrix2D.identity().translate(origin.x, origin.y).rotate(op.angle).translate(-origin.x, -origin.y)
    }
    case 'scale': {
      const origin = op.origin ?? PointFn(0, 0)
      return Matrix2D.identity().translate(origin.x, origin.y).scale(op.sx, op.sy).translate(-origin.x, -origin.y)
    }
    case 'reflect': {
      if (op.axis === 'x') return Matrix2D.scale(1, -1)
      if (op.axis === 'y') return Matrix2D.scale(-1, 1)
      if (op.axis === 'xy') return Matrix2D.scale(-1, -1)
      throw new GeometryError('reflect(Line) not yet implemented', { kind: 'unsupported', module: 'transform' })
    }
    case 'shear':
      return new Matrix2D(1, 0, op.sx, 1, 0, op.sy)
  }
}

/** 把多个变换按顺序应用到 p */
export function compose(p: Point, ops: ReadonlyArray<Transform>): Point {
  if (ops.length === 0) return p
  let m = Matrix2D.identity()
  for (const op of ops) m = multiply(m, toMatrix(op))
  return applyPoint(m, p)
}

/** 把多个变换组合为单一的 Matrix2D */
export function chain(ops: ReadonlyArray<Transform>): Matrix2D {
  return ops.reduce((acc, op) => multiply(acc, toMatrix(op)), Matrix2D.identity())
}
