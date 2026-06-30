import { color as d3Color, hsl as d3Hsl, rgb as d3Rgb, lab as d3Lab } from 'd3-color'
import type { RGBColor, HSLColor, LabColor } from 'd3-color'

export interface ColorInstance {
  /** 内部 d3 颜色实例 */
  readonly _d3: RGBColor
  /** 当前透明度 */
  readonly alpha: number
  /** R 通道（0-255） */
  readonly r: number
  /** G 通道 */
  readonly g: number
  /** B 通道 */
  readonly b: number
  toHex(): string
  toHexAlpha(): string
  toRgb(): string
  toRgba(): string
  toHsl(): string
  toHsla(): string
  toObject(): { r: number; g: number; b: number; a: number }
  isDisplayable(): boolean
}

export type ColorInput =
  | string
  | [number, number, number]
  | [number, number, number, number]
  | { r: number; g: number; b: number; a?: number }
  | { h: number; s: number; l: number; a?: number }

function toRgb(input: ColorInput): RGBColor {
  if (typeof input === 'string') {
    const c = d3Color(input)
    if (!c) throw new Error(`Invalid color: ${input}`)
    return c.rgb()
  }
  if (Array.isArray(input)) {
    const [r, g, b, a = 1] = input
    return d3Rgb(r, g, b, a)
  }
  if ('r' in input) {
    return d3Rgb(input.r, input.g, input.b, input.a ?? 1)
  }
  return d3Hsl(input.h, input.s, input.l, input.a ?? 1).rgb()
}

function wrap(rgb: RGBColor): ColorInstance {
  return {
    _d3: rgb,
    get alpha() {
      return rgb.opacity
    },
    get r() {
      return rgb.r
    },
    get g() {
      return rgb.g
    },
    get b() {
      return rgb.b
    },
    toHex() {
      return rgb.formatHex()
    },
    toHexAlpha() {
      return rgb.formatHex()
    },
    toRgb() {
      return rgb.formatRgb()
    },
    toRgba() {
      return `rgba(${Math.round(rgb.r)}, ${Math.round(rgb.g)}, ${Math.round(rgb.b)}, ${rgb.opacity})`
    },
    toHsl() {
      return d3Hsl(rgb).formatHsl()
    },
    toHsla() {
      const h = d3Hsl(rgb)
      return `hsla(${h.h}, ${h.s * 100}%, ${h.l * 100}%, ${h.opacity})`
    },
    toObject() {
      return { r: rgb.r, g: rgb.g, b: rgb.b, a: rgb.opacity }
    },
    isDisplayable() {
      return rgb.displayable()
    },
  }
}

/** 解析颜色（支持 hex / rgb / hsl 字符串与数字元组） */
export function parseColor(input: ColorInput): ColorInstance {
  return wrap(toRgb(input))
}

/** 解析失败抛错 */
export function parseColorStrict(input: ColorInput): ColorInstance {
  return parseColor(input)
}

/** 尝试解析（失败返回 undefined） */
export function tryParseColor(input: unknown): ColorInstance | undefined {
  try {
    return parseColor(input as ColorInput)
  } catch {
    return undefined
  }
}

export interface RgbObject { r: number; g: number; b: number; a: number }
export interface HslObject { h: number; s: number; l: number; a: number }
export interface HsvObject { h: number; s: number; v: number; a: number }

/** 转为 RGB 对象 */
export function toRgbObject(color: ColorInstance): RgbObject {
  return color.toObject()
}

/** 转为 HSL 对象 */
export function toHslObject(color: ColorInstance): HslObject {
  const h = d3Hsl(color._d3)
  return { h: h.h, s: h.s, l: h.l, a: h.opacity }
}

function rgbToHsv(r: number, g: number, b: number, a: number): HsvObject {
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const d = max - min
  let h = 0
  if (d !== 0) {
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
    else if (max === g) h = ((b - r) / d + 2) / 6
    else h = ((r - g) / d + 4) / 6
  }
  return { h: h * 360, s: max === 0 ? 0 : d / max, v: max / 255, a }
}

/** 转为 HSV 对象 */
export function toHsvObject(color: ColorInstance): HsvObject {
  return rgbToHsv(color.r, color.g, color.b, color.alpha)
}

