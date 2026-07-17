import { defaultStateColor, type ThemeColorToken } from '../../../../core/token/color';
import type { PresetTheme } from '../../../types';
import nightStyle from './style';

/**
 * Night 主题颜色 token
 * 极致黑、低对比、深夜阅读
 * - 极深灰蓝主调，几乎纯黑底层
 * - 仅设置 ThemeColorToken 类型要求字段
 * - 状态/语义由上层 SemanticColor + SharedColorState 统一供应，本层不特化
 */
export const nightTheme: ThemeColorToken = {
  // 系统背景：近黑 + 深灰蓝叠层（极低对比）
  background: {
    base: '#050608',
    primary: '#0a0c10',
    secondary: '#11141a',
    tertiary: '#191d24',
    elevated: '#0e1116',
  },

  // 组件级背景：与系统背景几乎一致
  component: {
    base: '#050608',
    primary: '#0a0c10',
    secondary: '#11141a',
    tertiary: '#191d24',
    elevated: '#0e1116',
  },

  // 蒙层
  overlay: {
    overlay: 'rgba(0, 0, 0, 0.85)',
  },

  // 文字：偏暗灰白
  text: {
    primary: '#cbd5e1',
    secondary: '#94a3b8',
    tertiary: '#64748b',
    inverse: '#050608',
    placeholder: '#475569',
    onBrand: '#ffffff',
  },

  // 链接：低饱和暗夜蓝
  link: {
    default: '#475569',
    visited: '#64748b',
  },

  // 边框：极低对比
  border: {
    primary: '#191d24',
    secondary: '#11141a',
    divider: '#0a0c10',
    dashed: '#334155',
    outline: '#475569',
  },

  // 图表色板：低饱和度暗灰阶
  dataViz: {
    chart1: '#475569',
    chart2: '#64748b',
    chart3: '#94a3b8',
    chart4: '#cbd5e1',
    chart5: '#e2e8f0',
    chart6: '#334155',
    chart7: '#1e293b',
    chart8: '#0f172a',
    chart9: '#374151',
    chart10: '#4b5563',
    chart11: '#6b7280',
    chart12: '#9ca3af',
    chart13: '#52525b',
    chart14: '#71717a',
    chart15: '#a1a1aa',
    chart16: '#d4d4d8',
    chart17: '#27272a',
    chart18: '#3f3f46',
  },

  // 选区
  selection: {
    bg: 'rgba(148, 163, 184, 0.2)',
    text: '#cbd5e1',
  },

  // 骨架屏
  skeleton: {
    base: '#11141a',
    shimmer: '#191d24',
  },

  // 阴影：深夜极弱
  shadow: {
    soft: 'rgba(0, 0, 0, 0.3)',
    medium: 'rgba(0, 0, 0, 0.5)',
    strong: 'rgba(0, 0, 0, 0.7)',
  },

  // 滚动条
  scrollbar: {
    track: '#0a0c10',
    thumb: '#191d24',
  },

  // 渐变：深夜微光
  gradient: {
    brandFrom: '#1e293b',
    brandVia: '#334155',
    brandTo: '#475569',
    accentFrom: '#374151',
    accentVia: '#4b5563',
    accentTo: '#64748b',
  },

  // 主题全局状态色值：本层不特化 使用默认值
  state: defaultStateColor,
};

/* ─────────────────────────── 主题元信息 ─────────────────────────── */

/**
 * Night 主题元信息（统一规范：仅保留 sn / name / description）
 *
 * - sn         = 'dim-night'（与主题目录 {visual}/{slug} 对齐，扫描后作为 themeStyles 的 key）
 * - visual     来源是文件路径（exclusive 扫描产物 themeVisualMap 拿）
 * - slug       来源是文件路径
 */
export const nightThemeMeta: PresetTheme['meta'] = {
  sn: 'dim-night',
  name: '深夜',
  description: '极致黑、低对比的深夜阅读主题',
};

/* ─────────────────────────── 组合导出 ─────────────────────────── */

/**
 * Night 主题完整 PresetTheme
 *
 * - color: 颜色 token（极深灰蓝）
 * - style: 自身样式补丁（极弱阴影 + 低不透明度）
 *
 * 层级加载顺序（preset/merge.ts 实现）：
 *   defaultStyleToken
 *      ← dim 视觉层   (exclusive/dim/style.ts)
 *         ← night 主题层 (exclusive/dim/night/style.ts ← 本文件 style 字段)
 */
export const nightPresetTheme: PresetTheme = {
  meta: nightThemeMeta,
  color: nightTheme,
  style: nightStyle,
};

/**
 * Night 主题自身的 StylePatch 快捷导出
 * 等价于 `import nightStyle from './style'` 的 default 导出
 */
export { nightStyle };