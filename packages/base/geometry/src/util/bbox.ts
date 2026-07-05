import { GeometryError } from '../shared/error.js'
import type { Point, Rect, Circle, Polygon } from '../primitive/types.js'
import { Rect as RectFn } from '../primitive/factories.js'

/** 一组图元的轴对齐包围盒(AABB) */
export function bbox(shapes: ReadonlyArray<Point | Rect | Circle | Polygon>): Rect {
  if (shapes.length === 0) {
    throw new GeometryError('bbox: empty input', { kind: 'invalid-input', module: 'util' })
  }

  let minX = Infinity, minY = Infinity
  let maxX = -Infinity, maxY = -Infinity

  for (const shape of shapes) {
    if ('__brand' in shape) {
      switch ((shape as any).__brand) {
        case 'Point':
          minX = Math.min(minX, (shape as Point).x)
          maxX = Math.max(maxX, (shape as Point).x)
          minY = Math.min(minY, (shape as Point).y)
          maxY = Math.max(maxY, (shape as Point).y)
          break
        case 'Rect': {
          const r = shape as Rect
          minX = Math.min(minX, r.x)
          maxX = Math.max(maxX, r.x + r.width)
          minY = Math.min(minY, r.y)
          maxY = Math.max(maxY, r.y + r.height)
          break
        }
        case 'Circle': {
          const c = shape as Circle
          minX = Math.min(minX, c.cx - c.r)
          maxX = Math.max(maxX, c.cx + c.r)
          minY = Math.min(minY, c.cy - c.r)
          maxY = Math.max(maxY, c.cy + c.r)
          break
        }
        case 'Polygon': {
          const poly = shape as Polygon
          for (const p of poly.points) {
            minX = Math.min(minX, p.x)
            maxX = Math.max(maxX, p.x)
            minY = Math.min(minY, p.y)
            maxY = Math.max(maxY, p.y)
          }
          break
        }
        default:
          // skip unknown shapes
          break
      }
    }
  }

  return RectFn(minX, minY, maxX - minX, maxY - minY)
}
