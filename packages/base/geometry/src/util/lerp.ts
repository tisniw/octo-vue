import { Point as PointFn, Point3D as Point3DFn, v3Sub, v3Add, v3Dot, v3Scale } from '../primitive/factories.js'
import type { Point, Point3D } from '../primitive/types.js'
import { EPSILON } from '../shared/constants.js'

/** 2D 线性插值:t=0 → p1, t=1 → p2 */
export function lerp(p1: Point, p2: Point, t: number): Point {
  return PointFn(
    p1.x + (p2.x - p1.x) * t,
    p1.y + (p2.y - p1.y) * t,
  )
}

/** 标量线性插值 */
export function lerpNum(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

/** 3D 线性插值 */
export function lerp3D(p1: Point3D, p2: Point3D, t: number): Point3D {
  return Point3DFn(
    p1.x + (p2.x - p1.x) * t,
    p1.y + (p2.y - p1.y) * t,
    p1.z + (p2.z - p1.z) * t,
  )
}

/** 球面线性插值(3D) */
export function slerp(
  q1: Point3D,
  q2: Point3D,
  t: number,
  center: Point3D = Point3DFn(0, 0, 0),
): Point3D {
  const v1 = v3Sub(q1 as any, center as any)
  const v2 = v3Sub(q2 as any, center as any)

  const dot = v3Dot(v1, v2)
  const theta = Math.acos(Math.max(-1, Math.min(1, dot)))
  const sinTheta = Math.sin(theta)

  if (sinTheta < EPSILON) {
    return Point3DFn(
      q1.x + (q2.x - q1.x) * t,
      q1.y + (q2.y - q1.y) * t,
      q1.z + (q2.z - q1.z) * t,
    )
  }

  const a = Math.sin((1 - t) * theta) / sinTheta
  const b = Math.sin(t * theta) / sinTheta
  const result = v3Add(v3Scale(v1, a), v3Scale(v2, b))
  return Point3DFn(result.x + center.x, result.y + center.y, result.z + center.z)
}
