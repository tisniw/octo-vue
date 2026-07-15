import type { Rgb } from './types.js'

// ============================================================================
// 1. 错误体系
// ============================================================================

export type ThemeErrorKind =
  | 'invalid-input'
  | 'invalid-color'
  | 'duplicate-registration'
  | 'reserved-name'
  | 'not-found'
  | 'unsupported'
  | 'runtime'
  | 'unknown'

export class ThemeError extends Error {
  readonly kind: ThemeErrorKind
  readonly module?: string
  readonly cause?: unknown

  constructor(
    message: string,
    options?: {
      kind?: ThemeErrorKind
      module?: string
      cause?: unknown
    },
  ) {
    super(message)
    this.name = 'ThemeError'
    this.kind = options?.kind ?? 'unknown'
    this.module = options?.module
    this.cause = options?.cause

    Object.setPrototypeOf(this, new.target.prototype)
  }
}

// ============================================================================
// 2. 颜色转换
// ============================================================================

/** 判断是否为 6 位 hex 颜色 */
export function isHexColor(value: unknown): value is string {
  return typeof value === 'string' && /^#[0-9A-Fa-f]{6}$/.test(value)
}

/** hex → Rgb (0-255) */
export function hexToRgb(hex: string): Rgb {
  const normalized = hex.trim().toLowerCase()
  if (!isHexColor(normalized)) {
    throw new Error(`Invalid hex color: ${hex}`)
  }
  const int = Number.parseInt(normalized.slice(1), 16)
  return {
    r: (int >> 16) & 0xff,
    g: (int >> 8) & 0xff,
    b: int & 0xff,
  }
}

/** Rgb → 小写 hex */
export function rgbToHex({ r, g, b }: Rgb): string {
  const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

// ============================================================================
// 3. 数学工具
// ============================================================================

/** 将数值限制在 [min, max] */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

// ============================================================================
// 4. 环境检测
// ============================================================================

/** 是否处于浏览器环境 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined'
}

/** 简易深拷贝兜底 */
export function deepClone<T>(value: T): T {
  try {
    if (typeof structuredClone === 'function') {
      return structuredClone(value)
    }
  } catch {
    // fallback
  }
  return JSON.parse(JSON.stringify(value)) as T
}

// ============================================================================
// 5. WCAG 对比度
// ============================================================================

/**
 * WCAG 2.x 相对亮度(0..1)。
 *
 * 算法: sRGB → linear RGB,使用 s <= 0.03928 ? s/12.92 : ((s+0.055)/1.055)^2.4。
 */
export function relativeLuminance(r: number, g: number, b: number): number {
  const channel = (c: number): number => {
    const s = clamp(c, 0, 255) / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  }
  const rs = channel(r)
  const gs = channel(g)
  const bs = channel(b)
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

/**
 * WCAG 对比度(1..21)。
 *
 * 取较亮 / 较暗的相对亮度,按 (lighter + 0.05) / (darker + 0.05) 计算。
 * - 同色 → 1
 * - 白 vs 黑 → 21
 * - WCAG AA 文本 ≥ 4.5
 * - WCAG AAA 文本 ≥ 7.0
 */
export function contrastRatio(fg: Rgb, bg: Rgb): number {
  const l1 = relativeLuminance(fg.r, fg.g, fg.b)
  const l2 = relativeLuminance(bg.r, bg.g, bg.b)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * alpha-over 合成(0 ≤ alpha ≤ 1)。
 *
 * 用于透明度 / 模糊合成:`fg` 覆盖在 `bg` 上,`alpha` 表示 `fg` 的不透明度。
 */
export function alphaOver(fg: Rgb, bg: Rgb, alpha: number): Rgb {
  const a = clamp(alpha, 0, 1)
  return {
    r: Math.round(fg.r * a + bg.r * (1 - a)),
    g: Math.round(fg.g * a + bg.g * (1 - a)),
    b: Math.round(fg.b * a + bg.b * (1 - a)),
  }
}
