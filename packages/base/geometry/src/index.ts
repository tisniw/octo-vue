// @octovue/geometry 主入口 — 仅 re-export,不做运行时逻辑

// === primitive (values) ===
export {
  Point, Point3D, Vector, Vector3D, Rect, Box3D, Circle, Ellipse,
  Line, Segment, Ray, Polygon, Polyline, Path, Bezier2, Bezier3,
  pointWith, point3DWith, vectorWith, rectCenter, rectContains,
  vAdd, vSub, vScale, vDot, vCross, vLength, vNormalize,
  v3Add, v3Sub, v3Scale, v3Dot, v3Cross, v3Length, v3Normalize,
  serialize, deserialize,
} from './primitive/index.js'

// === matrix ===
export {
  Matrix2D, Matrix3D,
  multiply, invert, transpose, determinant,
  multiply3D, invert3D, transpose3D,
  decompose, matrixCompose,
  applyPoint, applyVector,
  applyPoint3D, applyVector3D,
  equals, equals3D,
  matrix2DTo3D, matrix3DTo2D,
} from './matrix/index.js'

// === util ===
export {
  distance, distanceSq, distance3D, distanceSq3D,
  angle, angleBetween, angleDeg, angleBetweenDeg,
  lerp, lerpNum, lerp3D, slerp,
  bezier2, bezier3, bezier3Samples,
  lineLine, lineRect, lineCircle, segmentSegment,
  bbox, centroid, convexHull,
} from './util/index.js'

// === transform ===
export {
  translate, rotate, scale, reflect, shear,
  compose, chain, toMatrix,
  screenToWorld, worldToScreen, localToWorld, worldToLocal,
} from './transform/index.js'

// === collision ===
export {
  aabb, obb, circle, capsule, polygon,
  pointInCircle, pointInPolygon,
  broadPhase,
  UniformGrid, Quadtree,
} from './collision/index.js'

// === coord ===
export { coord, Radian, Degree, DEFAULT_DPI, cmToPx, pxToCm, inchToPx, pxToInch } from './coord/index.js'

// === 公共类型(0.0.0) ===
export { GeometryError } from './shared/error.js'
export { EPSILON, MATRIX_EPSILON, DEG2RAD, RAD2DEG, TAU, PI } from './shared/constants.js'
export { clamp, uid, isFiniteNumber, isPlainObject, isArray, near } from './shared/utils.js'
