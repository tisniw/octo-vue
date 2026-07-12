import type { Presentation } from '../../theme/types.ts'

/**
 * 排版 token 默认值
 *
 * 包含字号、字重、行高、字体族 四组,
 * 用于控制文字与字体的视觉表现。
 */

/** 字号 token 默认值 */
export const DEFAULT_FONT_SIZE_TOKENS: Presentation['fontSize'] = {
  xxs: '0.625rem',
  xs: '0.75rem',
  sm: '0.875rem',
  base: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
  '3xl': '1.875rem',
  '4xl': '2.25rem',
  '5xl': '3rem',
}

/** 字重 token 默认值 */
export const DEFAULT_FONT_WEIGHT_TOKENS: Presentation['fontWeight'] = {
  thin: '100',
  extralight: '200',
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
}

/** 行高 token 默认值 */
export const DEFAULT_LEADING_TOKENS: Presentation['leading'] = {
  none: '1',
  tight: '1.25',
  snug: '1.375',
  normal: '1.5',
  relaxed: '1.625',
  loose: '2',
}

/** 字体族 token 默认值 */
export const DEFAULT_FONT_FAMILY_TOKENS: Presentation['fontFamily'] = {
  sans: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
}

/** 完整排版 token */
export const DEFAULT_TYPOGRAPHY_TOKENS: Pick<Presentation, 'fontSize' | 'fontWeight' | 'leading' | 'fontFamily'> = {
  fontSize: DEFAULT_FONT_SIZE_TOKENS,
  fontWeight: DEFAULT_FONT_WEIGHT_TOKENS,
  leading: DEFAULT_LEADING_TOKENS,
  fontFamily: DEFAULT_FONT_FAMILY_TOKENS,
}
