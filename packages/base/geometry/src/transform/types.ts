import type { Radian } from '../shared/types.js'
import type { Point, Line } from '../primitive/types.js'

/**
 * 变换描述符(可序列化 / 可组合)
 */
export type Transform =
  | { readonly type: 'translate'; readonly dx: number; readonly dy: number }
  | { readonly type: 'rotate'; readonly angle: Radian; readonly origin?: Point }
  | { readonly type: 'scale'; readonly sx: number; readonly sy: number; readonly origin?: Point }
  | { readonly type: 'reflect'; readonly axis: 'x' | 'y' | 'xy' | Line }
  | { readonly type: 'shear'; readonly sx: number; readonly sy: number }

/** 坐标系类型标识 */
export type CoordSystem = 'screen' | 'world' | 'local' | 'view'
