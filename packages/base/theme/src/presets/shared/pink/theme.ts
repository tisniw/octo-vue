import type { ThemeConfig } from '../../../theme/types.js'

/**
 * shared 专属主题 - 粉
 *
 * 以娇粉为主色，柔粉底色营造柔美温馨的氛围，
 * 适用于女性向消费应用、母婴类平台以及需要温暖情感表达的社交与生活方式产品。
 */
export const pinkTheme: ThemeConfig = {
  name: 'pink',
  label: '粉',
  mode: 'light',
  source: 'builtin',
  tokens: {
    primary: '#EC4899',
    success: '#F472B6',
    error: '#E11D48',
    warning: '#F59E0B',
    info: '#F0ABFC',
    emphasis: '#A21CAF',
    default: '#9F1239',
  },
  bgTokens: {
    primary: '#FDF2F8',
    secondary: '#FCE7F3',
    tertiary: '#FBCFE8',
    quaternary: '#F9A8D4',
    quinary: '#F472B6',
  },
}
