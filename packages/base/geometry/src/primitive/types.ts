import type { DeepReadonly } from '../shared/types.js'

/** 2D 不可变点 */
export type Point = DeepReadonly<{
  readonly __brand: 'Point'
  readonly x: number
  readonly y: number
}>

/** 3D 不可变点 */
export type Point3D = DeepReadonly<{
  readonly __brand: 'Point3D'
  readonly x: number
  readonly y: number
  readonly z: number
}>

/** 2D 不可变向量 */
export type Vector = DeepReadonly<{
  readonly __brand: 'Vector'
  readonly x: number
  readonly y: number
}>

/** 3D 不可变向量 */
export type Vector3D = DeepReadonly<{
  readonly __brand: 'Vector3D'
  readonly x: number
  readonly y: number
  readonly z: number
}>

/** 矩形(左上角 + 宽高) */
export type Rect = DeepReadonly<{
  readonly __brand: 'Rect'
  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number
}>

/** 3D 轴对齐包围盒 */
export type Box3D = DeepReadonly<{
  readonly __brand: 'Box3D'
  readonly x: number
  readonly y: number
  readonly z: number
  readonly width: number
  readonly height: number
  readonly depth: number
}>

/** 圆形 */
export type Circle = DeepReadonly<{
  readonly __brand: 'Circle'
  readonly cx: number
  readonly cy: number
  readonly r: number
}>

/** 椭圆 */
export type Ellipse = DeepReadonly<{
  readonly __brand: 'Ellipse'
  readonly cx: number
  readonly cy: number
  readonly rx: number
  readonly ry: number
}>

/** 无限直线(用两点表示方向) */
export type Line = DeepReadonly<{
  readonly __brand: 'Line'
  readonly p1: Point
  readonly p2: Point
}>

/** 有限线段 */
export type Segment = DeepReadonly<{
  readonly __brand: 'Segment'
  readonly start: Point
  readonly end: Point
}>

/** 射线(原点 + 方向向量) */
export type Ray = DeepReadonly<{
  readonly __brand: 'Ray'
  readonly origin: Point
  readonly direction: Vector
}>

/** 多边形(闭合) */
export type Polygon = DeepReadonly<{
  readonly __brand: 'Polygon'
  readonly points: ReadonlyArray<Point>
}>

/** 折线(不闭合) */
export type Polyline = DeepReadonly<{
  readonly __brand: 'Polyline'
  readonly points: ReadonlyArray<Point>
}>

/** SVG Path 命令 */
export type PathCommand =
  | { readonly type: 'M'; readonly x: number; readonly y: number }
  | { readonly type: 'L'; readonly x: number; readonly y: number }
  | { readonly type: 'C'; readonly x1: number; readonly y1: number; readonly x2: number; readonly y2: number; readonly x: number; readonly y: number }
  | { readonly type: 'Q'; readonly x1: number; readonly y1: number; readonly x: number; readonly y: number }
  | { readonly type: 'Z' }

/** 路径 */
export type Path = DeepReadonly<{
  readonly __brand: 'Path'
  readonly commands: ReadonlyArray<PathCommand>
}>

/** 二次贝塞尔曲线 */
export type Bezier2 = DeepReadonly<{
  readonly __brand: 'Bezier2'
  readonly p0: Point
  readonly p1: Point
  readonly p2: Point
}>

/** 三次贝塞尔曲线 */
export type Bezier3 = DeepReadonly<{
  readonly __brand: 'Bezier3'
  readonly p0: Point
  readonly p1: Point
  readonly p2: Point
  readonly p3: Point
}>

/** 所有图元的联合类型 */
export type Shape =
  | Point | Point3D | Vector | Vector3D
  | Rect | Box3D | Circle | Ellipse
  | Line | Segment | Ray | Polygon | Polyline | Path
  | Bezier2 | Bezier3

/** JSON 化的图元 */
export type JsonShape =
  | { type: 'Point'; x: number; y: number }
  | { type: 'Point3D'; x: number; y: number; z: number }
  | { type: 'Vector'; x: number; y: number }
  | { type: 'Vector3D'; x: number; y: number; z: number }
  | { type: 'Rect'; x: number; y: number; width: number; height: number }
  | { type: 'Box3D'; x: number; y: number; z: number; width: number; height: number; depth: number }
  | { type: 'Circle'; cx: number; cy: number; r: number }
  | { type: 'Ellipse'; cx: number; cy: number; rx: number; ry: number }
  | { type: 'Line'; p1: { x: number; y: number }; p2: { x: number; y: number } }
  | { type: 'Segment'; start: { x: number; y: number }; end: { x: number; y: number } }
  | { type: 'Ray'; origin: { x: number; y: number }; direction: { x: number; y: number } }
  | { type: 'Polygon'; points: Array<{ x: number; y: number }> }
  | { type: 'Polyline'; points: Array<{ x: number; y: number }> }
  | { type: 'Path'; commands: PathCommand[] }
  | { type: 'Bezier2'; p0: { x: number; y: number }; p1: { x: number; y: number }; p2: { x: number; y: number } }
  | { type: 'Bezier3'; p0: { x: number; y: number }; p1: { x: number; y: number }; p2: { x: number; y: number }; p3: { x: number; y: number } }
