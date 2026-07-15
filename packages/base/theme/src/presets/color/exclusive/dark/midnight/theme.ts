import type { ThemeConfig } from '../../../../../theme/types.ts'

/**
 * dark 专属主题 - 深夜
 *
 * 以深紫蓝为主色，极深底色营造沉浸专注的夜间办公氛围，
 * 适用于开发者工具、数据监控以及需要长时间沉浸使用的专业后台产品。
 */
export const midnightTheme: ThemeConfig = {
  name: 'midnight',
  label: '深夜',
  mode: 'dark',
  source: 'builtin',
  tokens: {
    primary: '#1E1B4B',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
    emphasis: '#8B5CF6',
    default: '#94A3B8',
  },
  bgTokens: {
    primary: '#0B1120',
    secondary: '#020617',
    tertiary: '#1E293B',
    quaternary: '#334155',
    quinary: '#475569',
  },
}
