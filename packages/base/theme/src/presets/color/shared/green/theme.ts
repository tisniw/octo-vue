import type { ThemeConfig } from '../../../../theme/types.ts'

/**
 * shared 专属主题 - 绿
 *
 * 以翠绿为主色，浅绿底色构建生机自然的视觉感受，
 * 适用于健康环保类应用、数据分析看板以及与自然生态相关的数字化产品。
 */
export const greenTheme: ThemeConfig = {
  name: 'green',
  label: '绿',
  mode: 'light',
  source: 'builtin',
  tokens: {
    primary: '#16A34A',
    success: '#22C55E',
    error: '#DC2626',
    warning: '#F59E0B',
    info: '#0284C7',
    emphasis: '#7C3AED',
    default: '#3F6212',
  },
  bgTokens: {
    primary: '#F0FDF4',
    secondary: '#DCFCE7',
    tertiary: '#BBF7D0',
    quaternary: '#86EFAC',
    quinary: '#4ADE80',
  },
}
