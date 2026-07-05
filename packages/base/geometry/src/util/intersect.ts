import { EPSILON } from '../shared/constants.js'
import type { Point } from '../primitive/types.js'
import type { Circle, Line, Rect, Segment } from '../primitive/types.js'
import { Point as PointFn, vDot, vLength, vSub, vScale } from '../primitive/factories.js'

/** 两条直线(无限延伸)求交 */
export function lineLine(l1: Line, l2: Line): Point | null {
  const d = (l1.p2.x - l1.p1.x) * (l2.p2.y - l2.p1.y)
          - (l1.p2.y - l1.p1.y) * (l2.p2.x - l2.p1.x)
  if (Math.abs(d) < EPSILON) return null

  const t = ((l2.p1.x - l1.p1.x) * (l2.p2.y - l2.p1.y)
           - (l2.p1.y - l1.p1.y) * (l2.p2.x - l2.p1.x)) / d
  return PointFn(
    l1.p1.x + t * (l1.p2.x - l1.p1.x),
    l1.p1.y + t * (l1.p2.y - l1.p1.y),
  )
}

/** 两条线段求交(有限) */
export function segmentSegment(s1: Segment, s2: Segment): Point | null {
  const d = (s1.end.x - s1.start.x) * (s2.end.y - s2.start.y)
          - (s1.end.y - s1.start.y) * (s2.end.x - s2.start.x)
  if (Math.abs(d) < EPSILON) return null

  const t = ((s2.start.x - s1.start.x) * (s2.end.y - s2.start.y)
           - (s2.start.y - s1.start.y) * (s2.end.x - s2.start.x)) / d
  const u = -((s1.start.x - s1.end.x) * (s1.start.y - s2.start.y)
            - (s1.start.y - s1.end.y) * (s1.start.x - s2.start.x)) / d

  if (t < 0 || t > 1 || u < 0 || u > 1) return null

  return PointFn(
    s1.start.x + t * (s1.end.x - s1.start.x),
    s1.start.y + t * (s1.end.y - s1.start.y),
  )
}

/** 线段与矩形相交 */
export function lineRect(s: Segment, r: Rect): Point[] {
  const intersections: Point[] = []
  const tl = PointFn(r.x, r.y)
  const tr = PointFn(r.x + r.width, r.y)
  const br = PointFn(r.x + r.width, r.y + r.height)
  const bl = PointFn(r.x, r.y + r.height)
  const edges: Segment[] = [
    { __brand: 'Segment', start: tl, end: tr } as Segment,
    { __brand: 'Segment', start: tr, end: br } as Segment,
    { __brand: 'Segment', start: br, end: bl } as Segment,
    { __brand: 'Segment', start: bl, end: tl } as Segment,
  ]

  for (const edge of edges) {
    const pt = segmentSegment(s, edge)
    if (pt !== null) intersections.push(pt)
  }

  return dedupePoints(intersections, EPSILON)
}

/** 线段与圆相交 */
export function lineCircle(s: Segment, c: Circle): Point[] {
  const dx = s.end.x - s.start.x
  const dy = s.end.y - s.start.y
  const fx = s.start.x - c.cx
  const fy = s.start.y - c.cy

  const a = dx * dx + dy * dy
  const b = 2 * (fx * dx + fy * dy)
  const cc = fx * fx + fy * fy - c.r * c.r

  const discriminant = b * b - 4 * a * cc
  if (discriminant < 0) return []
  if (discriminant < EPSILON) {
    const t = -b / (2 * a)
    if (t >= 0 && t <= 1) {
      return [PointFn(s.start.x + t * dx, s.start.y + t * dy)]
    }
    return []
  }

  const sqrtD = Math.sqrt(discriminant)
  const t1 = (-b - sqrtD) / (2 * a)
  const t2 = (-b + sqrtD) / (2 * a)
  const result: Point[] = []
  if (t1 >= 0 && t1 <= 1) result.push(PointFn(s.start.x + t1 * dx, s.start.y + t1 * dy))
  if (t2 >= 0 && t2 <= 1) result.push(PointFn(s.start.x + t2 * dx, s.start.y + t2 * dy))
  return result
}

function dedupePoints(points: Point[], eps: number): Point[] {
  const result: Point[] = []
  for (const p of points) {
    const isDup = result.some(
      (r) => Math.abs(r.x - p.x) < eps && Math.abs(r.y - p.y) < eps,
    )
    if (!isDup) result.push(p)
  }
  return result
}
