import type { Point, Polygon } from '../primitive/types.js'
import { Point as PointFn } from '../primitive/factories.js'
import { Polygon as PolygonFn } from '../primitive/factories.js'
import { distanceSq } from './distance.js'

/**
 * 凸包:Graham scan O(n log n)
 * 返回:凸多边形顶点(逆时针)
 */
export function convexHull(points: ReadonlyArray<Point>): Polygon {
  if (points.length < 3) {
    return PolygonFn(points.slice())
  }

  // 1. 找最低点(同 y 时取最左)
  const sorted = points.slice().sort((a, b) => a.y - b.y || a.x - b.x)
  const pivot = sorted[0]
  const rest = sorted.slice(1)

  // 2. 按极角排序(相对 pivot)
  rest.sort((a, b) => {
    const angle = Math.atan2(a.y - pivot.y, a.x - pivot.x)
                - Math.atan2(b.y - pivot.y, b.x - pivot.x)
    if (Math.abs(angle) > 1e-10) return angle
    return distanceSq(pivot, a) - distanceSq(pivot, b)
  })

  // 3. Graham scan 主循环
  const stack: Point[] = [pivot, rest[0]]
  for (let i = 1; i < rest.length; i++) {
    const next = rest[i]

    while (stack.length >= 2) {
      const top = stack[stack.length - 1]
      const second = stack[stack.length - 2]
      const cross = (top.x - second.x) * (next.y - second.y)
                  - (top.y - second.y) * (next.x - second.x)
      if (cross <= 0) {
        stack.pop()
      } else {
        break
      }
    }

    stack.push(next)
  }

  return PolygonFn(stack)
}
