/**
 * tween/array · 数组插值 (0.0.5 §5.9.6)
 */

/** 解析 SVG points 字符串 'x1,y1 x2,y2 ...' 或 'x1 y1 x2 y2' */
export function parsePoints(points: string): number[] {
  if (!points) return []
  return points.split(/[\s,]+/).filter(Boolean).map(Number)
}

/** 输出 points 字符串 */
export function stringifyPoints(arr: number[]): string {
  if (arr.length === 0) return ''
  return arr.map((n, i) => (i % 2 === 0 ? `${n},` : ` ${n}`)).join('').trimEnd()
}

/** points 插值 */
export function interpolatePoints(fromStr: string, toStr: string, t: number): string {
  const from = parsePoints(fromStr)
  const to = parsePoints(toStr)
  if (from.length !== to.length) {
    console.warn('[act/tween] Points 数组长度不同')
    return t < 0.5 ? fromStr : toStr
  }
  return stringifyPoints(from.map((v, i) => v + (to[i]! - v) * t))
}

/** 默认 number lerp */
function defaultLerp(a: unknown, b: unknown, k: number): unknown {
  if (typeof a === 'number' && typeof b === 'number') {
    return a + (b - a) * k
  }
  return b
}

/** 通用数组逐元素插值 */
export function interpolateArray<T>(
  from: T[],
  to: T[],
  t: number,
  elementLerp?: (a: T, b: T, t: number) => T,
): T[] {
  if (from.length !== to.length) {
    throw new RangeError(`[act/tween] interpolateArray 长度不一致: ${from.length} vs ${to.length}`)
  }
  const lerp: (a: T, b: T, k: number) => T = elementLerp ?? ((a, b, k) => defaultLerp(a, b, k) as T)
  return from.map((v, i) => lerp(v, to[i]!, t))
}