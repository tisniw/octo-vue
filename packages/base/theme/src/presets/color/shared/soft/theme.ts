import type { ThemeConfig } from '../../../../theme/types.ts'

/**
 * shared 专属主题 - 柔和
 *
 * 以中性灰蓝为主色，暖灰底色呈现克制柔和的整体气质，
 * 适用于需要弱化界面存在感、突出内容本身的工具型产品以及无障碍友好的通用场景。
 */
export const softTheme: ThemeConfig = {
  name: 'soft',
  label: '柔和',
  mode: 'light',
  source: 'builtin',
  tokens: {
    primary: '#94A3B8',
    success: '#6EE7B7',
    error: '#FCA5A5',
    warning: '#FCD34D',
    info: '#93C5FD',
    emphasis: '#C4B5FD',
    default: '#9CA3AF',
  },
  bgTokens: {
    primary: '#FAFAF9',
    secondary: '#F5F5F4',
    tertiary: '#E7E5E4',
    quaternary: '#D6D3D1',
    quinary: '#A8A29E',
  },
}
