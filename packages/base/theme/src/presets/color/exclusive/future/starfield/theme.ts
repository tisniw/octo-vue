import type { ThemeConfig } from '../../../../../theme/types.ts'

/**
 * future 专属主题 - 星海
 *
 * 以星蓝紫为主色在近黑底色中如深空星尘般闪烁，
 * 适用于天文航天、科幻文学类应用以及需要浩瀚神秘感的宇宙探索类产品。
 */
export const starfieldTheme: ThemeConfig = {
  name: 'starfield',
  label: '星海',
  mode: 'dark',
  source: 'builtin',
  tokens: {
    primary: '#818CF8',
    success: '#34D399',
    error: '#F87171',
    warning: '#FBBF24',
    info: '#60A5FA',
    emphasis: '#C084FC',
    default: '#94A3B8',
  },
  bgTokens: {
    primary: '#030014',
    secondary: '#0A0420',
    tertiary: '#120830',
    quaternary: '#1C0F47',
    quinary: '#2D1B69',
  },
}
