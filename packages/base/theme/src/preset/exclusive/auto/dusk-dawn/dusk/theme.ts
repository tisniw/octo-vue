import { defaultStateColor, type ThemeColorToken } from '../../../../../core/token/color';
import type { PresetTheme } from '../../../../types';

/**
 * 黄昏
 * 紫橙渐变 + 玫红点缀，主打夕阳西沉的晚霞感；
 * 橙 #fb923c 与紫 #a855f7 对冲，渐变营造晚霞过渡
 */
export const duskColor: ThemeColorToken = {
  // 系统背景：暖米紫底层
  background: {
    base: '#fdf4ff',
    primary: '#fae8ff',
    secondary: '#f5d0fe',
    tertiary: '#f0abfc',
    elevated: '#fce7f3',
  },
  // 组件级背景
  component: {
    base: '#ffffff',
    primary: '#fdf4ff',
    secondary: '#fae8ff',
    tertiary: '#f5d0fe',
    elevated: '#faf5ff',
  },
  // 蒙层
  overlay: {
    overlay: 'rgba(88, 28, 135, 0.5)',
  },
  // 文字：深紫为正文
  text: {
    primary: '#3b0764',
    secondary: '#581c87',
    tertiary: '#7e22ce',
    inverse: '#ffffff',
    placeholder: '#a855f7',
    onBrand: '#ffffff',
  },
  // 链接：紫主色 + 玫红 visited
  link: {
    default: '#a855f7',
    visited: '#be185d',
  },
  // 边框
  border: {
    primary: '#a855f7',
    secondary: '#c084fc',
    divider: '#f5d0fe',
    dashed: '#7e22ce',
    outline: '#581c87',
  },
  // 图表色板：紫橙双轴
  dataViz: {
    chart1: '#a855f7',
    chart2: '#c084fc',
    chart3: '#d8b4fe',
    chart4: '#e9d5ff',
    chart5: '#fb923c',
    chart6: '#fdba74',
    chart7: '#fed7aa',
    chart8: '#ffedd5',
    chart9: '#7e22ce',
    chart10: '#9333ea',
    chart11: '#6b21a8',
    chart12: '#581c87',
    chart13: '#f43f5e',
    chart14: '#fb7185',
    chart15: '#fda4af',
    chart16: '#fecdd3',
    chart17: '#ec4899',
    chart18: '#f472b6',
  },
  // 选区
  selection: {
    bg: 'rgba(168, 85, 247, 0.32)',
    text: '#ffffff',
  },
  // 骨架屏
  skeleton: {
    base: '#f5d0fe',
    shimmer: '#f0abfc',
  },
  // 阴影
  shadow: {
    soft: 'rgba(88, 28, 135, 0.12)',
    medium: 'rgba(88, 28, 135, 0.28)',
    strong: 'rgba(88, 28, 135, 0.5)',
  },
  // 滚动条
  scrollbar: {
    track: '#f5d0fe',
    thumb: '#a855f7',
  },
  // 渐变：紫→橙晚霞过渡
  gradient: {
    brandFrom: '#fb923c',
    brandVia: '#a855f7',
    brandTo: '#581c87',
    accentFrom: '#fdba74',
    accentVia: '#c084fc',
    accentTo: '#7e22ce',
  },
  // 状态：本层不特化
  state: defaultStateColor,
};

/* ─────────────────────────── 主题元信息 ─────────────────────────── */

export const duskMeta: PresetTheme['meta'] = {
  sn: 'dusk-dawn-dusk',
  name: '黄昏',
  description: '紫橙渐变、夕阳西沉的晚霞主题',
};

/* ─────────────────────────── 组合导出 ─────────────────────────── */

export const duskPresetTheme: PresetTheme = {
  meta: duskMeta,
  color: duskColor,
};

export default duskPresetTheme;