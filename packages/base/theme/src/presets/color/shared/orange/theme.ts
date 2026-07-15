import type { ThemeConfig } from '../../../../theme/types.ts'

/**
 * shared 专属主题 - 橙
 *
 * 以活力橙为主色，暖黄底色传递热情与能量感，
 * 适用于电商促销、资讯热点类应用以及需要引导用户行动的高转化率场景。
 */
export const orangeTheme: ThemeConfig = {
  name: 'orange',
  label: '橙',
  mode: 'light',
  source: 'builtin',
  tokens: {
    primary: '#F97316',
    success: '#65A30D',
    error: '#DC2626',
    warning: '#F59E0B',
    info: '#0284C7',
    emphasis: '#7C3AED',
    default: '#7C2D12',
  },
  bgTokens: {
    primary: '#FFFBEB',
    secondary: '#FEF3C7',
    tertiary: '#FDE68A',
    quaternary: '#FCD34D',
    quinary: '#FBBF24',
  },
}
