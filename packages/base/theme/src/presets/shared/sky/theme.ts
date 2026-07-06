import type { ThemeConfig } from '../../../theme/types.js'

/**
 * shared 专属主题 - 天空
 *
 * 以天蓝为主色，通透浅蓝底色呈现晴空万里的清爽与开阔，
 * 适用于天气出行、航空物流类应用以及需要明朗开阔感的工具型与信息展示类产品。
 */
export const skyTheme: ThemeConfig = {
  name: 'sky',
  label: '天空',
  mode: 'light',
  source: 'builtin',
  tokens: {
    primary: '#38BDF8',
    success: '#34D399',
    error: '#F87171',
    warning: '#FBBF24',
    info: '#60A5FA',
    emphasis: '#A78BFA',
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
