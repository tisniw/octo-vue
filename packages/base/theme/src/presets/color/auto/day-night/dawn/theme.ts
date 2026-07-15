import type { ThemeConfig } from '../../../../../theme/types.ts'

/**
 * auto 专属主题 - 黎明
 *
 * 以橙金为主色，暖黄底色呈现日出时刻的温暖与初醒，
 * 适用于按日间时间自动切换的早间主题以及需要明亮引导的日间模式场景。
 */
export const dawnTheme: ThemeConfig = {
  name: 'auto-dawn',
  label: '黎明',
  mode: 'light',
  source: 'builtin',
  tokens: {
    primary: '#F59E0B',
    success: '#22C55E',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#0EA5E9',
    emphasis: '#EC4899',
    default: '#64748B',
  },
  bgTokens: {
    primary: '#FFFBEB',
    secondary: '#FEF3C7',
    tertiary: '#FDE68A',
    quaternary: '#FCD34D',
    quinary: '#FBBF24',
  },
}
