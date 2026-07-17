// 主题颜色 token 完整默认值（兜底层）
//
// 与 style-defaults.ts 一样,作为 defaultStyleToken 的对应物，
// 是 ThemeColorToken 在"通用层"的兜底实现。
//
// 三层合并规则（与 style 保持一致）：
//   final = mergeColor(
//     themePatch,    // 主题自身 Partial 覆盖（最高优先级）
//     visualPatch,   // 视觉层 Partial 覆盖（次级）
//   )
//   其中缺省字段一律用 defaultThemeColorToken 兜底
//
// 设计要点：
//   - 集中管理"通用默认"，避免散落在多个 theme.ts 里
//   - visual/theme 可以只填要覆盖的字段，不必重写整张表
//   - 任何字段值都可以在视觉/主题层被 Partial 替换
//   - 不依赖具体视觉（如 bright/cyber），保持中性、干净、平衡

import {
  defaultCodeHighlight,
  defaultSemanticColor,
  defaultStateColor,
  type ThemeColorToken,
} from './color';

/**
 * 主题颜色 token 完整默认值
 *
 * - 所有 13 个字段都有值（结构与 ThemeColorToken 严格对齐）
 * - codeHighlight 单独 import 自 defaultCodeHighlight（便于主题包外复用）
 * - state 用 defaultStateColor（主题通常不特化全局状态色）
 * - 整体偏向"中性、明亮、温和"，适合做视觉基线
 */
export const defaultThemeColorToken: ThemeColorToken = {
  // 系统背景：白 + 极浅灰阶
  background: {
    base: '#ffffff',
    primary: '#fafafa',
    secondary: '#f4f4f5',
    tertiary: '#e4e4e7',
    elevated: '#ffffff',
  },

  // 组件级背景
  component: {
    base: '#ffffff',
    primary: '#fafafa',
    secondary: '#f4f4f5',
    tertiary: '#e4e4e7',
    elevated: '#ffffff',
  },

  // 蒙层
  overlay: {
    overlay: 'rgba(0, 0, 0, 0.5)',
  },

  // 文字
  text: {
    primary: '#18181b',
    secondary: '#3f3f46',
    tertiary: '#71717a',
    inverse: '#fafafa',
    placeholder: '#a1a1aa',
    onBrand: '#ffffff',
  },

  // 链接
  link: {
    default: '#2563eb',
    visited: '#7c3aed',
  },

  // 边框
  border: {
    primary: '#e4e4e7',
    secondary: '#d4d4d8',
    divider: '#f4f4f5',
    dashed: '#a1a1aa',
    outline: '#71717a',
  },

  // 图表色板：Tailwind 风格 18 色
  dataViz: {
    chart1: '#3b82f6',
    chart2: '#60a5fa',
    chart3: '#93c5fd',
    chart4: '#bfdbfe',
    chart5: '#dbeafe',
    chart6: '#38bdf8',
    chart7: '#22d3ee',
    chart8: '#06b6d4',
    chart9: '#818cf8',
    chart10: '#a5b4fc',
    chart11: '#c4b5fd',
    chart12: '#e9d5ff',
    chart13: '#34d399',
    chart14: '#5eead4',
    chart15: '#fde047',
    chart16: '#fb923c',
    chart17: '#fb7185',
    chart18: '#cbd5e1',
  },

  // 选区
  selection: {
    bg: 'rgba(59, 130, 246, 0.3)',
    text: '#18181b',
  },

  // 骨架屏
  skeleton: {
    base: '#f4f4f5',
    shimmer: '#e4e4e7',
  },

  // 阴影
  shadow: {
    soft: 'rgba(0, 0, 0, 0.05)',
    medium: 'rgba(0, 0, 0, 0.1)',
    strong: 'rgba(0, 0, 0, 0.2)',
  },

  // 滚动条
  scrollbar: {
    track: '#f4f4f5',
    thumb: '#d4d4d8',
  },

  // 渐变
  gradient: {
    brandFrom: '#3b82f6',
    brandVia: '#6366f1',
    brandTo: '#8b5cf6',
    accentFrom: '#06b6d4',
    accentVia: '#3b82f6',
    accentTo: '#8b5cf6',
  },

  // 主题全局状态色值：通用层使用默认
  state: defaultStateColor,

  // 代码高亮配色：通用层使用 GitHub Light 兜底
  codeHighlight: defaultCodeHighlight,
};

// 默认语义色同时 re-export，便于上层 mergeColor 时引用
export { defaultSemanticColor, defaultCodeHighlight };
