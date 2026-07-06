import type { ThemeConfig } from '../../../../theme/types.js'

/**
 * auto 专属主题 - 春
 *
 * 以嫩绿为主色，浅黄绿底色呈现春季万物的萌动与生机，
 * 适用于按季节自动切换的春季主题以及需要清新感的户外生活类应用。
 */
export const springTheme: ThemeConfig = {
  name: 'spring',
  label: '春',
  mode: 'light',
  source: 'builtin',
  tokens: {
    primary: '#86EFAC',
    success: '#22C55E',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#06B6D4',
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
