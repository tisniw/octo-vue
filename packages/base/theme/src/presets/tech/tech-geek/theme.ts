import type { ThemeConfig } from '../../../theme/types.js'

/**
 * tech 专属主题 - 极客
 *
 * 以青白为主色的霓虹光感在近黑底色上形成强烈对比，
 * 适用于开发者工具、命令行界面以及需要硬核技术气质的极客社区与代码托管平台。
 */
export const techGeekTheme: ThemeConfig = {
  name: 'tech-geek',
  label: '极客',
  mode: 'dark',
  source: 'builtin',
  tokens: {
    primary: '#22D3EE',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
    emphasis: '#A78BFA',
    default: '#94A3B8',
  },
  bgTokens: {
    primary: '#0A0E14',
    secondary: '#0F141B',
    tertiary: '#161B22',
    quaternary: '#21262D',
    quinary: '#30363D',
  },
}
