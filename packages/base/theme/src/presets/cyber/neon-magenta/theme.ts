import type { ThemeConfig } from '../../../theme/types.js'

/**
 * cyber 专属主题 - 霓虹
 *
 * 以品红为主色的荧光色在近黑底色上形成赛博朋克般的光电冲突，
 * 适用于游戏娱乐、虚拟社交以及需要强烈视觉冲击力的数字潮流产品。
 */
export const neonMagentaTheme: ThemeConfig = {
  name: 'neon-magenta',
  label: '霓虹',
  mode: 'dark',
  source: 'builtin',
  tokens: {
    primary: '#FF006E',
    success: '#06FFA5',
    error: '#FF3864',
    warning: '#FFBE0B',
    info: '#3A86FF',
    emphasis: '#8338EC',
    default: '#F5F5F5',
  },
  bgTokens: {
    primary: '#0A0014',
    secondary: '#14001F',
    tertiary: '#1F0033',
    quaternary: '#29004D',
    quinary: '#3A0066',
  },
}
