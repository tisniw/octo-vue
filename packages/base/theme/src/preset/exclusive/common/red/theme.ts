import { defaultStateColor, type ThemeColorToken } from '../../../../core/token/color';
import type { PresetTheme } from '../../../types';
import redStyle from './style';

/**
 * Red 主题颜色 token
 * 热烈、警示、强调
 * - 暗红主调，通用视觉下的"红色主题"
 * - 仅设置 ThemeColorToken 类型要求字段
 * - 状态/语义由上层 SemanticColor + SharedColorState 统一供应，本层不特化
 */
export const redTheme: ThemeColorToken = {
  // 系统背景：深红底层 + 红黑叠层
  background: {
    base: '#1c0a0a',
    primary: '#2a0e0e',
    secondary: '#3d1414',
    tertiary: '#5b1a1a',
    elevated: '#2f1010',
  },

  // 组件级背景：红色层级叠加
  component: {
    base: '#1c0a0a',
    primary: '#2a0e0e',
    secondary: '#3d1414',
    tertiary: '#5b1a1a',
    elevated: '#2f1010',
  },

  // 蒙层
  overlay: {
    overlay: 'rgba(28, 10, 10, 0.75)',
  },

  // 文字
  text: {
    primary: '#fef2f2',
    secondary: '#fecaca',
    tertiary: '#fca5a5',
    inverse: '#1c0a0a',
    placeholder: '#7f1d1d',
    onBrand: '#ffffff',
  },

  // 链接：亮红 + 橙
  link: {
    default: '#f87171',
    visited: '#fb923c',
  },

  // 边框
  border: {
    primary: '#5b1a1a',
    secondary: '#3d1414',
    divider: '#2a0e0e',
    dashed: '#57534e',
    outline: '#7f1d1d',
  },

  // 图表色板：红主调 + 暖色扩展
  dataViz: {
    chart1: '#ef4444',
    chart2: '#f87171',
    chart3: '#fca5a5',
    chart4: '#fecaca',
    chart5: '#fee2e2',
    chart6: '#fb923c',
    chart7: '#f97316',
    chart8: '#ea580c',
    chart9: '#fbbf24',
    chart10: '#fcd34d',
    chart11: '#fde047',
    chart12: '#f0abfc',
    chart13: '#e879f9',
    chart14: '#d946ef',
    chart15: '#c084fc',
    chart16: '#a78bfa',
    chart17: '#818cf8',
    chart18: '#cbd5e1',
  },

  // 选区
  selection: {
    bg: 'rgba(239, 68, 68, 0.3)',
    text: '#ffffff',
  },

  // 骨架屏
  skeleton: {
    base: '#3d1414',
    shimmer: '#5b1a1a',
  },

  // 阴影：红色调警示阴影
  shadow: {
    soft: 'rgba(127, 29, 29, 0.25)',
    medium: 'rgba(127, 29, 29, 0.45)',
    strong: 'rgba(127, 29, 29, 0.65)',
  },

  // 滚动条
  scrollbar: {
    track: '#2a0e0e',
    thumb: '#5b1a1a',
  },

  // 渐变：深红→亮红→橙双轴
  gradient: {
    brandFrom: '#991b1b',
    brandVia: '#dc2626',
    brandTo: '#ef4444',
    accentFrom: '#ef4444',
    accentVia: '#f97316',
    accentTo: '#fb923c',
  },

  // 主题全局状态色值：本层不特化 使用默认值
  state: defaultStateColor,
};

/* ─────────────────────────── 主题元信息 ─────────────────────────── */

/**
 * Red 主题元信息（统一规范：仅保留 sn / name / description）
 *
 * - sn         = 'common-red'（与主题目录 {visual}/{slug} 对齐，扫描后作为 themeStyles 的 key）
 * - visual     来源是文件路径（exclusive 扫描产物 themeVisualMap 拿）
 * - slug       来源是文件路径
 */
export const redThemeMeta: PresetTheme['meta'] = {
  sn: 'common-red',
  name: '红色',
  description: '热烈、警示、强调的暗红色主题',
};

/* ─────────────────────────── 组合导出 ─────────────────────────── */

/**
 * Red 主题完整 PresetTheme
 *
 * - color: 颜色 token（暗红警示色）
 * - style: 自身样式补丁（红色阴影 + 小圆角 + 快动效）
 *
 * 层级加载顺序（preset/merge.ts 实现）：
 *   defaultStyleToken
 *      ← common 视觉层  (exclusive/common/style.ts)
 *         ← red 主题层  (exclusive/common/red/style.ts ← 本文件 style 字段)
 */
export const redPresetTheme: PresetTheme = {
  meta: redThemeMeta,
  color: redTheme,
  style: redStyle,
};

/**
 * Red 主题自身的 StylePatch 快捷导出
 * 等价于 `import redStyle from './style'` 的 default 导出
 */
export { redStyle };