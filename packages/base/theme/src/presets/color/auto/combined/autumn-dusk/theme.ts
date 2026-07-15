import type { ThemeConfig } from '../../../../../theme/types.ts'

/**
 * auto 专属主题 - 秋·黄昏
 *
 * 以深秋橙为主色在暖褐底色中呈现暮色的沉淀与丰盈，
 * 适用于秋季促销、傍晚时分场景化运营活动以及需要厚重感的传统行业数字化产品。
 */
export const autumnDuskTheme: ThemeConfig = {
  name: 'autumn-dusk',
  label: '秋·黄昏',
  mode: 'dark',
  source: 'builtin',
  tokens: {
    primary: '#F97316',
    success: '#34D399',
    error: '#F87171',
    warning: '#FBBF24',
    info: '#60A5FA',
    emphasis: '#A78BFA',
    default: '#94A3B8',
  },
  bgTokens: {
    primary: '#431407',
    secondary: '#7C2D12',
    tertiary: '#9A3412',
    quaternary: '#C2410C',
    quinary: '#EA580C',
  },
}
