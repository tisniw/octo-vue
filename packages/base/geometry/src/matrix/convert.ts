import { GeometryError } from '../shared/error.js'
import type { Matrix3D } from './Matrix3D.js'
import { Matrix2D } from './Matrix2D.js'
import type { Matrix2D as Matrix2DType } from './Matrix2D.js'
import { Matrix3D as Matrix3DFn } from './Matrix3D.js'

/** Matrix2D → Matrix3D(升维) */
export function matrix2DTo3D(m: Matrix2DType): Matrix3D {
  return Matrix3DFn([
    m.a, m.b, 0, 0,
    m.c, m.d, 0, 0,
    0, 0, 1, 0,
    m.tx, m.ty, 0, 1,
  ])
}

/** Matrix3D → Matrix2D(降维,仅当 z 轴为单位) */
export function matrix3DTo2D(m: Matrix3D): Matrix2DType {
  if (m.m[2] !== 0 || m.m[6] !== 0 || m.m[10] !== 1 || m.m[14] !== 0) {
    throw new GeometryError('Matrix3D cannot be downcast to Matrix2D (non-affine z-axis)', {
      kind: 'unsupported', module: 'matrix',
    })
  }
  return new Matrix2D(m.m[0], m.m[1], m.m[4], m.m[5], m.m[12], m.m[13])
}
