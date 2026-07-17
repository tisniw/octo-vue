import { defaultStateColor, type ThemeColorToken } from '../../../../../core/token/color';
import type { PresetTheme } from '../../../../types';

/**
 * 黑夜
 * 深靛蓝底 + 月光银主色，主打星空夜幕的深邃感；
 * 银 #94a3b8 提色，月光紫 #818cf8 副色，深邃不压抑
 */
export const nightColor: ThemeColorToken = {
  // 系统背景：极深靛蓝底层
  background: {
    base: '#0f172a',
    primary: '#1e293b',
    secondary: '#334155',
    tertiary: '#475569',
    elevated: '#1e293b',
  },
  // 组件级背景
  component: {
    base: '#1e293b',
    primary: '#1e293b',
    secondary: '#334155',
    tertiary: '#475569',
    elevated: '#0f172a',
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
  // 链接：月光紫主色 + 偏冷 visited
  link: {
    default: '#818cf8',
    visited: '#a78bfa',
  },
  // 边框
  border: {
    primary: '#475569',
    secondary: '#64748b',
    divider: '#334155',
    dashed: '#94a3b8',
    outline: '#cbd5e1',
  },
  // 图表色板：冷色 + 月光
  dataViz: {
    chart1: '#818cf8',
    chart2: '#a5b4fc',
    chart3: '#c7d2fe',
    chart4: '#e0e7ff',
    chart5: '#22d3ee',
    chart6: '#67e8f9',
    chart7: '#a5f3fc',
    chart8: '#cffafe',
    chart9: '#a78bfa',
    chart10: '#c4b5fd',
    chart11: '#ddd6fe',
    chart12: '#ede9fe',
    chart13: '#94a3b8',
    chart14: '#cbd5e1',
    chart15: '#e2e8f0',
    chart16: '#f1f5f9',
    chart17: '#38bdf8',
    chart18: '#7dd3fc',
  },
  // 选区
  selection: {
    bg: 'rgba(129, 140, 248, 0.4)',
    text: '#ffffff',
  },
  // 骨架屏
  skeleton: {
    base: '#334155',
    shimmer: '#475569',
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
  // 渐变：月光银轴 + 紫蓝轴
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

export const nightMeta: PresetTheme['meta'] = {
  sn: 'dusk-dawn-night',
  name: '黑夜',
  description: '深靛月银、星空夜幕的深邃主题',
};

/* ─────────────────────────── 组合导出 ─────────────────────────── */

export const nightPresetTheme: PresetTheme = {
  meta: nightMeta,
  color: nightColor,
};

export default nightPresetTheme;