// 工厂(值导出)
export * from './factories.js'

// 类型导出(与值同名,但为 type-only 导出,不影响值空间)
export { type Point, type Point3D, type Vector, type Vector3D } from './types.js'
export { type Rect, type Box3D, type Circle, type Ellipse } from './types.js'
export { type Line, type Segment, type Ray, type Polygon, type Polyline, type Path } from './types.js'
export { type Bezier2, type Bezier3 } from './types.js'
export type { PathCommand, Shape, JsonShape } from './types.js'

export { serialize, deserialize } from './serialize.js'
