import { defaultStateColor, type ThemeColorToken } from '../../../../../core/token/color';
import type { PresetTheme } from '../../../../types';

/**
 * 黑夜
 * 极深靛蓝底 + 月光银主色，主打跟随系统的深色主题；
 * 跟随系统 prefers-color-scheme: dark 时启用
 */
export const darkColor: ThemeColorToken = {
  // 系统背景：极深靛蓝底层
  background: {
    base: '#020617',
    primary: '#0f172a',
    secondary: '#1e293b',
    tertiary: '#334155',
    elevated: '#0f172a',
  },
  // 组件级背景
  component: {
    base: '#0f172a',
    primary: '#1e293b',
    secondary: '#334155',
    tertiary: '#475569',
    elevated: '#020617',
  },
  // 蒙层
  overlay: {
    overlay: 'rgba(0, 0, 0, 0.7)',
  },
  // 文字：月光银 + 极浅
  text: {
    primary: '#f1f5f9',
    secondary: '#cbd5e1',
    tertiary: '#94a3b8',
    inverse: '#0f172a',
    placeholder: '#64748b',
    onBrand: '#ffffff',
  },
  // 链接：月光蓝主色
  link: {
    default: '#94a3b8',
    visited: '#818cf8',
  },
  // 边框
  border: {
    primary: '#334155',
    secondary: '#475569',
    divider: '#1e293b',
    dashed: '#64748b',
    outline: '#94a3b8',
  },
  // 图表色板：冷色月光 + 深背景可读
  dataViz: {
    chart1: '#94a3b8',
    chart2: '#cbd5e1',
    chart3: '#e2e8f0',
    chart4: '#f1f5f9',
    chart5: '#60a5fa',
    chart6: '#93c5fd',
    chart7: '#bfdbfe',
    chart8: '#dbeafe',
    chart9: '#22d3ee',
    chart10: '#67e8f9',
    chart11: '#a5f3fc',
    chart12: '#cffafe',
    chart13: '#a78bfa',
    chart14: '#c4b5fd',
    chart15: '#ddd6fe',
    chart16: '#ede9fe',
    chart17: '#f472b6',
    chart18: '#fbcfe8',
  },
  // 选区
  selection: {
    bg: 'rgba(148, 163, 184, 0.3)',
    text: '#ffffff',
  },
  // 骨架屏
  skeleton: {
    base: '#1e293b',
    shimmer: '#334155',
  },
  // 阴影：极深
  shadow: {
    soft: 'rgba(0, 0, 0, 0.3)',
    medium: 'rgba(0, 0, 0, 0.55)',
    strong: 'rgba(0, 0, 0, 0.8)',
  },
  // 滚动条
  scrollbar: {
    track: '#1e293b',
    thumb: '#475569',
  },
  // 渐变：月光银轴 + 月光紫轴
  gradient: {
    brandFrom: '#cbd5e1',
    brandVia: '#94a3b8',
    brandTo: '#475569',
    accentFrom: '#c7d2fe',
    accentVia: '#818cf8',
    accentTo: '#3730a3',
  },
  // 状态：本层不特化
  state: defaultStateColor,
};

/* ─────────────────────────── 主题元信息 ─────────────────────────── */

export const darkMeta: PresetTheme['meta'] = {
  sn: 'single-axis-dark',
  name: '黑夜',
  description: '极深靛月银、跟随系统深色主题',
};

/* ─────────────────────────── 组合导出 ─────────────────────────── */

export const darkPresetTheme: PresetTheme = {
  meta: darkMeta,
  color: darkColor,
};

export default darkPresetTheme;