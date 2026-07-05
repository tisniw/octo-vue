import { EPSILON } from '../shared/constants.js'
import { GeometryError } from '../shared/error.js'
import type { Radian } from '../shared/types.js'
import type { Point, Line } from '../primitive/types.js'
import { Point as PointFn } from '../primitive/factories.js'

/** 平移 */
export function translate(p: Point, dx: number, dy: number): Point {
  return PointFn(p.x + dx, p.y + dy)
}

/** 旋转(绕 origin, 默认 (0, 0)) */
export function rotate(
  p: Point,
  angle: Radian,
  origin: Point = PointFn(0, 0),
): Point {
  if (Math.abs(angle) < EPSILON) return p

  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  const dx = p.x - origin.x
  const dy = p.y - origin.y

  return PointFn(
    origin.x + dx * cos - dy * sin,
    origin.y + dx * sin + dy * cos,
  )
}

/** 缩放(相对 origin, 默认 (0, 0)) */
export function scale(
  p: Point,
  sx: number,
  sy: number = sx,
  origin: Point = PointFn(0, 0),
): Point {
  if (
    Math.abs(sx - sy) < EPSILON &&
    Math.abs(sx - 1) < EPSILON &&
    Math.abs(origin.x) < EPSILON &&
    Math.abs(origin.y) < EPSILON
  ) {
    return p
  }

  return PointFn(
    origin.x + (p.x - origin.x) * sx,
    origin.y + (p.y - origin.y) * sy,
  )
}

/** 反射(镜像) */
export function reflect(
  p: Point,
  axis: 'x' | 'y' | 'xy' | Line = 'x',
): Point {
  switch (axis) {
    case 'x':
      return PointFn(p.x, -p.y)
    case 'y':
      return PointFn(-p.x, p.y)
    case 'xy':
      return PointFn(-p.x, -p.y)
    default: {
      const proj = projectPointOnLine(p, axis)
      return PointFn(2 * proj.x - p.x, 2 * proj.y - p.y)
    }
  }
}

function projectPointOnLine(p: Point, l: Line): Point {
  const dx = l.p2.x - l.p1.x
  const dy = l.p2.y - l.p1.y
  const lenSq = dx * dx + dy * dy
  if (lenSq < EPSILON) {
    throw new GeometryError('Line for reflection must have non-zero length', {
      kind: 'degenerate',
      module: 'transform',
    })
  }
  const t = ((p.x - l.p1.x) * dx + (p.y - l.p1.y) * dy) / lenSq
  return PointFn(l.p1.x + t * dx, l.p1.y + t * dy)
}

/** 错切(倾斜) */
export function shear(p: Point, sx: number, sy: number = 0): Point {
  if (Math.abs(sx) < EPSILON && Math.abs(sy) < EPSILON) return p
  return PointFn(p.x + sx * p.y, p.y + sy * p.x)
}
