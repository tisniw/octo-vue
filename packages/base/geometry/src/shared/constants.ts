import type { Radian } from './types.js'

/**
 * 浮点比较的容差。
 * 用于:矩阵行列式 ≈ 0 判断 / 点是否在线上 / 凸包退化判断
 */
export const EPSILON = 1e-10

/** 角度转弧度系数:deg * DEG2RAD = rad */
export const DEG2RAD = Math.PI / 180

/** 弧度转角度系数:rad * RAD2DEG = deg */
export const RAD2DEG = 180 / Math.PI

/** 2π(用于角度归一化) */
export const TAU: Radian = (Math.PI * 2) as Radian

/** π(用于弧度运算) */
export const PI: Radian = Math.PI as Radian

/** 默认矩阵浮点精度(用于 decompose 的数值稳定) */
export const MATRIX_EPSILON = 1e-8
