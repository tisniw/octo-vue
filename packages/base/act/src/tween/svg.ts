/**
 * tween/svg · SVG 属性插值 (0.0.5 §5.9.4)
 */
import type { SvgAttrKind } from './types.js'

const SVG_NUMERIC_ATTRS: ReadonlySet<string> = new Set([
  'cx', 'cy', 'r', 'rx', 'ry',
  'x', 'y', 'width', 'height',
  'x1', 'y1', 'x2', 'y2', 'offset',
])
const SVG_COLOR_ATTRS: ReadonlySet<string> = new Set([
  'fill', 'stroke', 'stop-color', 'flood-color',
])
const SVG_PATH_ATTRS: ReadonlySet<string> = new Set(['d'])
const SVG_POINTS_ATTRS: ReadonlySet<string> = new Set(['points'])

/** 判断 SVG 属性类型 */
export function isSvgAttr(key: string): SvgAttrKind {
  if (SVG_NUMERIC_ATTRS.has(key)) return 'numeric'
  if (SVG_COLOR_ATTRS.has(key)) return 'color'
  if (SVG_PATH_ATTRS.has(key)) return 'path'
  if (SVG_POINTS_ATTRS.has(key)) return 'points'
  return null
}

/** 简单颜色解析 */
function parseColor(value: string): { r: number; g: number; b: number; a: number } | null {
  const hex = value.match(/^#([0-9A-Fa-f]{3,8})$/)
  if (hex) {
    const v = hex[1]!
    if (v.length === 3) {
      return {
        r: parseInt(v[0]! + v[0]!, 16),
        g: parseInt(v[1]! + v[1]!, 16),
        b: parseInt(v[2]! + v[2]!, 16),
        a: 1,
      }
    }
    if (v.length === 6) {
      return {
        r: parseInt(v.slice(0, 2), 16),
        g: parseInt(v.slice(2, 4), 16),
        b: parseInt(v.slice(4, 6), 16),
        a: 1,
      }
    }
  }
  const rgb = value.match(/^rgba?\(\s*([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)(?:\s*,\s*([0-9.]+))?\s*\)$/i)
  if (rgb) {
    return {
      r: parseFloat(rgb[1]!),
      g: parseFloat(rgb[2]!),
      b: parseFloat(rgb[3]!),
      a: rgb[4] ? parseFloat(rgb[4]) : 1,
    }
  }
  return null
}

function formatColor(c: { r: number; g: number; b: number; a: number }): string {
  if (c.a >= 1) return `rgb(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)})`
  return `rgba(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)}, ${c.a.toFixed(3)})`
}

function interpolateColor(a: { r: number; g: number; b: number; a: number }, b: { r: number; g: number; b: number; a: number }, t: number) {
  return {
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t,
    a: a.a + (b.a - a.a) * t,
  }
}

/** SVG 属性插值 */
export function interpolateSvgAttr(
  key: string,
  fromValue: string | number,
  toValue: string | number,
  t: number,
  // 依赖 path / points 插值 — 通过回调注入避免循环
  interpolatePathFn?: (a: string, b: string, t: number) => string,
  interpolatePointsFn?: (a: string, b: string, t: number) => string,
): string {
  const kind = isSvgAttr(key)
  if (!kind) return t < 0.5 ? String(fromValue) : String(toValue)

  if (kind === 'numeric') {
    const from = Number(fromValue)
    const to = Number(toValue)
    if (Number.isNaN(from) || Number.isNaN(to)) {
      return t < 0.5 ? String(fromValue) : String(toValue)
    }
    return String(from + (to - from) * t)
  }
  if (kind === 'color') {
    const a = parseColor(String(fromValue))
    const b = parseColor(String(toValue))
    if (!a || !b) return t < 0.5 ? String(fromValue) : String(toValue)
    return formatColor(interpolateColor(a, b, t))
  }
  if (kind === 'path') {
    return interpolatePathFn
      ? interpolatePathFn(String(fromValue), String(toValue), t)
      : (t < 0.5 ? String(fromValue) : String(toValue))
  }
  if (kind === 'points') {
    return interpolatePointsFn
      ? interpolatePointsFn(String(fromValue), String(toValue), t)
      : (t < 0.5 ? String(fromValue) : String(toValue))
  }
  return String(toValue)
}