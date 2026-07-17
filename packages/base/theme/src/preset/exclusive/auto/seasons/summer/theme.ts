import { defaultStateColor, type ThemeColorToken } from '../../../../../core/token/color';
import type { PresetTheme } from '../../../../types';

/**
 * 夏
 * 翠绿 + 阳光黄 + 海蓝，主打明亮热烈的盛夏感；
 */
export const summerColor: ThemeColorToken = {
  // 系统背景：浅蓝天蓝
  background: {
    base: '#f0f9ff',
    primary: '#d1f4ff',
    secondary: '#b3e8ff',
    tertiary: '#93daff',
    elevated: '#c2efff',
  },
  // 组件级背景
  component: {
    base: '#ffffff',
    primary: '#d1f4ff',
    secondary: '#b3e8ff',
    tertiary: '#93daff',
    elevated: '#e0f2fe',
  },
  // 蒙层
  overlay: {
    overlay: 'rgba(8, 47, 73, 0.55)',
  },
  // 文字：深海洋蓝
  text: {
    primary: '#082f49',
    secondary: '#075985',
    tertiary: '#0ea5e9',
    inverse: '#ffffff',
    placeholder: '#38bdf8',
    onBrand: '#ffffff',
  },
  // 链接：阳光黄 + 偏暖 visited
  link: {
    default: '#f59e0b',
    visited: '#d97706',
  },
  // 边框
  border: {
    primary: '#38bdf8',
    secondary: '#7dd3fc',
    divider: '#bae6fd',
    dashed: '#0284c7',
    outline: '#0ea5e9',
  },
  // 图表色板：高饱和绿黄蓝
  dataViz: {
    chart1: '#0ea5e9',
    chart2: '#38bdf8',
    chart3: '#7dd3fc',
    chart4: '#bae6fd',
    chart5: '#22c55e',
    chart6: '#4ade80',
    chart7: '#86efac',
    chart8: '#fbbf24',
    chart9: '#facc15',
    chart10: '#fde047',
    chart11: '#f97316',
    chart12: '#fb923c',
    chart13: '#fdba74',
    chart14: '#22d3ee',
    chart15: '#67e8f9',
    chart16: '#a5f3fc',
    chart17: '#16a34a',
    chart18: '#bbf7d0',
  },
  // 选区
  selection: {
    bg: 'rgba(245, 158, 11, 0.3)',
    text: '#ffffff',
  },
  // 骨架屏
  skeleton: {
    base: '#b3e8ff',
    shimmer: '#93daff',
  },
  // 阴影
  shadow: {
    soft: 'rgba(8, 47, 73, 0.15)',
    medium: 'rgba(8, 47, 73, 0.3)',
    strong: 'rgba(8, 47, 73, 0.5)',
  },
  // 滚动条
  scrollbar: {
    track: '#b3e8ff',
    thumb: '#38bdf8',
  },
  // 渐变：阳光黄轴 + 翠绿轴
  gradient: {
    brandFrom: '#fbbf24',
    brandVia: '#f59e0b',
    brandTo: '#d97706',
    accentFrom: '#4ade80',
    accentVia: '#16a34a',
    accentTo: '#15803d',
  },
  // 状态：本层不特化
  state: defaultStateColor,
};

/* ─────────────────────────── 主题元信息 ─────────────────────────── */

export const summerMeta: PresetTheme['meta'] = {
  sn: 'season-summer',
  name: '夏',
  description: '翠绿阳光黄、热烈明亮的盛夏主题',
};

/* ─────────────────────────── 组合导出 ─────────────────────────── */

export const summerPresetTheme: PresetTheme = {
  meta: summerMeta,
  color: summerColor,
};

export default summerPresetTheme;
