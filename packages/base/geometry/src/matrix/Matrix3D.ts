import { GeometryError } from '../shared/error.js'
import type { DeepReadonly } from '../shared/types.js'
import type { Radian } from '../shared/types.js'
import type { Point3D, Vector3D } from '../primitive/types.js'
import { Point3D as Point3DFn, Vector3D as Vector3DFn } from '../primitive/factories.js'

/** 3D 投影变换矩阵(16 元素 4x4,列优先) */
export interface Matrix3D extends DeepReadonly<{
  readonly __brand: 'Matrix3D'
  readonly m: ReadonlyArray<number>
}> {}

export function Matrix3D(m: ReadonlyArray<number>): Matrix3D {
  if (m.length !== 16) {
    throw new GeometryError('Matrix3D must have 16 elements', { kind: 'invalid-input', module: 'matrix' })
  }
  return Object.freeze({ __brand: 'Matrix3D' as const, m: Object.freeze([...m]) })
}

Matrix3D.identity = (): Matrix3D => Matrix3D([
  1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1,
])

Matrix3D.perspective = (fov: Radian, aspect: number, near: number, far: number): Matrix3D => {
  const f = 1 / Math.tan(fov / 2)
  const nf = 1 / (near - far)
  return Matrix3D([
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (far + near) * nf, -1,
    0, 0, 2 * far * near * nf, 0,
  ])
}

Matrix3D.orthographic = (left: number, right: number, bottom: number, top: number, near: number, far: number): Matrix3D => {
  const lr = 1 / (left - right); const bt = 1 / (bottom - top); const nf = 1 / (near - far)
  return Matrix3D([
    -2 * lr, 0, 0, 0,
    0, -2 * bt, 0, 0,
    0, 0, 2 * nf, 0,
    (left + right) * lr, (top + bottom) * bt, (far + near) * nf, 1,
  ])
}

Matrix3D.lookAt = (eye: Point3D, target: Point3D, up: Vector3D): Matrix3D => {
  const z = v3Normalize(Vector3DFn(eye.x - target.x, eye.y - target.y, eye.z - target.z))
  const x = v3Normalize(Vector3DFn(up.y * z.z - up.z * z.y, up.z * z.x - up.x * z.z, up.x * z.y - up.y * z.x))
  const y = Vector3DFn(z.y * x.z - z.z * x.y, z.z * x.x - z.x * x.z, z.x * x.y - z.y * x.x)
  return Matrix3D([
    x.x, x.y, x.z, 0, y.x, y.y, y.z, 0, z.x, z.y, z.z, 0,
    -(x.x * eye.x + x.y * eye.y + x.z * eye.z),
    -(y.x * eye.x + y.y * eye.y + y.z * eye.z),
    -(z.x * eye.x + z.y * eye.y + z.z * eye.z), 1,
  ])
}

function v3Normalize(v: Vector3D): Vector3D {
  const len = Math.hypot(v.x, v.y, v.z)
  if (len < 1e-10) throw new GeometryError('Cannot normalize zero vector', { kind: 'degenerate', module: 'matrix' })
  return Vector3DFn(v.x / len, v.y / len, v.z / len)
}

/* ─── Matrix3D operations ─── */

export function multiply3D(a: Matrix3D, b: Matrix3D): Matrix3D {
  const out = new Array(16).fill(0)
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) for (let k = 0; k < 4; k++)
    out[i * 4 + j] += a.m[k * 4 + j] * b.m[i * 4 + k]
  return Matrix3D(out)
}

export function applyPoint3D(m: Matrix3D, p: Point3D): Point3D {
  return Point3DFn(m.m[0] * p.x + m.m[4] * p.y + m.m[8] * p.z + m.m[12],
                   m.m[1] * p.x + m.m[5] * p.y + m.m[9] * p.z + m.m[13],
                   m.m[2] * p.x + m.m[6] * p.y + m.m[10] * p.z + m.m[14])
}

export function applyVector3D(m: Matrix3D, v: Vector3D): Vector3D {
  return Vector3DFn(m.m[0] * v.x + m.m[4] * v.y + m.m[8] * v.z,
                    m.m[1] * v.x + m.m[5] * v.y + m.m[9] * v.z,
                    m.m[2] * v.x + m.m[6] * v.y + m.m[10] * v.z)
}

