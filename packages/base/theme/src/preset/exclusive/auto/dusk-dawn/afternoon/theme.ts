import { defaultStateColor, type ThemeColorToken } from '../../../../../core/token/color';
import type { PresetTheme } from '../../../../types';

/**
 * 午后
 * 明亮暖白 + 暖黄主色，主打晴朗午后的充沛感；
 * 暖黄 #facc15 提色，棕橙 #f59e0b 副色，热烈但不刺眼
 */
export const afternoonColor: ThemeColorToken = {
  // 系统背景：暖白底层
  background: {
    base: '#fffef9',
    primary: '#fef9c3',
    secondary: '#fef08a',
    tertiary: '#fde047',
    elevated: '#fffbeb',
  },
  // 组件级背景
  component: {
    base: '#ffffff',
    primary: '#fffbeb',
    secondary: '#fef9c3',
    tertiary: '#fde047',
    elevated: '#fefce8',
  },
  // 蒙层
  overlay: {
    overlay: 'rgba(120, 53, 15, 0.3)',
  },
  // 文字：深棕为正文
  text: {
    primary: '#422006',
    secondary: '#713f12',
    tertiary: '#a16207',
    inverse: '#ffffff',
    placeholder: '#ca8a04',
    onBrand: '#ffffff',
  },
  // 链接：暖黄主色 + 棕 visited
  link: {
    default: '#eab308',
    visited: '#854d0e',
  },
  // 边框
  border: {
    primary: '#facc15',
    secondary: '#fde047',
    divider: '#fef9c3',
    dashed: '#eab308',
    outline: '#ca8a04',
  },
  // 图表色板：高饱和黄棕系
  dataViz: {
    chart1: '#facc15',
    chart2: '#fde047',
    chart3: '#fef08a',
    chart4: '#fef9c3',
    chart5: '#f59e0b',
    chart6: '#fbbf24',
    chart7: '#fb923c',
    chart8: '#fdba74',
    chart9: '#a16207',
    chart10: '#ca8a04',
    chart11: '#854d0e',
    chart12: '#713f12',
    chart13: '#84cc16',
    chart14: '#a3e635',
    chart15: '#bef264',
    chart16: '#ecfccb',
    chart17: '#f97316',
    chart18: '#fb923c',
  },
  // 选区
  selection: {
    bg: 'rgba(250, 204, 21, 0.35)',
    text: '#422006',
  },
  // 骨架屏
  skeleton: {
    base: '#fef9c3',
    shimmer: '#fde047',
  },
  // 阴影
  shadow: {
    soft: 'rgba(120, 53, 15, 0.1)',
    medium: 'rgba(120, 53, 15, 0.2)',
    strong: 'rgba(120, 53, 15, 0.4)',
  },
  // 滚动条
  scrollbar: {
    track: '#fef9c3',
    thumb: '#facc15',
  },
  // 渐变：阳光黄轴 + 棕橙轴
  gradient: {
    brandFrom: '#fef08a',
    brandVia: '#facc15',
    brandTo: '#ca8a04',
    accentFrom: '#fdba74',
    accentVia: '#fb923c',
    accentTo: '#c2410c',
  },
  // 状态：本层不特化
  state: defaultStateColor,
};

/* ─────────────────────────── 主题元信息 ─────────────────────────── */

export const afternoonMeta: PresetTheme['meta'] = {
  sn: 'dusk-dawn-afternoon',
  name: '午后',
  description: '明亮暖白、充沛不刺眼的晴午主题',
};

/* ─────────────────────────── 组合导出 ─────────────────────────── */

export const afternoonPresetTheme: PresetTheme = {
  meta: afternoonMeta,
  color: afternoonColor,
};

export default afternoonPresetTheme;