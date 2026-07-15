import type { ThemeConfig } from '../../../../../theme/types.ts'

/**
 * light 专属主题 - 瓷白
 *
 * 以低饱和的暖白底色模拟瓷器的釉面与胎骨质感，
 * 适用于需要长时间阅读的内容型页面以及追求文化质感、避免强品牌色彩的轻量级B端产品。
 */
export const porcelainTheme: ThemeConfig = {
  name: 'porcelain',
  label: '瓷白',
  mode: 'light',
  source: 'builtin',
  tokens: {
    primary: '#5B7C99',
    success: '#52A57A',
    error: '#C97064',
    warning: '#D9A56B',
    info: '#6E91B0',
    emphasis: '#8E7DA5',
    default: '#7C8591',
  },
  bgTokens: {
    primary: '#FBF8F3',
    secondary: '#F5F1EA',
    tertiary: '#ECE5DA',
    quaternary: '#DDD3C2',
    quinary: '#C2B59E',
  },
}
