import type { Point } from '../primitive/types.js'

/** 坐标系类型标识 */
export type CoordSystem = 'screen' | 'world' | 'local' | 'view'

export interface ScreenCoord {
  readonly system: 'screen'
  readonly pixel: Point
}

export interface WorldCoord {
  readonly system: 'world'
  readonly point: Point
}

export interface ViewCoord {
  readonly system: 'view'
  readonly point: Point
}

export interface LocalCoord {
  readonly system: 'local'
  readonly point: Point
}