/** 转为 hex 字符串 */
export function toHex(color: ColorInstance): string {
  return color.toHex()
}

/** 转为 hex 字符串（含 alpha） */
export function toHexAlpha(color: ColorInstance): string {
  return color.toHexAlpha()
}

/** 提亮（基于 HSL L 通道，默认 +0.1） */
export function lighten(color: ColorInstance, amount = 0.1): ColorInstance {
  const h = d3Hsl(color._d3)
  h.l = Math.min(1, h.l + amount)
  return wrap(h.rgb())
}

/** 变暗（基于 HSL L 通道，默认 -0.1） */
export function darken(color: ColorInstance, amount = 0.1): ColorInstance {
  const h = d3Hsl(color._d3)
  h.l = Math.max(0, h.l - amount)
  return wrap(h.rgb())
}

/** 饱和度调整（默认 +0.1） */
export function saturate(color: ColorInstance, amount = 0.1): ColorInstance {
  const h = d3Hsl(color._d3)
  h.s = Math.min(1, h.s + amount)
  return wrap(h.rgb())
}

/** 去饱和 */
export function desaturate(color: ColorInstance, amount = 0.1): ColorInstance {
  const h = d3Hsl(color._d3)
  h.s = Math.max(0, h.s - amount)
  return wrap(h.rgb())
}

/** 完全去饱和（灰色） */
export function grayscale(color: ColorInstance): ColorInstance {
  return desaturate(color, 1)
}

/** 反色 */
export function invert(color: ColorInstance): ColorInstance {
  const rgb = color._d3
  return wrap(d3Rgb(255 - rgb.r, 255 - rgb.g, 255 - rgb.b, rgb.opacity))
}

/** 设置透明度 */
export function setAlpha(color: ColorInstance, alpha: number): ColorInstance {
  const rgb = color._d3.copy()
  rgb.opacity = Math.max(0, Math.min(1, alpha))
  return wrap(rgb)
}

/** 增加透明度 */
export function fadeIn(color: ColorInstance, amount = 0.1): ColorInstance {
  return setAlpha(color, color.alpha + amount)
}

/** 降低透明度 */
export function fadeOut(color: ColorInstance, amount = 0.1): ColorInstance {
  return setAlpha(color, color.alpha - amount)
}

/** 完全不透明（alpha = 1） */
export function opaque(color: ColorInstance): ColorInstance {
  return setAlpha(color, 1)
}

/** 色相旋转（角度制） */
export function rotateHue(color: ColorInstance, degrees: number): ColorInstance {
  const h = d3Hsl(color._d3)
  h.h = (h.h + degrees) % 360
  return wrap(h.rgb())
}

/** 互补色（色相 +180°） */
export function complement(color: ColorInstance): ColorInstance {
  return rotateHue(color, 180)
}

/** 三元色（色相 ±120°） */
export function triadic(color: ColorInstance): [ColorInstance, ColorInstance] {
  return [rotateHue(color, 120), rotateHue(color, -120)]
}

/** 四元色（色相 ±90°） */
export function tetradic(color: ColorInstance): [ColorInstance, ColorInstance, ColorInstance] {
  return [rotateHue(color, 90), complement(color), rotateHue(color, -90)]
}

/** 类似色（色相 ±30°） */
export function analogous(color: ColorInstance): [ColorInstance, ColorInstance] {
  return [rotateHue(color, 30), rotateHue(color, -30)]
}

/** 线性混合（默认 50:50） */
export function mix(
  color1: ColorInstance,
  color2: ColorInstance,
  ratio = 0.5
): ColorInstance {
  const a1 = 1 - ratio
  const a2 = ratio
  const r = color1.r * a1 + color2.r * a2
  const g = color1.g * a1 + color2.g * a2
  const b = color1.b * a1 + color2.b * a2
  const alpha = color1.alpha * a1 + color2.alpha * a2
  return wrap(d3Rgb(r, g, b, alpha))
}

