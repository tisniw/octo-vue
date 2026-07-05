/** 可空值 */
export type Nullable<T> = T | null

/** 可选值 */
export type Optional<T> = T | undefined

/** 任意函数 */
export type AnyFn = (...args: any[]) => any

/** 任意对象 */
export type AnyObject = Record<string, any>

/** 深度 Readonly(用于不可变图元的类型约束) */
export type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K]
}

/** JSON 安全值(serialize / deserialize 用) */
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue }

/**
 * 角度单位:弧度(内部计算统一用弧度)
 * 品牌类型,避免与 Degree 混淆
 */
export type Radian = number & { readonly __brand: 'Radian' }

/**
 * 角度单位:度(API 接口对外暴露用度)
 * 品牌类型,避免与 Radian 混淆
 */
export type Degree = number & { readonly __brand: 'Degree' }

/** 距离单位:像素(2D 默认) / 世界单位(3D) */
export type Distance = number & { readonly __brand: 'Distance' }

/** 坐标轴标识 */
export type Axis = 'x' | 'y' | 'z'

/** 坐标平面标识 */
export type Plane = 'xy' | 'xz' | 'yz'
