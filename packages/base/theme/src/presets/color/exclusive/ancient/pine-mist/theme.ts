import type { ThemeConfig } from '../../../../../theme/types.ts'

/**
 * ancient 专属主题 - 松间雾色
 *
 * 以松林绿为主色，暖灰绿底色模拟晨雾笼罩下的松林意境，
 * 适用于自然人文主题的应用以及中式美学的简约管理后台。
 */
export const pineMistTheme: ThemeConfig = {
  name: 'pine-mist',
  label: '松间雾色',
  mode: 'light',
  source: 'builtin',
  tokens: {
    primary: '#4D7C5F',
    success: '#65A30D',
    error: '#DC2626',
    warning: '#CA8A04',
    info: '#0284C7',
    emphasis: '#7C3AED',
    default: '#57534E',
  },
  bgTokens: {
    primary: '#F0F5EE',
    secondary: '#E8EFEA',
    tertiary: '#D7E2D3',
    quaternary: '#B6C9AF',
    quinary: '#93A88C',
  },
}
