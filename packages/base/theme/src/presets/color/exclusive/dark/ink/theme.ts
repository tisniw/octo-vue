import type { ThemeConfig } from '../../../../../theme/types.ts'

/**
 * dark 专属主题 - 暗黑
 *
 * 以靛蓝紫为主色的亮色点缀在深蓝灰底色上，
 * 呈现水墨画般的明暗对比，适用于注重视觉层次与阅读舒适度的通用深色场景。
 */
export const inkTheme: ThemeConfig = {
  name: 'ink',
  label: '暗黑',
  mode: 'dark',
  source: 'builtin',
  tokens: {
    primary: '#818CF8',
    success: '#34D399',
    error: '#F87171',
    warning: '#FBBF24',
    info: '#60A5FA',
    emphasis: '#A78BFA',
    default: '#94A3B8',
  },
  bgTokens: {
    primary: '#1E293B',
    secondary: '#0F172A',
    tertiary: '#334155',
    quaternary: '#475569',
    quinary: '#64748B',
  },
}
