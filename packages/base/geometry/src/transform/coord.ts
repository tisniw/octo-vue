import { invert } from '../matrix/Matrix2D.js'
import { applyPoint } from '../matrix/apply.js'
import type { Matrix2D } from '../matrix/Matrix2D.js'
import type { Point } from '../primitive/types.js'

/** 屏幕坐标 → 世界坐标 */
export function screenToWorld(p: Point, view: Matrix2D): Point {
  return applyPoint(invert(view), p)
}

/** 世界坐标 → 屏幕坐标 */
export function worldToScreen(p: Point, view: Matrix2D): Point {
  return applyPoint(view, p)
}

/** 本地坐标 → 世界坐标 */
export function localToWorld(p: Point, parentMatrix: Matrix2D): Point {
  return applyPoint(parentMatrix, p)
}

/** 世界坐标 → 本地坐标 */
export function worldToLocal(p: Point, parentMatrix: Matrix2D): Point {
  return applyPoint(invert(parentMatrix), p)
}
