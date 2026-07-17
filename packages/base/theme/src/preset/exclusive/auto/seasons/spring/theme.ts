import { defaultStateColor, type ThemeColorToken } from '../../../../../core/token/color';
import type { PresetTheme } from '../../../../types';

/**
 * 春
 * 嫩粉 + 草绿 + 浅米黄，主打清新湿润的初春感；
 */
export const springColor: ThemeColorToken = {
  // 系统背景：浅米绿底层
  background: {
    base: '#f7fef9',
    primary: '#eafaf0',
    secondary: '#d8f5e1',
    tertiary: '#c2edcf',
    elevated: '#e3f9e9',
  },
  // 组件级背景：与系统背景同基调
  component: {
    base: '#ffffff',
    primary: '#eafaf0',
    secondary: '#d8f5e1',
    tertiary: '#c2edcf',
    elevated: '#f0fdf4',
  },
  // 蒙层
  overlay: {
    overlay: 'rgba(20, 83, 45, 0.4)',
  },
  // 文字：深森林绿为正文
  text: {
    primary: '#14532d',
    secondary: '#166534',
    tertiary: '#4ade80',
    inverse: '#ffffff',
    placeholder: '#86efac',
    onBrand: '#ffffff',
  },
  // 链接：嫩粉主色 + 紫 visited
  link: {
    default: '#ec4899',
    visited: '#a21caf',
  },
  // 边框
  border: {
    primary: '#4ade80',
    secondary: '#86efac',
    divider: '#d8f5e1',
    dashed: '#6ee7b7',
    outline: '#22c55e',
  },
  // 图表色板：粉嫩 + 草绿扩展
  dataViz: {
    chart1: '#ec4899',
    chart2: '#f9a8d4',
    chart3: '#fbcfe8',
    chart4: '#22c55e',
    chart5: '#4ade80',
    chart6: '#86efac',
    chart7: '#a7f3d0',
    chart8: '#facc15',
    chart9: '#fde047',
    chart10: '#bef264',
    chart11: '#84cc16',
    chart12: '#65a30d',
    chart13: '#fb923c',
    chart14: '#fdba74',
    chart15: '#c084fc',
    chart16: '#d8b4fe',
    chart17: '#67e8f9',
    chart18: '#a5f3fc',
  },
  // 选区
  selection: {
    bg: 'rgba(236, 72, 153, 0.25)',
    text: '#ffffff',
  },
  // 骨架屏
  skeleton: {
    base: '#d8f5e1',
    shimmer: '#c2edcf',
  },
  // 阴影
  shadow: {
    soft: 'rgba(20, 83, 45, 0.12)',
    medium: 'rgba(20, 83, 45, 0.25)',
    strong: 'rgba(20, 83, 45, 0.45)',
  },
  // 滚动条
  scrollbar: {
    track: '#d8f5e1',
    thumb: '#86efac',
  },
  // 渐变：粉轴 + 绿轴
  gradient: {
    brandFrom: '#f9a8d4',
    brandVia: '#ec4899',
    brandTo: '#db2777',
    accentFrom: '#86efac',
    accentVia: '#22c55e',
    accentTo: '#16a34a',
  },
  // 状态：本层不特化，沿用默认
  state: defaultStateColor,
};

/* ─────────────────────────── 主题元信息 ─────────────────────────── */

export const springMeta: PresetTheme['meta'] = {
  sn: 'season-spring',
  name: '春',
  description: '嫩粉草绿、清新湿润的初春主题',
};

/* ─────────────────────────── 组合导出 ─────────────────────────── */

export const springPresetTheme: PresetTheme = {
  meta: springMeta,
  color: springColor,
};

export default springPresetTheme;
