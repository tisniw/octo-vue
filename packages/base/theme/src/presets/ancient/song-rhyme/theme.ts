import type { ThemeConfig } from '../../../theme/types.js'

/**
 * ancient 专属主题 - 宋韵
 *
 * 以宋代茶色为主调，暖米色底色呈现宋代美学的素雅与禅意，
 * 适用于文化内容平台以及追求古韵与现代简约融合的垂类 SaaS 产品。
 */
export const songRhymeTheme: ThemeConfig = {
  name: 'song-rhyme',
  label: '宋韵',
  mode: 'light',
  source: 'builtin',
  tokens: {
    primary: '#7A5C3E',
    success: '#5B9279',
    error: '#C97064',
    warning: '#D9A56B',
    info: '#6E91B0',
    emphasis: '#8E7DA5',
    default: '#57534E',
  },
  bgTokens: {
    primary: '#F8F4EC',
    secondary: '#EFE8DA',
    tertiary: '#E1D6BF',
    quaternary: '#C9B998',
    quinary: '#A89878',
  },
}
