import { defaultStateColor, type ThemeColorToken } from '../../../../core/token/color';
import type { PresetTheme } from '../../../types';
import forestStyle from './style';

/**
 * Forest 主题颜色 token
 * 苍翠、绿意、参天
 * - 深绿主调，自然视觉下的"森林主题"
 * - 仅设置 ThemeColorToken 类型要求字段
 * - 状态/语义由上层 SemanticColor + SharedColorState 统一供应，本层不特化
 */
export const forestTheme: ThemeColorToken = {
  // 系统背景：深林底 + 翠绿叠层
  background: {
    base: '#06120c',
    primary: '#0a1f14',
    secondary: '#0f2e1f',
    tertiary: '#143d29',
    elevated: '#0c2618',
  },

  // 组件级背景：森林绿层级
  component: {
    base: '#06120c',
    primary: '#0a1f14',
    secondary: '#0f2e1f',
    tertiary: '#143d29',
    elevated: '#0c2618',
  },

  // 蒙层
  overlay: {
    overlay: 'rgba(6, 18, 12, 0.75)',
  },

  // 文字
  text: {
    primary: '#f0fdf4',
    secondary: '#bbf7d0',
    tertiary: '#86efac',
    inverse: '#06120c',
    placeholder: '#15803d',
    onBrand: '#ffffff',
  },

  // 链接：翠绿 + 黄绿
  link: {
    default: '#4ade80',
    visited: '#a3e635',
  },

  // 边框
  border: {
    primary: '#143d29',
    secondary: '#0f2e1f',
    divider: '#0a1f14',
    dashed: '#57534e',
    outline: '#22c55e',
  },

  // 图表色板：翠绿主调 + 大地色扩展
  dataViz: {
    chart1: '#22c55e',
    chart2: '#4ade80',
    chart3: '#86efac',
    chart4: '#bbf7d0',
    chart5: '#dcfce7',
    chart6: '#16a34a',
    chart7: '#15803d',
    chart8: '#166534',
    chart9: '#65a30d',
    chart10: '#84cc16',
    chart11: '#a3e635',
    chart12: '#bef264',
    chart13: '#d9f99d',
    chart14: '#fbbf24',
    chart15: '#f59e0b',
    chart16: '#d97706',
    chart17: '#a16207',
    chart18: '#94a3b8',
  },

  // 选区
  selection: {
    bg: 'rgba(34, 197, 94, 0.3)',
    text: '#f0fdf4',
  },

  // 骨架屏
  skeleton: {
    base: '#0f2e1f',
    shimmer: '#143d29',
  },

  // 阴影：深绿林荫
  shadow: {
    soft: 'rgba(20, 83, 45, 0.25)',
    medium: 'rgba(20, 83, 45, 0.45)',
    strong: 'rgba(20, 83, 45, 0.65)',
  },

  // 滚动条
  scrollbar: {
    track: '#0a1f14',
    thumb: '#143d29',
  },

  // 渐变：翠绿→嫩绿→金绿双轴
  gradient: {
    brandFrom: '#166534',
    brandVia: '#22c55e',
    brandTo: '#4ade80',
    accentFrom: '#4ade80',
    accentVia: '#a3e635',
    accentTo: '#fbbf24',
  },

  // 主题全局状态色值：本层不特化 使用默认值
  state: defaultStateColor,
};

/* ─────────────────────────── 主题元信息 ─────────────────────────── */

/**
 * Forest 主题元信息（统一规范：仅保留 sn / name / description）
 *
 * - sn         = 'natural-forest'（与主题目录 {visual}/{slug} 对齐，扫描后作为 themeStyles 的 key）
 * - visual     来源是文件路径（exclusive 扫描产物 themeVisualMap 拿）
 * - slug       来源是文件路径
 */
export const forestThemeMeta: PresetTheme['meta'] = {
  sn: 'natural-forest',
  name: '森林',
  description: '苍翠、绿意、参天的森林主题',
};

/* ─────────────────────────── 组合导出 ─────────────────────────── */

/**
 * Forest 主题完整 PresetTheme
 *
 * - color: 颜色 token（深绿主调 + 大地色扩展）
 * - style: 自身样式补丁（深绿阴影 + 大圆角 + 楷体显示）
 *
 * 层级加载顺序（preset/merge.ts 实现）：
 *   defaultStyleToken
 *      ← natural 视觉层 (exclusive/natural/style.ts)
 *         ← forest 主题层 (exclusive/natural/forest/style.ts ← 本文件 style 字段)
 */
export const forestPresetTheme: PresetTheme = {
  meta: forestThemeMeta,
  color: forestTheme,
  style: forestStyle,
};

/**
 * Forest 主题自身的 StylePatch 快捷导出
 * 等价于 `import forestStyle from './style'` 的 default 导出
 */
export { forestStyle };