export function invert3D(m: Matrix3D): Matrix3D {
  const a = m.m; const out = new Array(16).fill(0)
  out[0] = a[5]*a[10]*a[15] - a[5]*a[11]*a[14] - a[9]*a[6]*a[15] + a[9]*a[7]*a[14] + a[13]*a[6]*a[11] - a[13]*a[7]*a[10]
  out[4] = -a[4]*a[10]*a[15] + a[4]*a[11]*a[14] + a[8]*a[6]*a[15] - a[8]*a[7]*a[14] - a[12]*a[6]*a[11] + a[12]*a[7]*a[10]
  out[8] = a[4]*a[9]*a[15] - a[4]*a[11]*a[13] - a[8]*a[5]*a[15] + a[8]*a[7]*a[13] + a[12]*a[5]*a[11] - a[12]*a[7]*a[9]
  out[12] = -a[4]*a[9]*a[14] + a[4]*a[10]*a[13] + a[8]*a[5]*a[14] - a[8]*a[6]*a[13] - a[12]*a[5]*a[10] + a[12]*a[6]*a[9]
  out[1] = -a[1]*a[10]*a[15] + a[1]*a[11]*a[14] + a[9]*a[2]*a[15] - a[9]*a[3]*a[14] - a[13]*a[2]*a[11] + a[13]*a[3]*a[10]
  out[5] = a[0]*a[10]*a[15] - a[0]*a[11]*a[14] - a[8]*a[2]*a[15] + a[8]*a[3]*a[14] + a[12]*a[2]*a[11] - a[12]*a[3]*a[10]
  out[9] = -a[0]*a[9]*a[15] + a[0]*a[11]*a[13] + a[8]*a[1]*a[15] - a[8]*a[3]*a[13] - a[12]*a[1]*a[11] + a[12]*a[3]*a[9]
  out[13] = a[0]*a[9]*a[14] - a[0]*a[10]*a[13] - a[8]*a[1]*a[14] + a[8]*a[2]*a[13] + a[12]*a[1]*a[10] - a[12]*a[2]*a[9]
  out[2] = a[1]*a[6]*a[15] - a[1]*a[7]*a[14] - a[5]*a[2]*a[15] + a[5]*a[3]*a[14] + a[13]*a[2]*a[7] - a[13]*a[3]*a[6]
  out[6] = -a[0]*a[6]*a[15] + a[0]*a[7]*a[14] + a[4]*a[2]*a[15] - a[4]*a[3]*a[14] - a[12]*a[2]*a[7] + a[12]*a[3]*a[6]
  out[10] = a[0]*a[5]*a[15] - a[0]*a[7]*a[13] - a[4]*a[1]*a[15] + a[4]*a[3]*a[13] + a[12]*a[1]*a[7] - a[12]*a[3]*a[5]
  out[14] = -a[0]*a[5]*a[14] + a[0]*a[6]*a[13] + a[4]*a[1]*a[14] - a[4]*a[2]*a[13] - a[12]*a[1]*a[6] + a[12]*a[2]*a[5]
  out[3] = -a[1]*a[6]*a[11] + a[1]*a[7]*a[10] + a[5]*a[2]*a[11] - a[5]*a[3]*a[10] - a[9]*a[2]*a[7] + a[9]*a[3]*a[6]
  out[7] = a[0]*a[6]*a[11] - a[0]*a[7]*a[10] - a[4]*a[2]*a[11] + a[4]*a[3]*a[10] + a[8]*a[2]*a[7] - a[8]*a[3]*a[6]
  out[11] = -a[0]*a[5]*a[11] + a[0]*a[7]*a[9] + a[4]*a[1]*a[11] - a[4]*a[3]*a[9] - a[8]*a[1]*a[7] + a[8]*a[3]*a[5]
  out[15] = a[0]*a[5]*a[10] - a[0]*a[6]*a[9] - a[4]*a[1]*a[10] + a[4]*a[2]*a[9] + a[8]*a[1]*a[6] - a[8]*a[2]*a[5]
  const det = a[0]*out[0] + a[1]*out[4] + a[2]*out[8] + a[3]*out[12]
  if (Math.abs(det) < 1e-10) throw new GeometryError('Matrix3D is not invertible', { kind: 'unsupported', module: 'matrix' })
  const invDet = 1 / det; for (let i = 0; i < 16; i++) out[i] *= invDet
  return Matrix3D(out)
}

export function transpose3D(m: Matrix3D): Matrix3D {
  const a = m.m
  return Matrix3D([a[0], a[4], a[8], a[12], a[1], a[5], a[9], a[13], a[2], a[6], a[10], a[14], a[3], a[7], a[11], a[15]])
}
