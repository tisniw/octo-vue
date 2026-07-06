import type { ThemeConfig } from '../../../../theme/types.js'

/**
 * auto 专属主题 - 冬·黄昏
 *
 * 以冰蓝为主色在深青蓝底色中呈现冬夜冰雪的幽蓝与澄澈，
 * 适用于冬季促销、年终岁末场景化运营活动以及需要冷冽氛围的高端商务类产品。
 */
export const winterDuskTheme: ThemeConfig = {
  name: 'winter-dusk',
  label: '冬·黄昏',
  mode: 'dark',
  source: 'builtin',
  tokens: {
    primary: '#38BDF8',
    success: '#34D399',
    error: '#F87171',
    warning: '#FBBF24',
    info: '#60A5FA',
    emphasis: '#A78BFA',
    default: '#94A3B8',
  },
  bgTokens: {
    primary: '#082F49',
    secondary: '#0C4A6E',
    tertiary: '#075985',
    quaternary: '#0369A1',
    quinary: '#0284C7',
  },
}
