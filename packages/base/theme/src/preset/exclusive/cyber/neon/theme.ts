import { defaultStateColor, type CodeHighlightColor, type ThemeColorToken } from '../../../../core/token/color';
import type { PresetTheme } from '../../../types';
import neonStyle from './style';

/**
 * Neon 主题的 codeHighlight 基线（深紫黑底 + 强霓虹）
 *
 * 设计定位：
 *   - 在 cyber 视觉基线上加重饱和度，每个 token 都「发光」
 *   - keyword / regex / boolean / null: 霓虹粉红 — 警示/重点
 *   - string: 霓虹青 — 与粉拉开色相
 *   - number / attr / property: 霓虹黄 — 高亮数值
 *   - function / type / variable: 霓虹紫 — 可调用实体
 *   - tag / selector: 霓虹绿
 *   - operator / builtin: 霓虹橙
 *   - comment: 紫粉灰 — 与背景深紫保持距离但不过亮
 *   - punctuation / plain: 浅紫粉
 *   - background: 深紫黑 — 与主题 background.base 同色
 */
const neonCodeHighlight: CodeHighlightColor = {
  keyword: '#ec4899',      // 霓虹粉红
  string: '#22d3ee',       // 霓虹青
  number: '#fde047',       // 霓虹黄
  comment: '#a78bfa',      // 紫粉灰
  regex: '#ec4899',        // 霓虹粉红 — 正则
  function: '#c4b5fd',     // 霓虹紫
  variable: '#fdf4ff',     // 浅紫粉
  type: '#c4b5fd',         // 霓虹紫
  tag: '#34d399',          // 霓虹绿
  attr: '#fde047',         // 霓虹黄
  operator: '#fb923c',     // 霓虹橙
  punctuation: '#e9d5ff',  // 浅紫
  property: '#fde047',     // 霓虹黄
  builtin: '#fb923c',      // 霓虹橙
  boolean: '#ec4899',      // 霓虹粉红
  null: '#ec4899',         // 霓虹粉红
  selector: '#34d399',     // 霓虹绿
  plain: '#fdf4ff',        // 浅紫粉
  background: '#0a0414',   // 深紫黑
};

/**
 * Neon 主题颜色 token
 * 强烈霓虹光晕、故障风
 * - 深紫黑底 + 霓虹紫粉主调，赛博视觉下的"霓虹主题"
 * - 仅设置 ThemeColorToken 类型要求字段
 * - 状态/语义由上层 SemanticColor + SharedColorState 统一供应，本层不特化
 */
export const neonTheme: ThemeColorToken = {
  // 系统背景：深紫黑底 + 紫红叠层
  background: {
    base: '#0a0414',
    primary: '#150828',
    secondary: '#1f0d3d',
    tertiary: '#2e1452',
    elevated: '#1a0a30',
  },

  // 组件级背景：紫粉层级
  component: {
    base: '#0a0414',
    primary: '#150828',
    secondary: '#1f0d3d',
    tertiary: '#2e1452',
    elevated: '#1a0a30',
  },

  // 蒙层
  overlay: {
    overlay: 'rgba(10, 4, 20, 0.8)',
  },

  // 文字
  text: {
    primary: '#fdf4ff',
    secondary: '#f5d0fe',
    tertiary: '#e879f9',
    inverse: '#0a0414',
    placeholder: '#7c3aed',
    onBrand: '#ffffff',
  },

  // 链接：霓虹粉 + 霓虹紫
  link: {
    default: '#f0abfc',
    visited: '#c084fc',
  },

  // 边框
  border: {
    primary: '#2e1452',
    secondary: '#1f0d3d',
    divider: '#150828',
    dashed: '#a78bfa',
    outline: '#e879f9',
  },

  // 图表色板：霓虹紫粉主调 + 强对比
  dataViz: {
    chart1: '#ec4899',
    chart2: '#f472b6',
    chart3: '#f0abfc',
    chart4: '#fae8ff',
    chart5: '#fdf4ff',
    chart6: '#c084fc',
    chart7: '#a855f7',
    chart8: '#7c3aed',
    chart9: '#22d3ee',
    chart10: '#06b6d4',
    chart11: '#0891b2',
    chart12: '#fbbf24',
    chart13: '#facc15',
    chart14: '#84cc16',
    chart15: '#22c55e',
    chart16: '#10b981',
    chart17: '#f87171',
    chart18: '#94a3b8',
  },

  // 选区
  selection: {
    bg: 'rgba(236, 72, 153, 0.35)',
    text: '#fdf4ff',
  },

  // 骨架屏
  skeleton: {
    base: '#1f0d3d',
    shimmer: '#2e1452',
  },

  // 阴影：霓虹紫粉光
  shadow: {
    soft: 'rgba(192, 132, 252, 0.25)',
    medium: 'rgba(236, 72, 153, 0.45)',
    strong: 'rgba(236, 72, 153, 0.65)',
  },

  // 滚动条
  scrollbar: {
    track: '#150828',
    thumb: '#2e1452',
  },

  // 渐变：紫→粉→霓虹蓝
  gradient: {
    brandFrom: '#7c3aed',
    brandVia: '#a855f7',
    brandTo: '#ec4899',
    accentFrom: '#ec4899',
    accentVia: '#f472b6',
    accentTo: '#22d3ee',
  },

  // 主题全局状态色值：本层不特化 使用默认值
  state: defaultStateColor,

  // 代码高亮：深紫黑底 + 霓虹强对比
  codeHighlight: neonCodeHighlight,
};

/* ─────────────────────────── 主题元信息 ─────────────────────────── */

/**
 * Neon 主题元信息（统一规范：仅保留 sn / name / description）
 *
 * - sn         = 'cyber-neon'（与主题目录 {visual}/{slug} 对齐，扫描后作为 themeStyles 的 key）
 * - visual     来源是文件路径（exclusive 扫描产物 themeVisualMap 拿）
 * - slug       来源是文件路径
 */
export const neonThemeMeta: PresetTheme['meta'] = {
  sn: 'cyber-neon',
  name: '霓虹',
  description: '强烈霓虹光晕、故障风的赛博朋克主题',
};

/* ─────────────────────────── 组合导出 ─────────────────────────── */

/**
 * Neon 主题完整 PresetTheme
 *
 * - color: 颜色 token（深紫底 + 霓虹紫粉）
 * - style: 自身样式补丁（紫粉霓虹光晕 + Orbitron 显示字体）
 *
 * 层级加载顺序（preset/merge.ts 实现）：
 *   defaultStyleToken
 *      ← cyber 视觉层  (exclusive/cyber/style.ts)
 *         ← neon 主题层 (exclusive/cyber/neon/style.ts ← 本文件 style 字段)
 */
export const neonPresetTheme: PresetTheme = {
  meta: neonThemeMeta,
  color: neonTheme,
  style: neonStyle,
};

/**
 * Neon 主题自身的 StylePatch 快捷导出
 * 等价于 `import neonStyle from './style'` 的 default 导出
 */
export { neonStyle };