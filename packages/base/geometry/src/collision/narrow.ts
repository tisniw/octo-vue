import { EPSILON } from '../shared/constants.js'
import type { Point, Rect, Circle, Polygon } from '../primitive/types.js'
import type { Vector } from '../primitive/types.js'
import type { Matrix2D } from '../matrix/Matrix2D.js'
import { Point as PointFn, Vector as VectorFn } from '../primitive/factories.js'
import { invert } from '../matrix/Matrix2D.js'
import { multiply } from '../matrix/Matrix2D.js'
import { applyPoint } from '../matrix/apply.js'
import { centroid } from '../util/centroid.js'
import type { Capsule, CollisionResult } from './types.js'

function notCollided(): CollisionResult {
  return {
    collided: false,
    mtv: VectorFn(0, 0),
    depth: 0,
    contact: PointFn(0, 0),
  }
}

/* ───────────────── AABB ───────────────── */

/** AABB 检测:两个 Rect 是否相交 */
export function aabb(a: Rect, b: Rect): CollisionResult {
  const overlapX = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x)
  const overlapY = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y)

  if (overlapX <= 0 || overlapY <= 0) {
    return notCollided()
  }

  const signX = Math.sign((a.x + a.width / 2) - (b.x + b.width / 2))
  const signY = Math.sign((a.y + a.height / 2) - (b.y + b.height / 2))

  const mtv: Vector = overlapX < overlapY
    ? VectorFn(signX, 0)
    : VectorFn(0, signY)

  const depth = Math.min(overlapX, overlapY)
  const contact = PointFn(
    (Math.max(a.x, b.x) + Math.min(a.x + a.width, b.x + b.width)) / 2,
    (Math.max(a.y, b.y) + Math.min(a.y + a.height, b.y + b.height)) / 2,
  )

  return { collided: true, mtv, depth, contact }
}

/* ───────────────── OBB ───────────────── */

/** OBB 检测:两个旋转矩形是否相交 */
export function obb(
  aRect: Rect, bRect: Rect,
  aMatrix: Matrix2D, bMatrix: Matrix2D,
): CollisionResult {
  const relative = multiply(invert(aMatrix), bMatrix)

  const bVerticesLocal: Point[] = [
    applyPoint(relative, PointFn(bRect.x, bRect.y)),
    applyPoint(relative, PointFn(bRect.x + bRect.width, bRect.y)),
    applyPoint(relative, PointFn(bRect.x + bRect.width, bRect.y + bRect.height)),
    applyPoint(relative, PointFn(bRect.x, bRect.y + bRect.height)),
  ]

  const aVerticesLocal: Point[] = [
    PointFn(aRect.x, aRect.y),
    PointFn(aRect.x + aRect.width, aRect.y),
    PointFn(aRect.x + aRect.width, aRect.y + aRect.height),
    PointFn(aRect.x, aRect.y + aRect.height),
  ]

  const polyA = { __brand: 'Polygon' as const, points: aVerticesLocal } as Polygon
  const polyB = { __brand: 'Polygon' as const, points: bVerticesLocal } as Polygon

  return polygonSAT(polyA, polyB)
}

/* ───────────────── Circle ───────────────── */

/** 圆形检测:两个 Circle 是否相交 */
export function circle(c1: Circle, c2: Circle): CollisionResult {
  const dx = c1.cx - c2.cx
  const dy = c1.cy - c2.cy
  const distSq = dx * dx + dy * dy
  const radiusSum = c1.r + c2.r

  if (distSq >= radiusSum * radiusSum) {
    return notCollided()
  }

  if (distSq < EPSILON * EPSILON) {
    return {
      collided: true,
      mtv: VectorFn(1, 0),
      depth: radiusSum,
      contact: PointFn(c2.cx + c2.r, c2.cy),
    }
  }

  const dist = Math.sqrt(distSq)
  const mtv = VectorFn(dx / dist, dy / dist)
  const depth = radiusSum - dist
  const contact = PointFn(c2.cx + mtv.x * c2.r, c2.cy + mtv.y * c2.r)

  return { collided: true, mtv, depth, contact }
}

/* ───────────────── Capsule ───────────────── */

/** 胶囊体检测 */
export function capsule(c1: Capsule, c2: Capsule): CollisionResult {
  const closestOnA = closestPointOnSegment(c1.start, c1.end, c2.start)
  const closestOnB = closestPointOnSegment(c2.start, c2.end, c1.start)

  const c1Circle = { __brand: 'Circle' as const, cx: closestOnA.x, cy: closestOnA.y, r: c1.r } as Circle
  const c2Circle = { __brand: 'Circle' as const, cx: closestOnB.x, cy: closestOnB.y, r: c2.r } as Circle
  return circle(c1Circle, c2Circle)
}

function closestPointOnSegment(start: Point, end: Point, p: Point): Point {
  const dx = end.x - start.x
  const dy = end.y - start.y
  const lenSq = dx * dx + dy * dy
  if (lenSq < EPSILON * EPSILON) return start

  const t = Math.max(0, Math.min(1, ((p.x - start.x) * dx + (p.y - start.y) * dy) / lenSq))
  return PointFn(start.x + t * dx, start.y + t * dy)
}

/* ───────────────── Polygon SAT ───────────────── */

/** 多边形 SAT 检测 */
export function polygon(polyA: Polygon, polyB: Polygon): CollisionResult {
  return polygonSAT(polyA, polyB)
}

function polygonSAT(polyA: Polygon, polyB: Polygon): CollisionResult {
  const axes: Vector[] = []

  for (let i = 0; i < polyA.points.length; i++) {
    const p1 = polyA.points[i]
    const p2 = polyA.points[(i + 1) % polyA.points.length]
    const edge = VectorFn(p2.x - p1.x, p2.y - p1.y)
    axes.push(VectorFn(-edge.y, edge.x))
  }
  for (let i = 0; i < polyB.points.length; i++) {
    const p1 = polyB.points[i]
    const p2 = polyB.points[(i + 1) % polyB.points.length]
    const edge = VectorFn(p2.x - p1.x, p2.y - p1.y)
    axes.push(VectorFn(-edge.y, edge.x))
  }

  let minOverlap = Infinity
  let minAxis: Vector = VectorFn(0, 0)

  for (const axis of axes) {
    const [minA, maxA] = projectPolygon(polyA, axis)
    const [minB, maxB] = projectPolygon(polyB, axis)

    const overlap = Math.min(maxA, maxB) - Math.max(minA, minB)
    if (overlap <= 0) {
      return notCollided()
    }
    if (overlap < minOverlap) {
      minOverlap = overlap
      minAxis = axis
    }
  }

  const centerA = centroid(polyA)
  const centerB = centroid(polyB)
  const dx = centerA.x - centerB.x
  const dy = centerA.y - centerB.y
  const dot = minAxis.x * dx + minAxis.y * dy

  const mtv = dot < 0
    ? VectorFn(-minAxis.x, -minAxis.y)
    : VectorFn(minAxis.x, minAxis.y)

  const depth = minOverlap
  const contact = PointFn(
    (centerA.x + centerB.x) / 2,
    (centerA.y + centerB.y) / 2,
  )

  return { collided: true, mtv, depth, contact }
}

function projectPolygon(poly: Polygon, axis: Vector): [number, number] {
  let min = Infinity, max = -Infinity
  for (const p of poly.points) {
    const dot = p.x * axis.x + p.y * axis.y
    if (dot < min) min = dot
    if (dot > max) max = dot
  }
  return [min, max]
}
