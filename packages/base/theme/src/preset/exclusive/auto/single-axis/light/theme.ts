import { defaultStateColor, type ThemeColorToken } from '../../../../../core/token/color';
import type { PresetTheme } from '../../../../types';

/**
 * 白天
 * 灰蓝中性调 + 沉稳蓝灰主色，主打被动响应的明亮主题；
 * 跟随系统 prefers-color-scheme: light 时启用
 */
export const lightColor: ThemeColorToken = {
  // 系统背景：冷白底层
  background: {
    base: '#f8fafc',
    primary: '#f1f5f9',
    secondary: '#e2e8f0',
    tertiary: '#cbd5e1',
    elevated: '#ffffff',
  },
  // 组件级背景
  component: {
    base: '#ffffff',
    primary: '#f8fafc',
    secondary: '#f1f5f9',
    tertiary: '#e2e8f0',
    elevated: '#ffffff',
  },
  // 蒙层
  overlay: {
    overlay: 'rgba(15, 23, 42, 0.4)',
  },
  // 文字：极深靛蓝为正文
  text: {
    primary: '#0f172a',
    secondary: '#1e293b',
    tertiary: '#475569',
    inverse: '#ffffff',
    placeholder: '#94a3b8',
    onBrand: '#ffffff',
  },
  // 链接：沉稳蓝主色 + 偏冷 visited
  link: {
    default: '#475569',
    visited: '#3730a3',
  },
  // 边框
  border: {
    primary: '#cbd5e1',
    secondary: '#e2e8f0',
    divider: '#f1f5f9',
    dashed: '#94a3b8',
    outline: '#64748b',
  },
  // 图表色板：中性灰蓝
  dataViz: {
    chart1: '#64748b',
    chart2: '#94a3b8',
    chart3: '#cbd5e1',
    chart4: '#e2e8f0',
    chart5: '#475569',
    chart6: '#334155',
    chart7: '#1e293b',
    chart8: '#0f172a',
    chart9: '#3b82f6',
    chart10: '#60a5fa',
    chart11: '#93c5fd',
    chart12: '#bfdbfe',
    chart13: '#0891b2',
    chart14: '#06b6d4',
    chart15: '#22d3ee',
    chart16: '#67e8f9',
    chart17: '#6366f1',
    chart18: '#818cf8',
  },
  // 选区
  selection: {
    bg: 'rgba(71, 85, 105, 0.2)',
    text: '#0f172a',
  },
  // 骨架屏
  skeleton: {
    base: '#e2e8f0',
    shimmer: '#cbd5e1',
  },
  // 阴影
  shadow: {
    soft: 'rgba(15, 23, 42, 0.08)',
    medium: 'rgba(15, 23, 42, 0.18)',
    strong: 'rgba(15, 23, 42, 0.35)',
  },
  // 滚动条
  scrollbar: {
    track: '#f1f5f9',
    thumb: '#cbd5e1',
  },
  // 渐变：灰蓝轴 + 靛蓝轴
  gradient: {
    brandFrom: '#cbd5e1',
    brandVia: '#64748b',
    brandTo: '#334155',
    accentFrom: '#bfdbfe',
    accentVia: '#3b82f6',
    accentTo: '#1d4ed8',
  },
  // 状态：本层不特化
  state: defaultStateColor,
};

/* ─────────────────────────── 主题元信息 ─────────────────────────── */

export const lightMeta: PresetTheme['meta'] = {
  sn: 'single-axis-light',
  name: '白天',
  description: '灰蓝中性、跟随系统明亮主题',
};

/* ─────────────────────────── 组合导出 ─────────────────────────── */

export const lightPresetTheme: PresetTheme = {
  meta: lightMeta,
  color: lightColor,
};

export default lightPresetTheme;