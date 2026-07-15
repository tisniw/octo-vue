/**
 * tween/targets · TweenTarget 解析 + CSS Variable 读写 + CSS Value 解析 (0.0.5 §5.3 + §5.7)
 */
import { interpolateColor, interpolateString } from '../engine-core/base/interpolation.js'
import type {
  CssVarPrefix,
  CssValueParsed,
  TweenObjectTarget,
  TweenTarget,
  TweenTargetResolved,
} from './types.js'

// ============================================================
// 类型辅助 — 避免 as unknown as
// ============================================================

/** 可索引的 CSSStyleDeclaration 视图(允许任意字符串键写 style 属性) */
type IndexableCSSStyle = {
  [key: string]: string | number | undefined
}

/** 可索引的 CSSStyleDeclaration 只读视图 */
type IndexableCSSStyleReadonly = CSSStyleDeclaration & Record<string, string>

/** 可索引的普通对象 target */
type IndexableObject = Record<string, number | string | undefined>

/** 强类型 style 写入工具 */
function setStyleProp(style: CSSStyleDeclaration, key: string, value: number | string): void {
  ;(style as unknown as IndexableCSSStyle)[key] = value
}

function getStyleProp(style: CSSStyleDeclaration, key: string): string | undefined {
  return (style as unknown as IndexableCSSStyle)[key] as string | undefined
}

function getComputedProp(style: CSSStyleDeclaration, key: string): string | undefined {
  return (style as unknown as IndexableCSSStyleReadonly)[key]
}

// ============================================================
// Target 解析(§5.3)
// ============================================================

/** 解析 TweenTarget → 内部表示 */
export function resolveTarget(target: TweenTarget): TweenTargetResolved {
  if (typeof HTMLElement !== 'undefined' && target instanceof HTMLElement) {
    return { kind: 'dom', element: target }
  }
  if (typeof SVGElement !== 'undefined' && target instanceof SVGElement) {
    // SVGElement 继承自 Element 但 TS 类型系统中 HTMLElement 不继承 SVGElement
    // 这里通过实例检查 + 安全断言(SVG 元素可赋值给 HTMLElement 内部使用)
    return { kind: 'dom', element: target as unknown as HTMLElement }
  }
  if (
    typeof target === 'object' &&
    target !== null &&
    'kind' in target &&
    (target as { kind: string }).kind === 'css-var'
  ) {
    return { kind: 'dom', element: (target as { element: HTMLElement }).element }
  }
  return { kind: 'object', obj: target as TweenObjectTarget }
}

// ============================================================
// CSS Variable 守卫与读写(§5.7.3 + §5.7.4)
// ============================================================

/** 判断键名是否为 CSS Variable(-- 前缀) */
export function isCssVarKey(key: string): key is CssVarPrefix {
  return key.startsWith('--')
}

/** 解析 css-var target */
export function resolveCssVarTarget(
  target: HTMLElement,
  key: string,
): { element: HTMLElement; varName: string } {
  if (!isCssVarKey(key)) {
    throw new Error(`[act/tween] "${key}" 不是合法 CSS Variable(-- 前缀)`)
  }
  return { element: target, varName: key }
}

/** 读取 CSS Variable 计算值 */
export function readCssVar(element: HTMLElement, varName: string): string {
  return getComputedStyle(element).getPropertyValue(varName).trim()
}

/** 写入 CSS Variable */
export function writeCssVar(element: HTMLElement, varName: string, value: string): void {
  element.style.setProperty(varName, value)
}

// ============================================================
// CSS Value 解析与插值(§5.7.5)
// ============================================================

