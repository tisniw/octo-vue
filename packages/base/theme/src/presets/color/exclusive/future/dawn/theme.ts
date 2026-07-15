import type { ThemeConfig } from '../../../../../theme/types.ts'

/**
 * future 专属主题 - 晨曦
 *
 * 以晨曦橙为主色在深紫底色中呈现黎明破晓的温暖与希望，
 * 适用于需要积极向上氛围的激励类应用以及需要温暖与科技感融合的创新型产品。
 */
export const dawnTheme: ThemeConfig = {
  name: 'dawn',
  label: '晨曦',
  mode: 'dark',
  source: 'builtin',
  tokens: {
    primary: '#FB923C',
    success: '#34D399',
    error: '#F87171',
    warning: '#FBBF24',
    info: '#60A5FA',
    emphasis: '#C084FC',
    default: '#CBD5E1',
  },
  bgTokens: {
    primary: '#0F0A1F',
    secondary: '#1A1233',
    tertiary: '#261B47',
    quaternary: '#33255C',
    quinary: '#403072',
  },
}
