import type { Presentation } from '../../theme/types.ts'

/**
 * 布局 token 默认值
 * 包含尺寸、圆角、间距,
 * 用于控制元素的空间与几何形态。
 */

/** 尺寸 token 默认值 */
export const SIZE_TOKENS: Record<string, string> = (() => {
  const entries: Record<string, string> = {}
  for (let i = 0; i <= 32; i++) {
    entries[String(i)] = i === 0 ? '0px' : `${i * 0.25}rem`
  }
  return entries
})()

/** 圆角 token 默认值 */
export const DEFAULT_RADIUS_TOKENS: Presentation['radius'] = {
  none: '0px',
  xs: '0.125rem',
  sm: '0.25rem',
  base: '0.375rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  '2xl': '1.5rem',
  '3xl': '2rem',
  full: '9999px',
}

/** 间距 token 默认值  */
export const SPACING_TOKENS: Record<string, string> = (() => {
  const entries: Record<string, string> = {}
  for (let i = 0; i <= 24; i++) {
    entries[String(i)] = i === 0 ? '0px' : `${i * 0.25}rem`
  }
  return entries
})()

export const DEFAULT_LAYOUT_TOKENS: Pick<Presentation, 'size' | 'radius' | 'spacing'> = {
  size: SIZE_TOKENS,
  radius: DEFAULT_RADIUS_TOKENS,
  spacing: SPACING_TOKENS,
}
