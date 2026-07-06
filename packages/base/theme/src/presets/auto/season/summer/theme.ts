import type { ThemeConfig } from '../../../../theme/types.js'

/**
 * auto 专属主题 - 夏
 *
 * 以明黄为主色，浅黄底色呈现夏季阳光的明快与热烈，
 * 适用于按季节自动切换的夏季主题以及需要阳光感的度假与运动类产品。
 */
export const summerTheme: ThemeConfig = {
  name: 'summer',
  label: '夏',
  mode: 'light',
  source: 'builtin',
  tokens: {
    primary: '#FCD34D',
    success: '#22C55E',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#0EA5E9',
    emphasis: '#EC4899',
    default: '#64748B',
  },
  bgTokens: {
    primary: '#FEFCE8',
    secondary: '#FEF9C3',
    tertiary: '#FEF08A',
    quaternary: '#FDE047',
    quinary: '#FACC15',
  },
}
