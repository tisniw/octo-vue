import type { ThemeConfig } from '../../../../../theme/types.ts'

/**
 * auto 专属主题 - 春·黄昏
 *
 * 以粉紫为主色在深紫底色中呈现春日傍晚的浪漫与梦幻，
 * 适用于春季促销、夜晚场景化运营活动以及需要情感氛围的创意内容平台。
 */
export const springDuskTheme: ThemeConfig = {
  name: 'spring-dusk',
  label: '春·黄昏',
  mode: 'dark',
  source: 'builtin',
  tokens: {
    primary: '#F0ABFC',
    success: '#34D399',
    error: '#F87171',
    warning: '#FBBF24',
    info: '#60A5FA',
    emphasis: '#C084FC',
    default: '#94A3B8',
  },
  bgTokens: {
    primary: '#3B0764',
    secondary: '#581C87',
    tertiary: '#6B21A8',
    quaternary: '#7E22CE',
    quinary: '#9333EA',
  },
}
