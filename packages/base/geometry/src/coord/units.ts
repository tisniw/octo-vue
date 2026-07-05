import type { Degree, Radian } from '../shared/types.js'
import { DEG2RAD, RAD2DEG } from '../shared/constants.js'

/** 角度转弧度工厂 */
export function Radian(value: number | Degree): Radian {
  if (typeof value === 'number' && (value as any).__brand === 'Degree') {
    return (value as number * DEG2RAD) as Radian
  }
  return value as Radian
}

/** 弧度转角度工厂 */
export function Degree(value: number | Radian): Degree {
  if (typeof value === 'number' && (value as any).__brand === 'Radian') {
    return (value as number * RAD2DEG) as Degree
  }
  return value as Degree
}

/** DPI 配置 */
export interface DPI {
  readonly value: number
}

export const DEFAULT_DPI: DPI = { value: 96 }

/** 厘米转像素 */
export function cmToPx(cm: number, dpi: number = 96): number {
  return cm * dpi / 2.54
}

/** 像素转厘米 */
export function pxToCm(px: number, dpi: number = 96): number {
  return px * 2.54 / dpi
}

/** 英寸转像素 */
export function inchToPx(inch: number, dpi: number = 96): number {
  return inch * dpi
}

/** 像素转英寸 */
export function pxToInch(px: number, dpi: number = 96): number {
  return px / dpi
}
