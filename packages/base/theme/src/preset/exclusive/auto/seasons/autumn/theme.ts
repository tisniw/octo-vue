import { defaultStateColor, type ThemeColorToken } from '../../../../../core/token/color';
import type { PresetTheme } from '../../../../types';

/**
 * 秋
 * 橙红 + 棕黄 + 暖米，主打温暖沉稳的金秋感；
 */
export const autumnColor: ThemeColorToken = {
  // 系统背景：暖米色
  background: {
    base: '#fef9e6',
    primary: '#fde6a8',
    secondary: '#fbd777',
    tertiary: '#f5c443',
    elevated: '#ffe9a8',
  },
  // 组件级背景
  component: {
    base: '#fffbeb',
    primary: '#fde6a8',
    secondary: '#fbd777',
    tertiary: '#f5c443',
    elevated: '#fef3c7',
  },
  // 蒙层
  overlay: {
    overlay: 'rgba(120, 53, 15, 0.5)',
  },
  // 文字：深焦糖棕
  text: {
    primary: '#451a03',
    secondary: '#78350f',
    tertiary: '#b45309',
    inverse: '#fffbeb',
    placeholder: '#d97706',
    onBrand: '#fffbeb',
  },
  // 链接：橙红主色 + 玫红 visited
  link: {
    default: '#ea580c',
    visited: '#be123c',
  },
  // 边框
  border: {
    primary: '#f59e0b',
    secondary: '#fbbf24',
    divider: '#fde68a',
    dashed: '#d97706',
    outline: '#ea580c',
  },
  // 图表色板：橙红暖色调
  dataViz: {
    chart1: '#ea580c',
    chart2: '#fb923c',
    chart3: '#fdba74',
    chart4: '#fed7aa',
    chart5: '#f59e0b',
    chart6: '#fbbf24',
    chart7: '#fde047',
    chart8: '#d97706',
    chart9: '#b45309',
    chart10: '#92400e',
    chart11: '#be123c',
    chart12: '#e11d48',
    chart13: '#f43f5e',
    chart14: '#fb7185',
    chart15: '#7c2d12',
    chart16: '#9a3412',
    chart17: '#c2410c',
    chart18: '#fbbf24',
  },
  // 选区
  selection: {
    bg: 'rgba(234, 88, 12, 0.3)',
    text: '#fffbeb',
  },
  // 骨架屏
  skeleton: {
    base: '#fde6a8',
    shimmer: '#fbd777',
  },
  // 阴影
  shadow: {
    soft: 'rgba(120, 53, 15, 0.12)',
    medium: 'rgba(120, 53, 15, 0.28)',
    strong: 'rgba(120, 53, 15, 0.5)',
  },
  // 滚动条
  scrollbar: {
    track: '#fde6a8',
    thumb: '#f59e0b',
  },
  // 渐变：橙红轴 + 金棕轴
  gradient: {
    brandFrom: '#fb923c',
    brandVia: '#ea580c',
    brandTo: '#c2410c',
    accentFrom: '#fbbf24',
    accentVia: '#d97706',
    accentTo: '#92400e',
  },
  // 状态：本层不特化
  state: defaultStateColor,
};

/* ─────────────────────────── 主题元信息 ─────────────────────────── */

export const autumnMeta: PresetTheme['meta'] = {
  sn: 'season-autumn',
  name: '秋',
  description: '橙红金棕、温暖沉稳的金秋主题',
};

/* ─────────────────────────── 组合导出 ─────────────────────────── */

export const autumnPresetTheme: PresetTheme = {
  meta: autumnMeta,
  color: autumnColor,
};

export default autumnPresetTheme;
