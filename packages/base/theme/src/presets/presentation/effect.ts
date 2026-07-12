import type { Presentation } from '../../theme/types.ts'

/**
 * 效果 token 默认值
 *
 * 包含阴影、透明度、层级三组,
 * 用于控制元素的视觉表现与叠加层叠。
 */

/** 阴影 token 默认值 (颜色由主题 --shadow-color 决定) */
export const DEFAULT_SHADOW_TOKENS: Presentation['shadow'] = {
  sm: '0 1px 2px 0 var(--shadow-color)',
  base: '0 1px 3px 0 var(--shadow-color), 0 1px 2px -1px var(--shadow-color)',
  md: '0 4px 6px -1px var(--shadow-color), 0 2px 4px -2px var(--shadow-color)',
  lg: '0 10px 15px -3px var(--shadow-color), 0 4px 6px -4px var(--shadow-color)',
  xl: '0 20px 25px -5px var(--shadow-color), 0 8px 10px -6px var(--shadow-color)',
}

/** 透明度token默认值 */
export const ALPHA_TOKENS: Record<string, string> = (() => {
  const entries: Record<string, string> = {}
  for (let i = 0; i <= 100; i += 5) {
    entries[String(i)] = String(i / 100)
  }
  return entries
})()

/** Z-index token默认值 */
export const DEFAULT_Z_INDEX_TOKENS: Presentation['zIndex'] = {
  base: '0',
  sticky: '10',
  dropdown: '20',
  fixed: '30',
  modal: '40',
  popover: '50',
  tooltip: '60',
}

export const DEFAULT_EFFECT_TOKENS: Pick<Presentation, 'shadow' | 'alpha' | 'zIndex'> = {
  shadow: DEFAULT_SHADOW_TOKENS,
  alpha: ALPHA_TOKENS,
  zIndex: DEFAULT_Z_INDEX_TOKENS,
}
