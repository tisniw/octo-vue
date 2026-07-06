import type { ThemeConfig } from '../../../../theme/types.js'

/**
 * auto 专属主题 - 夏·黄昏
 *
 * 以紫罗兰为主色在深紫蓝底色中呈现夏夜星空的深邃与浪漫，
 * 适用于夏季促销、夜间模式场景化运营以及需要情绪氛围的娱乐内容产品。
 */
export const summerDuskTheme: ThemeConfig = {
  name: 'summer-dusk',
  label: '夏·黄昏',
  mode: 'dark',
  source: 'builtin',
  tokens: {
    primary: '#A78BFA',
    success: '#34D399',
    error: '#F87171',
    warning: '#FBBF24',
    info: '#60A5FA',
    emphasis: '#F472B6',
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
