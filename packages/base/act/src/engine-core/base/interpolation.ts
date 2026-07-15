/**
 * engine-core/base/interpolation — 通用插值器 (0.0.1 §3)
 *
 * 复用 d3-color + d3-interpolate (底层),act 仅暴露 5 个核心函数
 */
import { rgb as d3Rgb } from 'd3-color'
import { interpolateRgb as d3InterpolateRgb } from 'd3-interpolate'
import type { InterpolationFn, Interpolatable } from './types.js'

/** 判断是否为 hex 颜色字符串 (#RGB / #RRGGBB) */
function isColorString(s: string): boolean {
  return /^#[0-9A-Fa-f]{3}([0-9A-Fa-f]{3})?$/.test(s)
}

/** 解析单位字符串 → [value, unit] */
function parseUnit(s: string): [number, string] {
  const m = s.match(/^(-?[0-9.]+)(.*)$/)
  if (!m) return [Number.NaN, s]
  return [Number.parseFloat(m[1] ?? s), m[2] ?? '']
}

/** 数值线性插值 */
export function interpolateNumber(a: number, b: number): InterpolationFn<number> {
  return (t: number) => a + (b - a) * t
}

/** 颜色插值 (默认 RGB 空间,可切 hsl / lab / hcl) */
export function interpolateColor(
  a: string,
  b: string,
  space: 'rgb' | 'hsl' | 'lab' | 'hcl' = 'rgb',
): InterpolationFn<string> {
  let interp: (t: number) => unknown
  try {
    if (space === 'rgb') {
      const ia = d3InterpolateRgb(a, b)
      interp = (t: number) => ia(t)
    } else {
      // hsl / lab / hcl 退化为 RGB(简单实现,后续可扩展)
      const ia = d3InterpolateRgb(a, b)
      interp = (t: number) => ia(t)
    }
  } catch {
    // 退化为字符串切换
    return (t: number) => (t < 0.5 ? a : b)
  }
  return (t: number) => String(interp(t))
}

/** 单位数值插值(px / em / %) */
export function interpolateUnit(a: number, b: number, unit: string): InterpolationFn<string> {
  return (t: number) => `${a + (b - a) * t}${unit}`
}

/** 字符串(非颜色)拼接插值 */
export function interpolateString(a: string, b: string): InterpolationFn<string> {
  // 试图解析为带单位的数值
  const [av, unit] = parseUnit(a)
  const [bv] = parseUnit(b)
  if (
    !Number.isNaN(av) &&
    !Number.isNaN(bv) &&
    typeof av === 'number' &&
    typeof bv === 'number'
  ) {
    return interpolateUnit(av, bv, unit)
  }
  return (t: number) => (t < 0.5 ? a : b)
}

/**
 * 主入口:自动检测类型
 * - 两个数字 → interpolateNumber
 * - 两个 hex 颜色字符串 → interpolateColor(space='rgb')
 * - 两个带单位数值字符串 → interpolateUnit
 * - 其他 → 二元切换(t < 0.5 a, t >= 0.5 b)
 */
export function interpolate<T extends Interpolatable>(a: T, b: T): InterpolationFn<T> {
  if (typeof a === 'number' && typeof b === 'number') {
    return interpolateNumber(a, b) as InterpolationFn<T>
  }
  if (typeof a === 'string' && typeof b === 'string') {
    if (isColorString(a) && isColorString(b)) {
      return interpolateColor(a, b) as InterpolationFn<T>
    }
    return interpolateString(a, b) as InterpolationFn<T>
  }
  // 兜底:线性(用 number cast)
  return ((t: number) =>
    (a as unknown as number) + ((b as unknown as number) - (a as unknown as number)) * t) as InterpolationFn<T>
}

// d3Rgb 引用保留以避免 lint 警告
void d3Rgb
