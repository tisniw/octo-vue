import { GeometryError } from '../shared/error.js'
import type { JsonShape, Shape } from './types.js'
import {
  Point,
  Point3D,
  Vector,
  Vector3D,
  Rect,
  Box3D,
  Circle,
  Ellipse,
  Line,
  Segment,
  Ray,
  Polygon,
  Polyline,
  Path,
  Bezier2,
  Bezier3,
} from './factories.js'

function pt(p: { x: number; y: number }): { x: number; y: number } {
  return { x: p.x, y: p.y }
}

function pt3(p: { x: number; y: number; z: number }): { x: number; y: number; z: number } {
  return { x: p.x, y: p.y, z: p.z }
}

/** 序列化图元为 JSON-safe 对象 */
export function serialize(shape: Shape): JsonShape {
  switch (shape.__brand) {
    case 'Point':
      return { type: 'Point', x: shape.x, y: shape.y }
    case 'Point3D':
      return { type: 'Point3D', x: shape.x, y: shape.y, z: shape.z }
    case 'Vector':
      return { type: 'Vector', x: shape.x, y: shape.y }
    case 'Vector3D':
      return { type: 'Vector3D', x: shape.x, y: shape.y, z: shape.z }
    case 'Rect':
      return { type: 'Rect', x: shape.x, y: shape.y, width: shape.width, height: shape.height }
    case 'Box3D':
      return {
        type: 'Box3D',
        x: shape.x, y: shape.y, z: shape.z,
        width: shape.width, height: shape.height, depth: shape.depth,
      }
    case 'Circle':
      return { type: 'Circle', cx: shape.cx, cy: shape.cy, r: shape.r }
    case 'Ellipse':
      return { type: 'Ellipse', cx: shape.cx, cy: shape.cy, rx: shape.rx, ry: shape.ry }
    case 'Line':
      return { type: 'Line', p1: pt(shape.p1), p2: pt(shape.p2) }
    case 'Segment':
      return { type: 'Segment', start: pt(shape.start), end: pt(shape.end) }
    case 'Ray':
      return { type: 'Ray', origin: pt(shape.origin), direction: pt(shape.direction) }
    case 'Polygon':
      return { type: 'Polygon', points: shape.points.map(pt) }
    case 'Polyline':
      return { type: 'Polyline', points: shape.points.map(pt) }
    case 'Path':
      return { type: 'Path', commands: shape.commands.slice() }
    case 'Bezier2':
      return { type: 'Bezier2', p0: pt(shape.p0), p1: pt(shape.p1), p2: pt(shape.p2) }
    case 'Bezier3':
      return { type: 'Bezier3', p0: pt(shape.p0), p1: pt(shape.p1), p2: pt(shape.p2), p3: pt(shape.p3) }
    default:
      throw new GeometryError(`Unknown shape type: ${(shape as any).__brand}`, {
        kind: 'invalid-input',
        module: 'primitive',
      })
  }
}

/** 反序列化 JSON-safe 对象为不可变图元 */
export function deserialize(json: JsonShape): Shape {
  switch (json.type) {
    case 'Point':
      return Point(json.x, json.y)
    case 'Point3D':
      return Point3D(json.x, json.y, json.z)
    case 'Vector':
      return Vector(json.x, json.y)
    case 'Vector3D':
      return Vector3D(json.x, json.y, json.z)
    case 'Rect':
      return Rect(json.x, json.y, json.width, json.height)
    case 'Box3D':
      return Box3D(json.x, json.y, json.z, json.width, json.height, json.depth)
    case 'Circle':
      return Circle(json.cx, json.cy, json.r)
    case 'Ellipse':
      return Ellipse(json.cx, json.cy, json.rx, json.ry)
    case 'Line':
      return Line(Point(json.p1.x, json.p1.y), Point(json.p2.x, json.p2.y))
    case 'Segment':
      return Segment(Point(json.start.x, json.start.y), Point(json.end.x, json.end.y))
    case 'Ray':
      return Ray(Point(json.origin.x, json.origin.y), Vector(json.direction.x, json.direction.y))
    case 'Polygon':
      return Polygon(json.points.map((p) => Point(p.x, p.y)))
    case 'Polyline':
      return Polyline(json.points.map((p) => Point(p.x, p.y)))
    case 'Path':
      return Path(json.commands.slice())
    case 'Bezier2':
      return Bezier2(Point(json.p0.x, json.p0.y), Point(json.p1.x, json.p1.y), Point(json.p2.x, json.p2.y))
    case 'Bezier3':
      return Bezier3(
        Point(json.p0.x, json.p0.y),
        Point(json.p1.x, json.p1.y),
        Point(json.p2.x, json.p2.y),
        Point(json.p3.x, json.p3.y),
      )
    default:
      throw new GeometryError(`Unknown shape type: ${(json as any).type}`, {
        kind: 'invalid-input',
        module: 'primitive',
      })
  }
}
