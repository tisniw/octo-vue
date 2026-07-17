import { defaultStateColor, type ThemeColorToken } from '../../../../../core/token/color';
import type { PresetTheme } from '../../../../types';

/**
 * 冬
 * 冷灰 + 银白 + 冰蓝，主打冷峻淡雅的寒冬感；
 */
export const winterColor: ThemeColorToken = {
  // 系统背景：冷白偏蓝
  background: {
    base: '#f8fafc',
    primary: '#e2e8f0',
    secondary: '#cbd5e1',
    tertiary: '#94a3b8',
    elevated: '#dde7f0',
  },
  // 组件级背景
  component: {
    base: '#ffffff',
    primary: '#e2e8f0',
    secondary: '#cbd5e1',
    tertiary: '#94a3b8',
    elevated: '#f1f5f9',
  },
  // 蒙层
  overlay: {
    overlay: 'rgba(15, 23, 42, 0.65)',
  },
  // 文字：极深靛蓝
  text: {
    primary: '#0f172a',
    secondary: '#1e293b',
    tertiary: '#475569',
    inverse: '#ffffff',
    placeholder: '#94a3b8',
    onBrand: '#0f172a',
  },
  // 链接：冰蓝 + 紫 visited
  link: {
    default: '#38bdf8',
    visited: '#818cf8',
  },
  // 边框
  border: {
    primary: '#94a3b8',
    secondary: '#cbd5e1',
    divider: '#e2e8f0',
    dashed: '#64748b',
    outline: '#475569',
  },
  // 图表色板：冷色调为主
  dataViz: {
    chart1: '#38bdf8',
    chart2: '#7dd3fc',
    chart3: '#bae6fd',
    chart4: '#0ea5e9',
    chart5: '#0284c7',
    chart6: '#0369a1',
    chart7: '#818cf8',
    chart8: '#a5b4fc',
    chart9: '#c7d2fe',
    chart10: '#67e8f9',
    chart11: '#22d3ee',
    chart12: '#06b6d4',
    chart13: '#0891b2',
    chart14: '#94a3b8',
    chart15: '#cbd5e1',
    chart16: '#e2e8f0',
    chart17: '#475569',
    chart18: '#64748b',
  },
  // 选区
  selection: {
    bg: 'rgba(56, 189, 248, 0.3)',
    text: '#0f172a',
  },
  // 骨架屏
  skeleton: {
    base: '#cbd5e1',
    shimmer: '#94a3b8',
  },
  // 阴影
  shadow: {
    soft: 'rgba(15, 23, 42, 0.12)',
    medium: 'rgba(15, 23, 42, 0.3)',
    strong: 'rgba(15, 23, 42, 0.55)',
  },
  // 滚动条
  scrollbar: {
    track: '#cbd5e1',
    thumb: '#94a3b8',
  },
  // 渐变：冰蓝轴 + 银灰轴
  gradient: {
    brandFrom: '#7dd3fc',
    brandVia: '#38bdf8',
    brandTo: '#0369a1',
    accentFrom: '#cbd5e1',
    accentVia: '#94a3b8',
    accentTo: '#475569',
  },
  // 状态：本层不特化
  state: defaultStateColor,
};

/* ─────────────────────────── 主题元信息 ─────────────────────────── */

export const winterMeta: PresetTheme['meta'] = {
  sn: 'season-winter',
  name: '冬',
  description: '冷灰银白、冷峻淡雅的寒冬主题',
};

/* ─────────────────────────── 组合导出 ─────────────────────────── */

export const winterPresetTheme: PresetTheme = {
  meta: winterMeta,
  color: winterColor,
};

export default winterPresetTheme;
