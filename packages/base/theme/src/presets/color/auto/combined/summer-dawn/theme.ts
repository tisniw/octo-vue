import type { ThemeConfig } from '../../../../../theme/types.ts'

/**
 * auto 专属主题 - 夏·黎明
 *
 * 以金黄为主色，暖黄底色呈现夏季清晨的明媚与炙热，
 * 适用于夏季运营活动、户外运动类应用以及需要活力感与行动号召力的消费级产品。
 */
export const summerDawnTheme: ThemeConfig = {
  name: 'summer-dawn',
  label: '夏·黎明',
  mode: 'light',
  source: 'builtin',
  tokens: {
    primary: '#FBBF24',
    success: '#22C55E',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#0EA5E9',
    emphasis: '#EC4899',
    default: '#64748B',
  },
  bgTokens: {
    primary: '#FFFBEB',
    secondary: '#FEF3C7',
    tertiary: '#FDE68A',
    quaternary: '#FCD34D',
    quinary: '#FBBF24',
  },
}
