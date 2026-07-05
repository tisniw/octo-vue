import { GeometryError } from '../shared/error.js'
import type {
  Point as _Point, Point3D as _Point3D,
  Vector as _Vector, Vector3D as _Vector3D,
  Rect as _Rect, Box3D as _Box3D,
  Circle as _Circle, Ellipse as _Ellipse,
  Line as _Line, Segment as _Segment, Ray as _Ray,
  Polygon as _Polygon, Polyline as _Polyline, Path as _Path, PathCommand as _PathCommand,
  Bezier2 as _Bezier2, Bezier3 as _Bezier3,
} from './types.js'

/* ─────────────────────── Point ─────────────────────── */
export function Point(x: number, y: number): _Point {
  if (!Number.isFinite(x) || !Number.isFinite(y)) throw new GeometryError('Point coordinates must be finite numbers', { kind: 'invalid-input', module: 'primitive' })
  return Object.freeze({ __brand: 'Point' as const, x, y })
}
Point.zero = (): _Point => Point(0, 0)
Point.from = (s: { x: number; y: number } | [number, number]): _Point => Array.isArray(s) ? Point(s[0], s[1]) : Point(s.x, s.y)
export function pointZero(): _Point { return Point(0, 0) }
export function pointFrom(s: { x: number; y: number } | [number, number]): _Point { return Array.isArray(s) ? Point(s[0], s[1]) : Point(s.x, s.y) }
export function pointWith(p: _Point, patch: Partial<{ x: number; y: number }>): _Point { return Point(patch.x ?? p.x, patch.y ?? p.y) }

/* ─────────────────────── Point3D ─────────────────────── */
export function Point3D(x: number, y: number, z: number): _Point3D {
  if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) throw new GeometryError('Point3D coordinates must be finite numbers', { kind: 'invalid-input', module: 'primitive' })
  return Object.freeze({ __brand: 'Point3D' as const, x, y, z })
}
Point3D.zero = (): _Point3D => Point3D(0, 0, 0)
Point3D.from = (s: { x: number; y: number; z: number } | [number, number, number]): _Point3D => Array.isArray(s) ? Point3D(s[0], s[1], s[2]) : Point3D(s.x, s.y, s.z)
export function point3DZero(): _Point3D { return Point3D(0, 0, 0) }
export function point3DFrom(s: { x: number; y: number; z: number } | [number, number, number]): _Point3D { return Array.isArray(s) ? Point3D(s[0], s[1], s[2]) : Point3D(s.x, s.y, s.z) }
export function point3DWith(p: _Point3D, patch: Partial<{ x: number; y: number; z: number }>): _Point3D { return Point3D(patch.x ?? p.x, patch.y ?? p.y, patch.z ?? p.z) }

/* ─────────────────────── Vector ─────────────────────── */
export function Vector(dx: number, dy: number): _Vector {
  if (!Number.isFinite(dx) || !Number.isFinite(dy)) throw new GeometryError('Vector components must be finite numbers', { kind: 'invalid-input', module: 'primitive' })
  return Object.freeze({ __brand: 'Vector' as const, x: dx, y: dy })
}
Vector.zero = (): _Vector => Vector(0, 0)
Vector.up = (): _Vector => Vector(0, 1)
Vector.right = (): _Vector => Vector(1, 0)
Vector.down = (): _Vector => Vector(0, -1)
Vector.left = (): _Vector => Vector(-1, 0)
export function vectorZero(): _Vector { return Vector(0, 0) }
export function vectorUp(): _Vector { return Vector(0, 1) }
export function vectorRight(): _Vector { return Vector(1, 0) }
export function vectorDown(): _Vector { return Vector(0, -1) }
export function vectorLeft(): _Vector { return Vector(-1, 0) }
export function vectorWith(v: _Vector, patch: Partial<{ x: number; y: number }>): _Vector { return Vector(patch.x ?? v.x, patch.y ?? v.y) }

/* ─────────────────────── Vector3D ─────────────────────── */
export function Vector3D(dx: number, dy: number, dz: number): _Vector3D {
  if (!Number.isFinite(dx) || !Number.isFinite(dy) || !Number.isFinite(dz)) throw new GeometryError('Vector3D components must be finite numbers', { kind: 'invalid-input', module: 'primitive' })
  return Object.freeze({ __brand: 'Vector3D' as const, x: dx, y: dy, z: dz })
}
Vector3D.zero = (): _Vector3D => Vector3D(0, 0, 0)
Vector3D.up = (): _Vector3D => Vector3D(0, 1, 0)
Vector3D.right = (): _Vector3D => Vector3D(1, 0, 0)
Vector3D.forward = (): _Vector3D => Vector3D(0, 0, 1)

