import type { ThemeConfig } from '../../../../theme/types.ts'

/**
 * shared 专属主题 - 薄荷
 *
 * 以薄荷绿为主色，清新浅绿底色营造清凉通透的视觉体验，
 * 适用于健康生活类应用、现代科技产品以及需要清新感与信任感的数字服务界面。
 */
export const mintTheme: ThemeConfig = {
  name: 'mint',
  label: '薄荷',
  mode: 'light',
  source: 'builtin',
  tokens: {
    primary: '#10B981',
    success: '#22C55E',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#06B6D4',
    emphasis: '#8B5CF6',
    default: '#64748B',
  },
  bgTokens: {
    primary: '#F0FDF4',
    secondary: '#DCFCE7',
    tertiary: '#BBF7D0',
    quaternary: '#86EFAC',
    quinary: '#4ADE80',
  },
}