/** 颜色字符串判定 */
function isColorString(s: string): boolean {
  // hex / rgb() / rgba() / hsl() / hsla()
  if (/^#[0-9A-Fa-f]{3}([0-9A-Fa-f]{3})?$/.test(s)) return true
  if (/^rgba?\(/i.test(s)) return true
  if (/^hsla?\(/i.test(s)) return true
  return false
}

/** 解析 CSS value → 中间表示 */
export function parseCssValue(value: string | number): CssValueParsed {
  if (typeof value === 'number') {
    return { kind: 'number', number: value, raw: String(value) }
  }
  if (isColorString(value)) {
    try {
      const interp = interpolateColor(value, value)
      // d3 返回 rgb string,这里我们使用 interpColor 来验证;真正解析使用 d3 不可行
      // 所以用更简化的方法 — 通过 interpolateColor 输出格式推断
      void interp
    } catch {
      // ignore
    }
    // 解析 rgb/hsl → 内部 rgba
    const rgba = parseColorString(value)
    if (rgba) {
      return { kind: 'color', color: rgba, raw: value }
    }
  }
  return { kind: 'string', raw: value }
}

/** 插值两个中间表示 */
export function interpolateCssValue(
  from: CssValueParsed,
  to: CssValueParsed,
  t: number,
): string {
  if (from.kind === 'number' && to.kind === 'number') {
    const unit = extractUnit(from.raw, to.raw)
    return `${from.number + (to.number - from.number) * t}${unit}`
  }
  if (from.kind === 'color' && to.kind === 'color') {
    return formatColor({
      r: from.color.r + (to.color.r - from.color.r) * t,
      g: from.color.g + (to.color.g - from.color.g) * t,
      b: from.color.b + (to.color.b - from.color.b) * t,
      a: from.color.a + (to.color.a - from.color.a) * t,
    })
  }
  // 字符串或类型不一致:锐切换
  return t < 0.5 ? from.raw : to.raw
}

/** 提取单位(px / em / %) */
function extractUnit(fromRaw: string, toRaw: string): string {
  const m = fromRaw.match(/[a-z%]+$/i) || toRaw.match(/[a-z%]+$/i)
  return m ? m[0] : ''
}

/** 简单颜色字符串解析(支持 hex / rgb() / rgba()) */
function parseColorString(s: string): { r: number; g: number; b: number; a: number } | null {
  const hex = s.match(/^#([0-9A-Fa-f]{3,8})$/)
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
    if (v.length === 8) {
      return {
        r: parseInt(v.slice(0, 2), 16),
        g: parseInt(v.slice(2, 4), 16),
        b: parseInt(v.slice(4, 6), 16),
        a: parseInt(v.slice(6, 8), 16) / 255,
      }
    }
  }
  const rgb = s.match(/^rgba?\(\s*([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)(?:\s*,\s*([0-9.]+))?\s*\)$/i)
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

/** 输出 rgb/rgba 字符串 */
function formatColor(c: { r: number; g: number; b: number; a: number }): string {
  const r = Math.round(c.r)
  const g = Math.round(c.g)
  const b = Math.round(c.b)
  if (c.a >= 1) return `rgb(${r}, ${g}, ${b})`
  return `rgba(${r}, ${g}, ${b}, ${c.a.toFixed(3)})`
}

/** 字符串切换插值(显式入口) */
export { interpolateString }

// ============================================================
// 读取 DOM 属性(§5.4)
// ============================================================

/** 读取 DOM element 的 style 属性 */
export function readDOMProperty(element: HTMLElement, key: string): number | string {
  if (isCssVarKey(key)) {
    return readCssVar(element, key)
  }
  const styleVal = getStyleProp(element.style, key)
  if (styleVal !== undefined && styleVal !== '') {
    const num = Number.parseFloat(styleVal)
    if (!Number.isNaN(num)) return num
    return styleVal
  }
  const computed = getComputedStyle(element)
  const computedVal = getComputedProp(computed, key)
  if (computedVal) {
    const num = Number.parseFloat(computedVal)
    if (!Number.isNaN(num)) return num
    return computedVal
  }
  return 0
}

// ============================================================
// 写入 Target(§5.7.6)
// ============================================================

/** 写入解析后的 target */
export function writeTargetValue(
  resolved: TweenTargetResolved,
  key: string,
  value: number | string,
): void {
  if (resolved.kind === 'dom') {
    // CSS Variable 走专门分支
    if (isCssVarKey(key)) {
      const cssVal = typeof value === 'number' ? String(value) : value
      writeCssVar(resolved.element, key, cssVal)
      return
    }
    // 普通 DOM style 属性
    setStyleProp(resolved.element.style, key, value)
    return
  }
  // 普通对象
  ;(resolved.obj as IndexableObject)[key] = value
}

/** 写入 CSS Value(支持插值)到 DOM target */
export function writeCssValueToDom(
  element: HTMLElement,
  key: string,
  cssValue: string,
): void {
  if (isCssVarKey(key)) {
    writeCssVar(element, key, cssValue)
  } else {
    setStyleProp(element.style, key, cssValue)
  }
}