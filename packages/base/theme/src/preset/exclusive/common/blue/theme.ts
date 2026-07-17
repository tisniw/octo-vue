import { defaultStateColor, type CodeHighlightColor, type ThemeColorToken } from '../../../../core/token/color';
import type { PresetTheme } from '../../../types';
import blueStyle from './style';

/**
 * Blue 主题的 代码高亮 token 调色板
 *
 * 设计定位：
 *   - 在冷光深蓝背景下、保证对比度都达到 AA 以上
 *   - keyword/string/number 用统一冰蓝圈色，归为一类「语言骨干」；
 *     function/type/property 用淡紫系以强调「可被调用的实体」；
 *     注释/正则保留低饱和度色作为默认泛调
 *   - background 使用蓝底层，跟 system background 错开一层避免「发亮」
 */
const blueCodeHighlight: CodeHighlightColor = {
  // 语言骨干（冰蓝圈系）
  keyword: '#79c0ff', // 关键字 - 冰蓝
  string: '#a5d6ff',  // 字符串 - 浅冰蓝
  number: '#79c0ff',  // 数字 - 同冰蓝（骨干系）
  operator: '#89ddff', // 操作符 - 净青、冰蓝齿牙
  punctuation: '#c9d1d9', // 标点 - 接近文本主色

  // 注释/弱值
  comment: '#8b96a8', // 注释 - 蓝灰色、与背景拉开
  regex: '#ff7b72',   // 正则 - 红润（与中性默认不同，提示危险）
  boolean: '#79c0ff', // true/false
  null: '#79c0ff',    // null/undefined
  builtin: '#79c0ff', // 内置常量/全局

  // 函数/类型/属性（淡紫系，强调「可调用实体」）
  function: '#d2a8ff', // 函数名 - 淡紫
  type: '#ffa657',     // 类型名 - 橙色（与背景形成色相反差）
  variable: '#e3e8f1', // 变量 - 近文本主色
  property: '#d2a8ff', // 属性访问左侧 - 同 function

  // HTML/JSX
  tag: '#7ee787',     // 标签名 - 亮绿（编码安全色）
  attr: '#79c0ff',    // 属性名 - 冰蓝
  selector: '#7ee787', // CSS 选择器 - 亮绿

  // 兜底
  plain: '#e3e8f1',
  background: '#0b1d3a', // 与 background.base 同色，避免视觉割裂
};

/**
 * 蓝色主题颜色 token
 * 深色蓝色背景
 * - 仅设置 ThemeColorToken 类型要求字段
 * - 仅承担颜色层
 * - 状态/语义由上层 SemanticColor + SharedColorState 统一供应，本层不特化
 */
export const blueTheme: ThemeColorToken = {
  // 系统背景：深蓝底层 + 蓝灰叠层
  background: {
    base: '#0b1d3a',
    primary: '#102a52',
    secondary: '#1a3a6b',
    tertiary: '#274c89',
    elevated: '#16315f',
  },

  // 组件级背景：蓝色层级叠加
  component: {
    base: '#0b1d3a',
    primary: '#102a52',
    secondary: '#1a3a6b',
    tertiary: '#274c89',
    elevated: '#16315f',
  },

  // 蒙层
  overlay: {
    overlay: 'rgba(2, 8, 23, 0.72)',
  },

  // 文字
  text: {
    primary: '#f8fafc',
    secondary: '#cbd5e1',
    tertiary: '#94a3b8',
    inverse: '#0f172a',
    placeholder: '#64748b',
    onBrand: '#ffffff',
  },

  // 链接：亮蓝 + 紫
  link: {
    default: '#60a5fa',
    visited: '#a78bfa',
  },

  // 边框
  border: {
    primary: '#274c89',
    secondary: '#1a3a6b',
    divider: '#102a52',
    dashed: '#475569',
    outline: '#64748b',
  },

  // 图表色板：蓝主调 + 亮彩扩展
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
    text: '#ffffff',
  },

  // 骨架屏
  skeleton: {
    base: '#1a3a6b',
    shimmer: '#274c89',
  },

  // 阴影
  shadow: {
    soft: 'rgba(2, 8, 23, 0.25)',
    medium: 'rgba(2, 8, 23, 0.45)',
    strong: 'rgba(2, 8, 23, 0.65)',
  },

  // 滚动条
  scrollbar: {
    track: '#102a52',
    thumb: '#274c89',
  },

  // 渐变：深蓝→亮蓝→紫双轴
  gradient: {
    brandFrom: '#1e40af',
    brandVia: '#2563eb',
    brandTo: '#3b82f6',
    accentFrom: '#3b82f6',
    accentVia: '#6366f1',
    accentTo: '#8b5cf6',
  },

  // 主题全局状态色值：本层不特化 使用默认值
  state: defaultStateColor,

  // 代码高亮配色：冷蓝系骨干 + 淡紫表调，搭配 background.base 深蓝底
  codeHighlight: blueCodeHighlight,
};

/* ─────────────────────────── 主题元信息 ─────────────────────────── */

/**
 * Blue 主题元信息（统一规范：仅保留 sn / name / description）
 *
 * - sn         = 'common-blue'（与主题目录 {visual}/{slug} 对齐，扫描后作为 themeStyles 的 key）
 * - visual     来源是文件路径（exclusive 扫描产物 themeVisualMap 拿）
 * - slug       来源是文件路径
 */
export const blueThemeMeta: PresetTheme['meta'] = {
  sn: 'common-blue',
  name: '蓝色',
  description: '冷静、专业、科技感的深蓝主题',
};

/* ─────────────────────────── 组合导出 ─────────────────────────── */

/**
 * Blue 主题完整 PresetTheme
 *
 * - color: 颜色 token（蓝色冷调）
 * - style: 自身样式补丁（冷蓝阴影 + 较大圆角）
 *
 * 层级加载顺序（preset/merge.ts 实现）：
 *   defaultStyleToken
 *      ← common 视觉层  (exclusive/common/style.ts)
 *         ← blue 主题层 (exclusive/common/blue/style.ts ← 本文件 style 字段)
 */
export const bluePresetTheme: PresetTheme = {
  meta: blueThemeMeta,
  color: blueTheme,
  style: blueStyle,
};

/**
 * Blue 主题自身的 StylePatch 快捷导出
 * 等价于 `import blueStyle from './style'` 的 default 导出
 */
export { blueStyle };
