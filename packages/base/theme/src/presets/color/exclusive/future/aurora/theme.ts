import type { ThemeConfig } from '../../../../../theme/types.ts'

/**
 * future 专属主题 - 极光
 *
 * 以冰蓝为主色的极光质感在深蓝黑底色中流动变幻，
 * 适用于天文科普、极地探险类应用以及需要空灵神秘感的未来科技产品。
 */
export const auroraTheme: ThemeConfig = {
  name: 'aurora',
  label: '极光',
  mode: 'dark',
  source: 'builtin',
  tokens: {
    primary: '#7DD3FC',
    success: '#34D399',
    error: '#F87171',
    warning: '#FBBF24',
    info: '#60A5FA',
    emphasis: '#A78BFA',
    default: '#E2E8F0',
  },
  bgTokens: {
    primary: '#020617',
    secondary: '#0F172A',
    tertiary: '#1E293B',
    quaternary: '#334155',
    quinary: '#475569',
  },
}
