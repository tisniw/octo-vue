import { EPSILON } from '../shared/constants.js'
import type { Point, Circle, Polygon } from '../primitive/types.js'
import { Point as PointFn, Vector as VectorFn } from '../primitive/factories.js'
import { centroid } from '../util/centroid.js'
import type { CollisionResult } from './types.js'

function notCollided(): CollisionResult {
  return {
    collided: false,
    mtv: VectorFn(0, 0),
    depth: 0,
    contact: PointFn(0, 0),
  }
}

/** 点在圆内检测 */
export function pointInCircle(p: Point, c: Circle): CollisionResult {
  const dx = p.x - c.cx
  const dy = p.y - c.cy
  const distSq = dx * dx + dy * dy

  if (distSq >= c.r * c.r) {
    return notCollided()
  }

  const dist = Math.sqrt(distSq)
  const mtv = dist > EPSILON ? VectorFn(dx / dist, dy / dist) : VectorFn(1, 0)
  const depth = c.r - dist
  return {
    collided: true,
    mtv,
    depth,
    contact: p,
  }
}

/** 点在多边形内检测(射线法) */
export function pointInPolygon(p: Point, poly: Polygon): CollisionResult {
  let inside = false
  const points = poly.points

  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const pi = points[i]
    const pj = points[j]

    if ((pi.y > p.y) !== (pj.y > p.y)
        && p.x < (pj.x - pi.x) * (p.y - pi.y) / (pj.y - pi.y) + pi.x) {
      inside = !inside
    }
  }

  if (!inside) return notCollided()

  const c = centroid(poly)
  const dx = p.x - c.x
  const dy = p.y - c.y
  const len = Math.hypot(dx, dy)
  const mtv = len > EPSILON ? VectorFn(dx / len, dy / len) : VectorFn(1, 0)

  return {
    collided: true,
    mtv,
    depth: len,
    contact: p,
  }
}
