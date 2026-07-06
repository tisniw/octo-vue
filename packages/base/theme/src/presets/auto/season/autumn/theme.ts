import type { ThemeConfig } from '../../../../theme/types.js'

/**
 * auto 专属主题 - 秋
 *
 * 以秋橙为主色，暖橙底色呈现秋季落叶的温暖与丰盈，
 * 适用于按季节自动切换的秋季主题以及需要温润气质的中长内容平台。
 */
export const autumnTheme: ThemeConfig = {
  name: 'autumn',
  label: '秋',
  mode: 'light',
  source: 'builtin',
  tokens: {
    primary: '#FB923C',
    success: '#65A30D',
    error: '#DC2626',
    warning: '#F59E0B',
    info: '#0284C7',
    emphasis: '#7C3AED',
    default: '#7C2D12',
  },
  bgTokens: {
    primary: '#FFF7ED',
    secondary: '#FFEDD5',
    tertiary: '#FED7AA',
    quaternary: '#FDBA74',
    quinary: '#FB923C',
  },
}
