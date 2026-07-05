import type { Point } from '../primitive/types.js'
import { Point as PointFn } from '../primitive/factories.js'

/** 二次贝塞尔求值(3 控制点) - de Casteljau 直接公式 */
export function bezier2(t: number, p0: Point, p1: Point, p2: Point): Point {
  const u = 1 - t
  const tt = t * t
  const uu = u * u
  return PointFn(
    uu * p0.x + 2 * u * t * p1.x + tt * p2.x,
    uu * p0.y + 2 * u * t * p1.y + tt * p2.y,
  )
}

/** 三次贝塞尔求值(4 控制点) */
export function bezier3(t: number, p0: Point, p1: Point, p2: Point, p3: Point): Point {
  const u = 1 - t
  const tt = t * t
  const uu = u * u
  const uuu = uu * u
  const ttt = tt * t
  return PointFn(
    uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x,
    uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y,
  )
}

/** 三次贝塞尔的 N 个等距采样点 */
export function bezier3Samples(
  p0: Point, p1: Point, p2: Point, p3: Point, n: number,
): Point[] {
  const points: Point[] = []
  for (let i = 0; i <= n; i++) {
    points.push(bezier3(i / n, p0, p1, p2, p3))
  }
  return points
}
