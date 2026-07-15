import type { ThemeConfig } from '../../../../../theme/types.ts'

/**
 * auto 专属主题 - 秋·黎明
 *
 * 以秋橙为主色，暖橙底色呈现秋季清晨的温润与宁静，
 * 适用于季节运营活动、丰收主题内容平台以及需要温暖亲切感的民生服务类产品。
 */
export const autumnDawnTheme: ThemeConfig = {
  name: 'autumn-dawn',
  label: '秋·黎明',
  mode: 'light',
  source: 'builtin',
  tokens: {
    primary: '#FDBA74',
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
