import type { ThemeConfig } from '../../../theme/types.js'

/**
 * shared 专属主题 - 海岛
 *
 * 以天蓝为主色，暖黄沙滩底色呈现热带海岛的明媚氛围，
 * 适用于度假旅行、生活方式类应用以及需要轻快愉悦感的消费级产品。
 */
export const islandTheme: ThemeConfig = {
  name: 'island',
  label: '海岛',
  mode: 'light',
  source: 'builtin',
  tokens: {
    primary: '#0EA5E9',
    success: '#14B8A6',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
    emphasis: '#6366F1',
    default: '#64748B',
  },
  bgTokens: {
    primary: '#FFFEF7',
    secondary: '#FEF9E7',
    tertiary: '#FBF1CF',
    quaternary: '#F5E4B0',
    quinary: '#E8D38A',
  },
}
