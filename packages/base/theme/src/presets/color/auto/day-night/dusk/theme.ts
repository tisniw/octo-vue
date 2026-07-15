import type { ThemeConfig } from '../../../../../theme/types.ts'

/**
 * auto 专属主题 - 黄昏
 *
 * 以靛蓝为主色在深紫底色中呈现日落黄昏的安静与沉潜，
 * 适用于按日间时间自动切换的夜晚主题以及需要舒缓节奏的夜间模式场景。
 */
export const duskTheme: ThemeConfig = {
  name: 'auto-dusk',
  label: '黄昏',
  mode: 'dark',
  source: 'builtin',
  tokens: {
    primary: '#6366F1',
    success: '#34D399',
    error: '#F87171',
    warning: '#FBBF24',
    info: '#60A5FA',
    emphasis: '#A78BFA',
    default: '#94A3B8',
  },
  bgTokens: {
    primary: '#1E1B4B',
    secondary: '#312E81',
    tertiary: '#3730A3',
    quaternary: '#4338CA',
    quinary: '#4F46E5',
  },
}
