import type { ThemeConfig } from '../../../../../theme/types.ts'

/**
 * auto 专属主题 - 冬·黎明
 *
 * 以冰蓝为主色，浅蓝底色呈现冬日清晨的清冽与纯净，
 * 适用于冬季运营活动、节庆主题场景以及需要清爽冷感的冰雪运动类应用。
 */
export const winterDawnTheme: ThemeConfig = {
  name: 'winter-dawn',
  label: '冬·黎明',
  mode: 'light',
  source: 'builtin',
  tokens: {
    primary: '#7DD3FC',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#0284C7',
    emphasis: '#7C3AED',
    default: '#64748B',
  },
  bgTokens: {
    primary: '#F0F9FF',
    secondary: '#E0F2FE',
    tertiary: '#BAE6FD',
    quaternary: '#7DD3FC',
    quinary: '#38BDF8',
  },
}
