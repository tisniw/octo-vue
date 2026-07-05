import { GeometryError } from '../shared/error.js'
import type { Polygon } from '../primitive/types.js'
import { Point as PointFn } from '../primitive/factories.js'
import type { Point } from '../primitive/types.js'

/** 多边形形心(顶点平均值) */
export function centroid(polygon: Polygon): Point {
  const points = polygon.points
  if (points.length === 0) {
    throw new GeometryError('centroid: empty polygon', {
      kind: 'invalid-input',
      module: 'util',
    })
  }
  let sx = 0, sy = 0
  for (const p of points) {
    sx += p.x
    sy += p.y
  }
  return PointFn(sx / points.length, sy / points.length)
}
