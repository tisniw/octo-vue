import { defaultStateColor, type ThemeColorToken } from '../../../../core/token/color';
import type { PresetTheme } from '../../../types';
import quantumStyle from './style';

/**
 * Quantum 主题颜色 token
 * 精确、冷峻、未来感
 * - 深蓝底 + 青色主调，未来视觉下的"量子主题"
 * - 仅设置 ThemeColorToken 类型要求字段
 * - 状态/语义由上层 SemanticColor + SharedColorState 统一供应，本层不特化
 */
export const quantumTheme: ThemeColorToken = {
  // 系统背景：深空蓝底 + 青蓝叠层
  background: {
    base: '#020617',
    primary: '#0a1628',
    secondary: '#0e1e3a',
    tertiary: '#13314e',
    elevated: '#0c1a30',
  },

  // 组件级背景：量子蓝层级
  component: {
    base: '#020617',
    primary: '#0a1628',
    secondary: '#0e1e3a',
    tertiary: '#13314e',
    elevated: '#0c1a30',
  },

  // 蒙层
  overlay: {
    overlay: 'rgba(2, 6, 23, 0.78)',
  },

  // 文字
  text: {
    primary: '#ecfeff',
    secondary: '#cffafe',
    tertiary: '#67e8f9',
    inverse: '#020617',
    placeholder: '#0e7490',
    onBrand: '#ffffff',
  },

  // 链接：青色 + 蓝
  link: {
    default: '#22d3ee',
    visited: '#60a5fa',
  },

  // 边框
  border: {
    primary: '#13314e',
    secondary: '#0e1e3a',
    divider: '#0a1628',
    dashed: '#475569',
    outline: '#06b6d4',
  },

  // 图表色板：青蓝主调 + 量子光扩展
  dataViz: {
    chart1: '#06b6d4',
    chart2: '#22d3ee',
    chart3: '#67e8f9',
    chart4: '#a5f3fc',
    chart5: '#cffafe',
    chart6: '#0891b2',
    chart7: '#0e7490',
    chart8: '#155e75',
    chart9: '#3b82f6',
    chart10: '#60a5fa',
    chart11: '#93c5fd',
    chart12: '#a78bfa',
    chart13: '#c4b5fd',
    chart14: '#e879f9',
    chart15: '#f472b6',
    chart16: '#34d399',
    chart17: '#fbbf24',
    chart18: '#94a3b8',
  },

  // 选区
  selection: {
    bg: 'rgba(6, 182, 212, 0.3)',
    text: '#ecfeff',
  },

  // 骨架屏
  skeleton: {
    base: '#0e1e3a',
    shimmer: '#13314e',
  },

  // 阴影：青色量子光
  shadow: {
    soft: 'rgba(6, 182, 212, 0.2)',
    medium: 'rgba(6, 182, 212, 0.4)',
    strong: 'rgba(6, 182, 212, 0.6)',
  },

  // 滚动条
  scrollbar: {
    track: '#0a1628',
    thumb: '#13314e',
  },

  // 渐变：青→蓝→紫双轴
  gradient: {
    brandFrom: '#0e7490',
    brandVia: '#06b6d4',
    brandTo: '#22d3ee',
    accentFrom: '#22d3ee',
    accentVia: '#3b82f6',
    accentTo: '#a78bfa',
  },

  // 主题全局状态色值：本层不特化 使用默认值
  state: defaultStateColor,
};

/* ─────────────────────────── 主题元信息 ─────────────────────────── */

/**
 * Quantum 主题元信息（统一规范：仅保留 sn / name / description）
 *
 * - sn         = 'future-quantum'（与主题目录 {visual}/{slug} 对齐，扫描后作为 themeStyles 的 key）
 * - visual     来源是文件路径（exclusive 扫描产物 themeVisualMap 拿）
 * - slug       来源是文件路径
 */
export const quantumThemeMeta: PresetTheme['meta'] = {
  sn: 'future-quantum',
  name: '量子',
  description: '精确、冷峻、未来感的量子主题',
};

/* ─────────────────────────── 组合导出 ─────────────────────────── */

/**
 * Quantum 主题完整 PresetTheme
 *
 * - color: 颜色 token（深蓝底 + 青色量子光）
 * - style: 自身样式补丁（青色量子光阴影 + JetBrains Mono + 小字号）
 *
 * 层级加载顺序（preset/merge.ts 实现）：
 *   defaultStyleToken
 *      ← future 视觉层 (exclusive/future/style.ts)
 *         ← quantum 主题层 (exclusive/future/quantum/style.ts ← 本文件 style 字段)
 */
export const quantumPresetTheme: PresetTheme = {
  meta: quantumThemeMeta,
  color: quantumTheme,
  style: quantumStyle,
};

/**
 * Quantum 主题自身的 StylePatch 快捷导出
 * 等价于 `import quantumStyle from './style'` 的 default 导出
 */
export { quantumStyle };