import type { ThemeConfig } from '../../../theme/types.js'

/**
 * shared 专属主题 - 紫
 *
 * 以深紫为主色，浅紫底色呈现神秘高贵的视觉气质，
 * 适用于创意设计类应用、会员特权展示以及需要差异化与高级感的品牌类产品。
 */
export const purpleTheme: ThemeConfig = {
  name: 'purple',
  label: '紫',
  mode: 'light',
  source: 'builtin',
  tokens: {
    primary: '#7C3AED',
    success: '#16A34A',
    error: '#DC2626',
    warning: '#F59E0B',
    info: '#2563EB',
    emphasis: '#A21CAF',
    default: '#4C1D95',
  },
  bgTokens: {
    primary: '#FAF5FF',
    secondary: '#F3E8FF',
    tertiary: '#E9D5FF',
    quaternary: '#D8B4FE',
    quinary: '#C084FC',
  },
}
