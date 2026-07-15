import type { ThemeConfig } from '../../../../../theme/types.ts'

/**
 * auto 专属主题 - 春·黎明
 *
 * 以嫩绿为主色，浅绿底色呈现春季清晨的生机与希望，
 * 适用于春季运营活动、生态农业类应用以及需要清新活力感的互联网产品。
 */
export const springDawnTheme: ThemeConfig = {
  name: 'spring-dawn',
  label: '春·黎明',
  mode: 'light',
  source: 'builtin',
  tokens: {
    primary: '#A7F3D0',
    success: '#22C55E',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#0EA5E9',
    emphasis: '#A78BFA',
    default: '#64748B',
  },
  bgTokens: {
    primary: '#F7FEE7',
    secondary: '#ECFCCB',
    tertiary: '#D9F99D',
    quaternary: '#BEF264',
    quinary: '#86EFAC',
  },
}