/* ─────────────────────── Vector arithmetic ─────────────────────── */
export function vAdd(a: _Vector, b: _Vector): _Vector { return Vector(a.x + b.x, a.y + b.y) }
export function vSub(a: _Vector, b: _Vector): _Vector { return Vector(a.x - b.x, a.y - b.y) }
export function vScale(v: _Vector, k: number): _Vector { return Vector(v.x * k, v.y * k) }
export function vDot(a: _Vector, b: _Vector): number { return a.x * b.x + a.y * b.y }
export function vCross(a: _Vector, b: _Vector): number { return a.x * b.y - a.y * b.x }
export function vLength(v: _Vector): number { return Math.hypot(v.x, v.y) }
export function vNormalize(v: _Vector): _Vector {
  const len = vLength(v); if (len < 1e-10) throw new GeometryError('Cannot normalize zero vector', { kind: 'degenerate', module: 'primitive' })
  return Vector(v.x / len, v.y / len)
}
export function v3Add(a: _Vector3D, b: _Vector3D): _Vector3D { return Vector3D(a.x + b.x, a.y + b.y, a.z + b.z) }
export function v3Sub(a: _Vector3D, b: _Vector3D): _Vector3D { return Vector3D(a.x - b.x, a.y - b.y, a.z - b.z) }
export function v3Scale(v: _Vector3D, k: number): _Vector3D { return Vector3D(v.x * k, v.y * k, v.z * k) }
export function v3Dot(a: _Vector3D, b: _Vector3D): number { return a.x * b.x + a.y * b.y + a.z * b.z }
export function v3Cross(a: _Vector3D, b: _Vector3D): _Vector3D {
  return Vector3D(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x)
}
export function v3Length(v: _Vector3D): number { return Math.hypot(v.x, v.y, v.z) }
export function v3Normalize(v: _Vector3D): _Vector3D {
  const len = v3Length(v); if (len < 1e-10) throw new GeometryError('Cannot normalize zero vector', { kind: 'degenerate', module: 'primitive' })
  return Vector3D(v.x / len, v.y / len, v.z / len)
}

/* ─────────────────────── Rect / Box3D ─────────────────────── */
export function Rect(x: number, y: number, width: number, height: number): _Rect {
  if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(width) || !Number.isFinite(height)) throw new GeometryError('Rect coordinates must be finite numbers', { kind: 'invalid-input', module: 'primitive' })
  if (width < 0 || height < 0) throw new GeometryError('Rect dimensions must be non-negative', { kind: 'invalid-input', module: 'primitive' })
  return Object.freeze({ __brand: 'Rect' as const, x, y, width, height })
}
Rect.fromCenter = (cx: number, cy: number, w: number, h: number): _Rect => Rect(cx - w / 2, cy - h / 2, w, h)
export function rectFromCenter(cx: number, cy: number, w: number, h: number): _Rect { return Rect(cx - w / 2, cy - h / 2, w, h) }
export function rectCenter(r: _Rect): _Point { return Point(r.x + r.width / 2, r.y + r.height / 2) }
export function rectContains(r: _Rect, p: _Point): boolean { return p.x >= r.x && p.x <= r.x + r.width && p.y >= r.y && p.y <= r.y + r.height }

export function Box3D(x: number, y: number, z: number, width: number, height: number, depth: number): _Box3D {
  if ([x, y, z, width, height, depth].some(v => !Number.isFinite(v))) throw new GeometryError('Box3D coordinates must be finite numbers', { kind: 'invalid-input', module: 'primitive' })
  if (width < 0 || height < 0 || depth < 0) throw new GeometryError('Box3D dimensions must be non-negative', { kind: 'invalid-input', module: 'primitive' })
  return Object.freeze({ __brand: 'Box3D' as const, x, y, z, width, height, depth })
}

/* ─────────────────────── Circle / Ellipse ─────────────────────── */
export function Circle(cx: number, cy: number, r: number): _Circle {
  if (!Number.isFinite(cx) || !Number.isFinite(cy) || !Number.isFinite(r)) throw new GeometryError('Circle parameters must be finite numbers', { kind: 'invalid-input', module: 'primitive' })
  if (r < 0) throw new GeometryError('Circle radius must be non-negative', { kind: 'invalid-input', module: 'primitive' })
  return Object.freeze({ __brand: 'Circle' as const, cx, cy, r })
}
export function Ellipse(cx: number, cy: number, rx: number, ry: number): _Ellipse {
  if (!Number.isFinite(cx) || !Number.isFinite(cy) || !Number.isFinite(rx) || !Number.isFinite(ry)) throw new GeometryError('Ellipse parameters must be finite numbers', { kind: 'invalid-input', module: 'primitive' })
  if (rx < 0 || ry < 0) throw new GeometryError('Ellipse radii must be non-negative', { kind: 'invalid-input', module: 'primitive' })
  return Object.freeze({ __brand: 'Ellipse' as const, cx, cy, rx, ry })
}

/* ─────────────────────── Line / Segment / Ray ─────────────────────── */
export function Line(p1: _Point, p2: _Point): _Line { return Object.freeze({ __brand: 'Line' as const, p1, p2 }) }
export function Segment(start: _Point, end: _Point): _Segment { return Object.freeze({ __brand: 'Segment' as const, start, end }) }
export function Ray(origin: _Point, direction: _Vector): _Ray { return Object.freeze({ __brand: 'Ray' as const, origin, direction }) }

/* ─────────────────────── Polygon / Polyline / Path ─────────────────────── */
export function Polygon(points: ReadonlyArray<_Point>): _Polygon {
  return Object.freeze({ __brand: 'Polygon' as const, points: Object.freeze(points.slice()) })
}
export function Polyline(points: ReadonlyArray<_Point>): _Polyline {
  return Object.freeze({ __brand: 'Polyline' as const, points: Object.freeze(points.slice()) })
}
export function Path(commands: ReadonlyArray<_PathCommand>): _Path {
  return Object.freeze({ __brand: 'Path' as const, commands: Object.freeze(commands.slice()) })
}

/* ─────────────────────── Bezier ─────────────────────── */
export function Bezier2(p0: _Point, p1: _Point, p2: _Point): _Bezier2 { return Object.freeze({ __brand: 'Bezier2' as const, p0, p1, p2 }) }
export function Bezier3(p0: _Point, p1: _Point, p2: _Point, p3: _Point): _Bezier3 { return Object.freeze({ __brand: 'Bezier3' as const, p0, p1, p2, p3 }) }
