import { defaultStateColor, type ThemeColorToken } from '../../../../../core/token/color';
import type { PresetTheme } from '../../../../types';

/**
 * 清晨
 * 晨曦粉橙 + 浅天蓝，主打朝霞初升的微暖感；
 * 橙 #fb923c 提色，蓝 #38bdf8 冷调，柔和不刺眼
 */
export const dawnColor: ThemeColorToken = {
  // 系统背景：淡米红 + 浅蓝底层
  background: {
    base: '#fff8f1',
    primary: '#ffeede',
    secondary: '#ffe0c4',
    tertiary: '#ffd1a3',
    elevated: '#fff1e0',
  },
  // 组件级背景
  component: {
    base: '#ffffff',
    primary: '#fff3e6',
    secondary: '#ffe0c4',
    tertiary: '#ffd1a3',
    elevated: '#fff8ed',
  },
  // 蒙层
  overlay: {
    overlay: 'rgba(120, 53, 15, 0.35)',
  },
  // 文字：深焦糖棕为正文
  text: {
    primary: '#451a03',
    secondary: '#7c2d12',
    tertiary: '#ea580c',
    inverse: '#ffffff',
    placeholder: '#fb923c',
    onBrand: '#ffffff',
  },
  // 链接：橙主色 + 玫红 visited
  link: {
    default: '#fb923c',
    visited: '#be123c',
  },
  // 边框
  border: {
    primary: '#fb923c',
    secondary: '#fdba74',
    divider: '#ffe0c4',
    dashed: '#ea580c',
    outline: '#c2410c',
  },
  // 图表色板：橙暖 + 晨蓝
  dataViz: {
    chart1: '#fb923c',
    chart2: '#fdba74',
    chart3: '#fed7aa',
    chart4: '#ffedd5',
    chart5: '#38bdf8',
    chart6: '#7dd3fc',
    chart7: '#bae6fd',
    chart8: '#e0f2fe',
    chart9: '#fbbf24',
    chart10: '#fcd34d',
    chart11: '#f59e0b',
    chart12: '#d97706',
    chart13: '#a78bfa',
    chart14: '#c4b5fd',
    chart15: '#fbcfe8',
    chart16: '#f9a8d4',
    chart17: '#22d3ee',
    chart18: '#67e8f9',
  },
  // 选区
  selection: {
    bg: 'rgba(251, 146, 60, 0.28)',
    text: '#ffffff',
  },
  // 骨架屏
  skeleton: {
    base: '#ffe0c4',
    shimmer: '#ffd1a3',
  },
  // 阴影
  shadow: {
    soft: 'rgba(120, 53, 15, 0.1)',
    medium: 'rgba(120, 53, 15, 0.22)',
    strong: 'rgba(120, 53, 15, 0.42)',
  },
  // 滚动条
  scrollbar: {
    track: '#ffe0c4',
    thumb: '#fb923c',
  },
  // 渐变：朝霞橙轴 + 晨蓝轴
  gradient: {
    brandFrom: '#fed7aa',
    brandVia: '#fb923c',
    brandTo: '#c2410c',
    accentFrom: '#bae6fd',
    accentVia: '#38bdf8',
    accentTo: '#0284c7',
  },
  // 状态：本层不特化
  state: defaultStateColor,
};

/* ─────────────────────────── 主题元信息 ─────────────────────────── */

export const dawnMeta: PresetTheme['meta'] = {
  sn: 'dusk-dawn-dawn',
  name: '清晨',
  description: '晨曦粉橙、柔和不刺眼的朝霞主题',
};

/* ─────────────────────────── 组合导出 ─────────────────────────── */

export const dawnPresetTheme: PresetTheme = {
  meta: dawnMeta,
  color: dawnColor,
};

export default dawnPresetTheme;