/** 叠加（以 color2 为主，color1 叠加） */
export function overlay(color1: ColorInstance, color2: ColorInstance): ColorInstance {
  const c2 = color2._d3
  const c1 = color1._d3
  const r = c1.r <= 128 ? (2 * c1.r * c2.r) / 255 : 255 - (2 * (255 - c1.r) * (255 - c2.r)) / 255
  const g = c1.g <= 128 ? (2 * c1.g * c2.g) / 255 : 255 - (2 * (255 - c1.g) * (255 - c2.g)) / 255
  const b = c1.b <= 128 ? (2 * c1.b * c2.b) / 255 : 255 - (2 * (255 - c1.b) * (255 - c2.b)) / 255
  return wrap(d3Rgb(r, g, b, c2.opacity))
}

/** 滤色 */
export function screen(color1: ColorInstance, color2: ColorInstance): ColorInstance {
  const c2 = color2._d3
  const c1 = color1._d3
  return wrap(
    d3Rgb(
      255 - ((255 - c1.r) * (255 - c2.r)) / 255,
      255 - ((255 - c1.g) * (255 - c2.g)) / 255,
      255 - ((255 - c1.b) * (255 - c2.b)) / 255,
      c2.opacity
    )
  )
}

/** 正片叠底 */
export function multiply(color1: ColorInstance, color2: ColorInstance): ColorInstance {
  const c2 = color2._d3
  const c1 = color1._d3
  return wrap(
    d3Rgb(
      (c1.r * c2.r) / 255,
      (c1.g * c2.g) / 255,
      (c1.b * c2.b) / 255,
      c2.opacity
    )
  )
}

/** 在两个颜色间插值（返回插值函数，用于动画） */
export function interpolate(
  color1: ColorInstance,
  color2: ColorInstance
): (t: number) => ColorInstance {
  return (t: number) => mix(color1, color2, t)
}

function luminance(color: ColorInstance): number {
  const { r, g, b } = color._d3
  const a = [r, g, b].map((v) => {
    v /= 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  })
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722
}

