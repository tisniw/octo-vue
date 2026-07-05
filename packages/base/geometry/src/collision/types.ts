import type { Vector, Point } from '../primitive/types.js'

/**
 * 碰撞检测的统一返回结构
 */
export interface CollisionResult {
  /** 是否碰撞 */
  readonly collided: boolean
  /** 最小穿透向量(单位向量,指向 a 应当推开的方向) */
  readonly mtv: Vector
  /** 穿透深度(mtv 等价模长) */
  readonly depth: number
  /** 接触点 */
  readonly contact: Point
}

/** 胶囊体(线段 + 半径) */
export interface Capsule {
  readonly start: Point
  readonly end: Point
  readonly r: number
}
