import type {
  BackgroundTokens,
  BuildThemeInput,
  Hsv,
  ThemeConfig,
  ThemeMode,
  ThemeTokens,
} from './types.js'
import {
  DEFAULT_NON_COLOR_TOKENS,
  DEFAULT_TRANSITION,
  FALLBACK_BACKGROUND_TOKENS,
  FALLBACK_THEME_TOKENS,
} from './tokens.js'
import { clamp, deepClone, hexToRgb, rgbToHex } from './color.js'

// ============================================================================
// 1. 运行时常量 (原 constants.ts)
// ============================================================================

/** 持久化逻辑键名 (不含命名空间前缀) */
export const THEME_STORAGE_KEY = 'octovue-theme'

/** 浏览器 localStorage 中实际完整键名 (含 storage 适配器命名空间) */
export const THEME_STORAGE_KEY_NAMESPACED = 'octovue:local:octovue-theme'

/** 子键:通用变体全局开关 (logical key, 不含存储适配器命名空间前缀) */
export const VS_UNIVERSAL_ACTIVE_KEY = 'octovue-vs:universal-active'

/** 子键:自动贴换全局开关 */
export const VS_AUTO_ENABLED_KEY = 'octovue-vs:auto-enabled'

/** 浏览器 localStorage 中两子键的实际完整键名 */
export const VS_UNIVERSAL_ACTIVE_KEY_NAMESPACED = 'octovue:local:octovue-vs:universal-active'
export const VS_AUTO_ENABLED_KEY_NAMESPACED = 'octovue:local:octovue-vs:auto-enabled'

/** 旧版 localStorage 键名(供 migrateLegacyVisualStyleKeys 识别) */
export const LEGACY_KEYS = {
  THEME_CONFIG: 'octovue-theme-config',
  VS_CURRENT: 'octovue-vs:current',
  VS_VARIANT_PREFIX: 'octovue-vs:',
  VS_VARIANT_SUFFIX: ':variant',
  VS_MODE_SUFFIX: ':mode',
} as const

/** 子键正反序列化: '1' = true, '0' = false */
export function encodeBoolFlag(value: boolean): '1' | '0' {
  return value ? '1' : '0'
}

export function decodeBoolFlag(value: unknown, fallback: boolean): boolean {
  if (value === '1' || value === true || value === 1) return true
  if (value === '0' || value === false || value === 0) return false
  return fallback
}

/** 视觉层共享样式 CSS 变量前缀 (独立于主题层 --ov-*) */
export const VISUAL_STYLE_PREFIX = '--ov-vs'

/** 内置主题保留字 */
export const RESERVED_BUILTIN_THEME_NAMES: readonly string[] = ['light', 'dark', 'builtin', 'custom']

// ============================================================================
// 2. 色阶生成 (原 assemble/generateColorScale.ts)
// ============================================================================

/** RGB → HSV (h: 0-360, s/v: 0-100) */
export function rgbToHsv({ r, g, b }: { r: number; g: number; b: number }): Hsv {
  const rN = r / 255
  const gN = g / 255
  const bN = b / 255
  const max = Math.max(rN, gN, bN)
  const min = Math.min(rN, gN, bN)
  const d = max - min

  let h = 0
  if (d !== 0) {
    if (max === rN) h = ((gN - bN) / d) % 6
    else if (max === gN) h = (bN - rN) / d + 2
    else h = (rN - gN) / d + 4
    h = h * 60
    if (h < 0) h += 360
  }

  return {
    h: h === 360 ? 0 : h,
    s: max === 0 ? 0 : clamp((d / max) * 100, 0, 100),
    v: clamp(max * 100, 0, 100),
  }
}

/** HSV → RGB */
export function hsvToRgb({ h, s, v }: Hsv): { r: number; g: number; b: number } {
  const sN = clamp(s, 0, 100) / 100
  const vN = clamp(v, 0, 100) / 100
  const c = vN * sN
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = vN - c

  let r1 = 0
  let g1 = 0
  let b1 = 0

  if (h < 60) [r1, g1, b1] = [c, x, 0]
  else if (h < 120) [r1, g1, b1] = [x, c, 0]
  else if (h < 180) [r1, g1, b1] = [0, c, x]
  else if (h < 240) [r1, g1, b1] = [0, x, c]
  else if (h < 300) [r1, g1, b1] = [x, 0, c]
  else [r1, g1, b1] = [c, 0, x]

  return {
    r: Math.round((r1 + m) * 255),
    g: Math.round((g1 + m) * 255),
    b: Math.round((b1 + m) * 255),
  }
}

function toHsv(input: string | Hsv): Hsv {
  if (typeof input === 'string') return rgbToHsv(hexToRgb(input))
  return input
}

