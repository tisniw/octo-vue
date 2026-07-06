import type { ThemeConfig } from '../../../theme/types.js'

/**
 * shared 专属主题 - 蓝
 *
 * 以标准蓝为主色，浅蓝底色提供清晰可用的色彩层次，
 * 适用于需要明确导航结构与状态指引的通用企业级产品与工具类应用。
 */
export const blueTheme: ThemeConfig = {
  name: 'blue',
  label: '蓝',
  mode: 'light',
  source: 'builtin',
  tokens: {
    primary: '#2563EB',
    success: '#16A34A',
    error: '#DC2626',
    warning: '#F59E0B',
    info: '#0284C7',
    emphasis: '#7C3AED',
    default: '#475569',
  },
  bgTokens: {
    primary: '#EFF6FF',
    secondary: '#DBEAFE',
    tertiary: '#BFDBFE',
    quaternary: '#93C5FD',
    quinary: '#60A5FA',
  },
}