/** 计算两个颜色的对比度（WCAG 标准，1-21） */
export function contrastRatio(color1: ColorInstance, color2: ColorInstance): number {
  const l1 = luminance(color1)
  const l2 = luminance(color2)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

/** 是否满足 WCAG AA 文本对比度（≥ 4.5） */
export function isReadable(
  text: ColorInstance,
  background: ColorInstance,
  level: 'AA' | 'AAA' = 'AA'
): boolean {
  const threshold = level === 'AAA' ? 7 : 4.5
  return contrastRatio(text, background) >= threshold
}

/** 自动选择黑或白作为前景色 */
export function getContrastColor(background: ColorInstance): ColorInstance {
  return luminance(background) > 0.5 ? wrap(d3Rgb(0, 0, 0)) : wrap(d3Rgb(255, 255, 255))
}

/** 主色 + 5 级亮度阶梯 */
export function generatePalette(base: ColorInstance): {
  lightest: ColorInstance
  lighter: ColorInstance
  light: ColorInstance
  base: ColorInstance
  dark: ColorInstance
  darker: ColorInstance
  darkest: ColorInstance
} {
  return {
    lightest: lighten(base, 0.5),
    lighter: lighten(base, 0.3),
    light: lighten(base, 0.1),
    base,
    dark: darken(base, 0.1),
    darker: darken(base, 0.3),
    darkest: darken(base, 0.5),
  }
}

const NAMED_COLORS: Record<string, string> = {
  aliceblue: '#f0f8ff', antiquewhite: '#faebd7', aqua: '#00ffff', aquamarine: '#7fffd4',
  azure: '#f0ffff', beige: '#f5f5dc', bisque: '#ffe4c4', black: '#000000',
  blanchedalmond: '#ffebcd', blue: '#0000ff', blueviolet: '#8a2be2', brown: '#a52a2a',
  burlywood: '#deb887', cadetblue: '#5f9ea0', chartreuse: '#7fff00', chocolate: '#d2691e',
  coral: '#ff7f50', cornflowerblue: '#6495ed', cornsilk: '#fff8dc', crimson: '#dc143c',
  cyan: '#00ffff', darkblue: '#00008b', darkcyan: '#008b8b', darkgoldenrod: '#b8860b',
  darkgray: '#a9a9a9', darkgreen: '#006400', darkgrey: '#a9a9a9', darkkhaki: '#bdb76b',
  darkmagenta: '#8b008b', darkolivegreen: '#556b2f', darkorange: '#ff8c00', darkorchid: '#9932cc',
  darkred: '#8b0000', darksalmon: '#e9967a', darkseagreen: '#8fbc8f', darkslateblue: '#483d8b',
  darkslategray: '#2f4f4f', darkslategrey: '#2f4f4f', darkturquoise: '#00ced1', darkviolet: '#9400d3',
  deeppink: '#ff1493', deepskyblue: '#00bfff', dimgray: '#696969', dimgrey: '#696969',
  dodgerblue: '#1e90ff', firebrick: '#b22222', floralwhite: '#fffaf0', forestgreen: '#228b22',
  fuchsia: '#ff00ff', gainsboro: '#dcdcdc', ghostwhite: '#f8f8ff', gold: '#ffd700',
  goldenrod: '#daa520', gray: '#808080', green: '#008000', greenyellow: '#adff2f',
  grey: '#808080', honeydew: '#f0fff0', hotpink: '#ff69b4', indianred: '#cd5c5c',
  indigo: '#4b0082', ivory: '#fffff0', khaki: '#f0e68c', lavender: '#e6e6fa',
  lavenderblush: '#fff0f5', lawngreen: '#7cfc00', lemonchiffon: '#fffacd', lightblue: '#add8e6',
  lightcoral: '#f08080', lightcyan: '#e0ffff', lightgoldenrodyellow: '#fafad2', lightgray: '#d3d3d3',
  lightgreen: '#90ee90', lightgrey: '#d3d3d3', lightpink: '#ffb6c1', lightsalmon: '#ffa07a',
  lightseagreen: '#20b2aa', lightskyblue: '#87cefa', lightslategray: '#778899', lightslategrey: '#778899',
  lightsteelblue: '#b0c4de', lightyellow: '#ffffe0', lime: '#00ff00', limegreen: '#32cd32',
  linen: '#faf0e6', magenta: '#ff00ff', maroon: '#800000', mediumaquamarine: '#66cdaa',
  mediumblue: '#0000cd', mediumorchid: '#ba55d3', mediumpurple: '#9370db', mediumseagreen: '#3cb371',
  mediumslateblue: '#7b68ee', mediumspringgreen: '#00fa9a', mediumturquoise: '#48d1cc', mediumvioletred: '#c71585',
  midnightblue: '#191970', mintcream: '#f5fffa', mistyrose: '#ffe4e1', moccasin: '#ffe4b5',
  navajowhite: '#ffdead', navy: '#000080', oldlace: '#fdf5e6', olive: '#808000',
  olivedrab: '#6b8e23', orange: '#ffa500', orangered: '#ff4500', orchid: '#da70d6',
  palegoldenrod: '#eee8aa', palegreen: '#98fb98', paleturquoise: '#afeeee', palevioletred: '#db7093',
  papayawhip: '#ffefd5', peachpuff: '#ffdab9', peru: '#cd853f', pink: '#ffc0cb',
  plum: '#dda0dd', powderblue: '#b0e0e6', purple: '#800080', rebeccapurple: '#663399',
  red: '#ff0000', rosybrown: '#bc8f8f', royalblue: '#4169e1', saddlebrown: '#8b4513',
  salmon: '#fa8072', sandybrown: '#f4a460', seagreen: '#2e8b57', seashell: '#fff5ee',
  sienna: '#a0522d', silver: '#c0c0c0', skyblue: '#87ceeb', slateblue: '#6a5acd',
  slategray: '#708090', slategrey: '#708090', snow: '#fffafa', springgreen: '#00ff7f',
  steelblue: '#4682b4', tan: '#d2b48c', teal: '#008080', thistle: '#d8bfd8',
  tomato: '#ff6347', turquoise: '#40e0d0', violet: '#ee82ee', wheat: '#f5deb3',
  white: '#ffffff', whitesmoke: '#f5f5f5', yellow: '#ffff00', yellowgreen: '#9acd32',
}

/** 获取颜色感知名（基于 CSS 命名色表） */
export function getColorName(color: ColorInstance): string | undefined {
  const hex = color.toHex().toLowerCase()
  for (const [name, value] of Object.entries(NAMED_COLORS)) {
    if (value.toLowerCase() === hex) return name
  }
  return undefined
}

/** 是否为 CSS 命名颜色 */
export function isNamedColor(name: string): boolean {
  return name.toLowerCase() in NAMED_COLORS
}
