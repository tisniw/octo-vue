import type { ThemeConfig } from '../../../theme/types.js'

/**
 * tech 专属主题 - 数据
 *
 * 以数据蓝为主色，深蓝灰底色提供高信息密度的视觉支撑，
 * 适用于数据可视化大屏、数据表格以及需要处理大量结构化数据的 BI 与监控类产品。
 */
export const dataGridTheme: ThemeConfig = {
  name: 'data-grid',
  label: '数据',
  mode: 'dark',
  source: 'builtin',
  tokens: {
    primary: '#38BDF8',
    success: '#22C55E',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#60A5FA',
    emphasis: '#A78BFA',
    default: '#94A3B8',
  },
  bgTokens: {
    primary: '#0B1220',
    secondary: '#0F172A',
    tertiary: '#1E293B',
    quaternary: '#334155',
    quinary: '#475569',
  },
}
