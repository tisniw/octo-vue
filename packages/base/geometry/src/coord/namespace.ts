import { invert } from '../matrix/Matrix2D.js'
import { applyPoint } from '../matrix/apply.js'
import { screenToWorld, worldToScreen, localToWorld, worldToLocal } from '../transform/coord.js'
import { cmToPx, pxToCm, inchToPx, pxToInch } from './units.js'
import type { Point } from '../primitive/types.js'
import type { Matrix2D } from '../matrix/Matrix2D.js'
import type { Degree, Radian } from '../shared/types.js'

/**
 * coord 命名空间
 */
export const coord = {
  screen: {
    toWorld: screenToWorld,
    fromWorld: (p: Point, view: Matrix2D): Point => worldToScreen(p, view),
    fromEvent: (e: { clientX: number; clientY: number }): Point => {
      return { __brand: 'Point', x: e.clientX, y: e.clientY } as Point
    },
  } as const,

  world: {
    toScreen: worldToScreen,
    toLocal: worldToLocal,
    fromLocal: localToWorld,
  } as const,

  view: {
    toScreen: (viewP: Point, view: Matrix2D): Point => worldToScreen(viewP, view),
    toWorld: (viewP: Point, view: Matrix2D): Point => applyPoint(invert(view), viewP),
    fromWorld: (worldP: Point, view: Matrix2D): Point => applyPoint(view, worldP),
  } as const,

  local: {
    toWorld: localToWorld,
    fromWorld: worldToLocal,
  } as const,

  angle: {
    degToRad: (deg: Degree): Radian => deg * (Math.PI / 180) as Radian,
    radToDeg: (rad: Radian): Degree => rad * (180 / Math.PI) as Degree,
  } as const,

  unit: {
    cmToPx,
    pxToCm,
    inchToPx,
    pxToInch,
  } as const,
} as const
