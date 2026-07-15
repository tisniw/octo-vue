import type { ThemeConfig } from '../../../../../theme/types.ts'

/**
 * future 专属主题 - 全息
 *
 * 以全息青为主色在深蓝底色中呈现全息投影般的彩虹光晕，
 * 适用于 AI 助手、增强现实界面以及需要前卫科技感的数字化交互产品。
 */
export const hologramTheme: ThemeConfig = {
  name: 'hologram',
  label: '全息',
  mode: 'dark',
  source: 'builtin',
  tokens: {
    primary: '#22D3EE',
    success: '#34D399',
    error: '#F87171',
    warning: '#FBBF24',
    info: '#60A5FA',
    emphasis: '#A78BFA',
    default: '#94A3B8',
  },
  bgTokens: {
    primary: '#020617',
    secondary: '#0A1428',
    tertiary: '#0F1B33',
    quaternary: '#162847',
    quinary: '#1E355C',
  },
}
