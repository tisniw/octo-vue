import type { ThemeConfig } from '../../../../theme/types.js'

/**
 * auto 专属主题 - 冬
 *
 * 以冰蓝为主色，浅蓝底色呈现冬季雪景的冷冽与纯净，
 * 适用于按季节自动切换的冬季主题以及需要静谧冷感的节庆与商务类产品。
 */
export const winterTheme: ThemeConfig = {
  name: 'winter',
  label: '冬',
  mode: 'light',
  source: 'builtin',
  tokens: {
    primary: '#BAE6FD',
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
