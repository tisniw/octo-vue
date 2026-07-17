import { defaultStateColor, type ThemeColorToken } from '../../../../core/token/color';
import type { PresetTheme } from '../../../types';
import imperialStyle from './style';

/**
 * Imperial 主题颜色 token
 * 印章红 + 金箔，威严端方
 * - 朱红主调 + 金色辅助，古风视觉下的"帝王主题"
 * - 仅设置 ThemeColorToken 类型要求字段
 * - 状态/语义由上层 SemanticColor + SharedColorState 统一供应，本层不特化
 */
export const imperialTheme: ThemeColorToken = {
  // 系统背景：朱砂红底 + 朱红叠层
  background: {
    base: '#1c0a0e',
    primary: '#2a0e16',
    secondary: '#3d141d',
    tertiary: '#5b1f28',
    elevated: '#2f1018',
  },

  // 组件级背景：朱红层级
  component: {
    base: '#1c0a0e',
    primary: '#2a0e16',
    secondary: '#3d141d',
    tertiary: '#5b1f28',
    elevated: '#2f1018',
  },

  // 蒙层
  overlay: {
    overlay: 'rgba(28, 10, 14, 0.78)',
  },

  // 文字：金白文字
  text: {
    primary: '#fef3c7',
    secondary: '#fde68a',
    tertiary: '#d4af37',
    inverse: '#1c0a0e',
    placeholder: '#7f1d1d',
    onBrand: '#fef3c7',
  },

  // 链接：金 + 朱红
  link: {
    default: '#d4af37',
    visited: '#f87171',
  },

  // 边框
  border: {
    primary: '#5b1f28',
    secondary: '#3d141d',
    divider: '#2a0e16',
    dashed: '#a16207',
    outline: '#d4af37',
  },

  // 图表色板：朱红主调 + 金色扩展
  dataViz: {
    chart1: '#dc2626',
    chart2: '#ef4444',
    chart3: '#f87171',
    chart4: '#fca5a5',
    chart5: '#fecaca',
    chart6: '#d4af37',
    chart7: '#fbbf24',
    chart8: '#f59e0b',
    chart9: '#fcd34d',
    chart10: '#fde68a',
    chart11: '#fef3c7',
    chart12: '#fffbeb',
    chart13: '#7c2d12',
    chart14: '#9a3412',
    chart15: '#c2410c',
    chart16: '#ea580c',
    chart17: '#a78bfa',
    chart18: '#94a3b8',
  },

  // 选区
  selection: {
    bg: 'rgba(212, 175, 55, 0.3)',
    text: '#fef3c7',
  },

  // 骨架屏
  skeleton: {
    base: '#3d141d',
    shimmer: '#5b1f28',
  },

  // 阴影：朱红+金光晕染
  shadow: {
    soft: 'rgba(168, 50, 74, 0.25)',
    medium: 'rgba(168, 50, 74, 0.45)',
    strong: 'rgba(168, 50, 74, 0.65)',
  },

  // 滚动条
  scrollbar: {
    track: '#2a0e16',
    thumb: '#5b1f28',
  },

  // 渐变：朱红→金黄双轴
  gradient: {
    brandFrom: '#991b1b',
    brandVia: '#dc2626',
    brandTo: '#d4af37',
    accentFrom: '#d4af37',
    accentVia: '#fbbf24',
    accentTo: '#fef3c7',
  },

  // 主题全局状态色值：本层不特化 使用默认值
  state: defaultStateColor,
};

/* ─────────────────────────── 主题元信息 ─────────────────────────── */

/**
 * Imperial 主题元信息（统一规范：仅保留 sn / name / description）
 *
 * - sn         = 'traditional-imperial'（与主题目录 {visual}/{slug} 对齐，扫描后作为 themeStyles 的 key）
 * - visual     来源是文件路径（exclusive 扫描产物 themeVisualMap 拿）
 * - slug       来源是文件路径
 */
export const imperialThemeMeta: PresetTheme['meta'] = {
  sn: 'traditional-imperial',
  name: '帝王',
  description: '印章红 + 金箔，威严端方的帝王主题',
};

/* ─────────────────────────── 组合导出 ─────────────────────────── */

/**
 * Imperial 主题完整 PresetTheme
 *
 * - color: 颜色 token（朱红主调 + 金色扩展）
 * - style: 自身样式补丁（金光晕染 + 加大圆角 + 沉字重）
 *
 * 层级加载顺序（preset/merge.ts 实现）：
 *   defaultStyleToken
 *      ← traditional 视觉层 (exclusive/traditional/style.ts)
 *         ← imperial 主题层  (exclusive/traditional/imperial/style.ts ← 本文件 style 字段)
 */
export const imperialPresetTheme: PresetTheme = {
  meta: imperialThemeMeta,
  color: imperialTheme,
  style: imperialStyle,
};

/**
 * Imperial 主题自身的 StylePatch 快捷导出
 * 等价于 `import imperialStyle from './style'` 的 default 导出
 */
export { imperialStyle };