import type { ThemeConfig } from '../../../theme/types.js'

/**
 * cyber 专属主题 - 幻影
 *
 * 以幻紫为主色的电光质感在深紫底色中若隐若现，
 * 适用于虚拟现实、数字艺术平台以及需要神秘虚幻感的 Web3 与元宇宙类产品。
 */
export const phantomTheme: ThemeConfig = {
  name: 'phantom',
  label: '幻影',
  mode: 'dark',
  source: 'builtin',
  tokens: {
    primary: '#A855F7',
    success: '#06FFA5',
    error: '#FF3864',
    warning: '#FFBE0B',
    info: '#3A86FF',
    emphasis: '#E879F9',
    default: '#9F7AEA',
  },
  bgTokens: {
    primary: '#1A0028',
    secondary: '#2D0A4E',
    tertiary: '#3F1571',
    quaternary: '#5B21B6',
    quinary: '#7C3AED',
  },
}
