import { EPSILON } from '../shared/constants.js'
import { GeometryError } from '../shared/error.js'
import type { Degree, Radian } from '../shared/types.js'
import type { Point, Vector } from '../primitive/types.js'
import { vDot, vLength } from '../primitive/factories.js'
import { RAD2DEG } from '../shared/constants.js'

/** 两点形成的角度(以 p1 为原点,指向 p2),范围 [-π, π] */
export function angle(p1: Point, p2: Point): Radian {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x) as Radian
}

/** 两向量的夹角(0 到 π) */
export function angleBetween(v1: Vector, v2: Vector): Radian {
  const dot = vDot(v1, v2)
  const len = vLength(v1) * vLength(v2)
  if (len < EPSILON) {
    throw new GeometryError('Cannot compute angle with zero vector', {
      kind: 'degenerate',
      module: 'util',
    })
  }
  return Math.acos(Math.max(-1, Math.min(1, dot / len))) as Radian
}

/** 角度版 angle */
export function angleDeg(p1: Point, p2: Point): Degree {
  return (angle(p1, p2) * RAD2DEG) as Degree
}

/** 角度版 angleBetween */
export function angleBetweenDeg(v1: Vector, v2: Vector): Degree {
  return (angleBetween(v1, v2) * RAD2DEG) as Degree
}