/** 功能色 10 阶生成 */
export function generateFunctionalScale(base: string | Hsv): string[] {
  const b = toHsv(base)
  const stops = [
    { s: 0.30, v: 1.10 },
    { s: 0.50, v: 1.04 },
    { s: 0.75, v: 0.98 },
    { s: 0.85, v: 0.92 },
    { s: 0.60, v: 0.65 },
    { s: 1.00, v: 0.55 },
    { s: 1.00, v: 0.42 },
    { s: 0.90, v: 0.55 },
    { s: 1.00, v: 0.45 },
    { s: 1.00, v: 0.30 },
  ]
  return stops.map(({ s, v }) =>
    rgbToHex(hsvToRgb({ h: b.h, s: clamp(b.s * s, 0, 100), v: clamp(b.v * v, 0, 100) })),
  )
}

/** 背景色 5 阶生成 (L2 = base) */
export function generateBackgroundScale(base: string | Hsv): string[] {
  const b = toHsv(base)
  const stops = [
    { s: 0.20, v: 1.15 },
    { s: 1.00, v: 1.00 },
    { s: 1.05, v: 0.97 },
    { s: 1.10, v: 0.94 },
    { s: 1.15, v: 0.90 },
  ]
  return stops.map(({ s, v }) =>
    rgbToHex(hsvToRgb({ h: b.h, s: clamp(b.s * s, 0, 100), v: clamp(b.v * v, 0, 100) })),
  )
}

/** 通用 N 阶色阶生成 (V 从浅到深均匀分布) */
export function generateColorScale(base: string, n: number): string[] {
  if (n <= 0) return []
  const b = toHsv(base)
  const output: string[] = []
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 0.5 : i / (n - 1)
    const v = clamp(10 + (b.v - 10) * (1 - t), 0, 100)
    const s = clamp(b.s * (0.5 + 0.5 * (1 - t)), 0, 100)
    output.push(rgbToHex(hsvToRgb({ h: b.h, s, v })))
  }
  return output
}

// ============================================================================
// 3. 主题组装 (原 assemble/buildTheme.ts + deriveTheme.ts + cloneTheme.ts)
// ============================================================================

/** 从完整 7 语义基色 + 完整 5 slot 背景基色 + 非颜色 token 组装完整 ThemeConfig。 */
export function buildTheme(input: BuildThemeInput): ThemeConfig {
  const tokens = input.baseTokens ?? FALLBACK_THEME_TOKENS
  const bgTokens = input.baseBgTokens ?? FALLBACK_BACKGROUND_TOKENS

  const transition = input.transition
    ? {
        duration: { ...DEFAULT_TRANSITION.duration, ...input.transition.duration },
        easing: input.transition.easing ?? DEFAULT_TRANSITION.easing,
        enabled: input.transition.enabled ?? DEFAULT_TRANSITION.enabled,
      }
    : DEFAULT_TRANSITION

  return {
    name: input.name,
    label: input.label,
    mode: input.mode,
    source: 'custom',
    tokens,
    bgTokens,
    transition,
    size: { ...DEFAULT_NON_COLOR_TOKENS.size, ...(input.size ?? {}) },
    radius: { ...DEFAULT_NON_COLOR_TOKENS.radius, ...(input.radius ?? {}) },
    spacing: { ...DEFAULT_NON_COLOR_TOKENS.spacing, ...(input.spacing ?? {}) },
    fontSize: { ...DEFAULT_NON_COLOR_TOKENS.fontSize, ...(input.fontSize ?? {}) },
    fontWeight: { ...DEFAULT_NON_COLOR_TOKENS.fontWeight, ...(input.fontWeight ?? {}) },
    leading: { ...DEFAULT_NON_COLOR_TOKENS.leading, ...(input.leading ?? {}) },
    fontFamily: { ...DEFAULT_NON_COLOR_TOKENS.fontFamily, ...(input.fontFamily ?? {}) },
    shadow: { ...DEFAULT_NON_COLOR_TOKENS.shadow, ...(input.shadow ?? {}) },
    alpha: { ...DEFAULT_NON_COLOR_TOKENS.alpha, ...(input.alpha ?? {}) },
    zIndex: { ...DEFAULT_NON_COLOR_TOKENS.zIndex, ...(input.zIndex ?? {}) },
  }
}

/** 从已有主题派生变体 (基色重映射) */
export function deriveTheme(
  source: ThemeConfig,
  overrides: {
    name?: string
    label?: string
    mode?: ThemeMode
    tokens?: Partial<ThemeTokens>
    bgTokens?: Partial<BackgroundTokens>
  } = {},
): ThemeConfig {
  const base = deepClone(source)
  return {
    ...base,
    name: overrides.name ?? `${source.name}-derived`,
    label: overrides.label ?? `${source.label} (派生)`,
    ...(overrides.mode !== undefined ? { mode: overrides.mode } : {}),
    tokens: { ...base.tokens, ...(overrides.tokens ?? {}) },
    bgTokens: { ...base.bgTokens, ...(overrides.bgTokens ?? {}) },
  }
}

/** 深拷贝 ThemeConfig */
export function cloneTheme(theme: ThemeConfig): ThemeConfig {
  return deepClone(theme)
}
