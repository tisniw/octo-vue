import { defaultStateColor, type CodeHighlightColor, type ThemeColorToken } from '../../../../core/token/color';
import type { PresetTheme } from '../../../types';
import terminalStyle from './style';

/**
 * Terminal 主题的 codeHighlight 基线（经典终端绿）
 *
 * 设计定位：
 *   - 纯黑底 + 经典绿字的「教科书终端」配色
 *   - keyword / boolean / null / builtin / operator / regex: 经典亮绿（与主题 text.primary 同系）
 *   - string / tag / selector: 琥珀黄 — 与绿拉开色相，避免视觉混淆
 *   - function / type / variable: 冰蓝 — 突出「可调用实体」
 *   - comment: 暗绿 — 比普通注释更贴近背景，但仍可读
 *   - number / attr / property: 冰蓝 — 中性数值
 *   - background: 纯黑 — 与终端主背景同色
 */
const terminalCodeHighlight: CodeHighlightColor = {
  keyword: '#4ade80',      // 经典亮绿 — 关键字
  string: '#fde047',       // 琥珀黄 — 字符串
  number: '#7dd3fc',       // 冰蓝 — 数字
  comment: '#166534',      // 暗绿 — 注释
  regex: '#4ade80',        // 经典绿 — 正则
  function: '#86efac',     // 浅绿 — 函数
  variable: '#bbf7d0',     // 嫩绿 — 变量
  type: '#86efac',         // 浅绿 — 类型
  tag: '#fbbf24',          // 琥珀 — HTML 标签
  attr: '#7dd3fc',         // 冰蓝 — 属性
  operator: '#4ade80',     // 经典绿 — 操作符
  punctuation: '#86efac',  // 浅绿 — 标点
  property: '#7dd3fc',     // 冰蓝 — 属性访问
  builtin: '#4ade80',      // 经典绿 — 内置常量
  boolean: '#4ade80',      // 经典绿 — boolean
  null: '#4ade80',         // 经典绿 — null/undefined
  selector: '#fbbf24',     // 琥珀 — CSS 选择器
  plain: '#4ade80',        // 经典绿 — 普通文本
  background: '#000000',   // 纯黑 — 与背景同色
};

/**
 * Terminal 主题颜色 token
 * 硬朗、极小圆角、纯等宽字体
 * - 纯黑底 + 经典绿字，科技视觉下的"终端主题"
 * - 仅设置 ThemeColorToken 类型要求字段
 * - 状态/语义由上层 SemanticColor + SharedColorState 统一供应，本层不特化
 */
export const terminalTheme: ThemeColorToken = {
  // 系统背景：纯黑底 + 暗绿叠层
  background: {
    base: '#000000',
    primary: '#050805',
    secondary: '#0a110a',
    tertiary: '#0f1a0f',
    elevated: '#070d07',
  },

  // 组件级背景：终端黑层级
  component: {
    base: '#000000',
    primary: '#050805',
    secondary: '#0a110a',
    tertiary: '#0f1a0f',
    elevated: '#070d07',
  },

  // 蒙层
  overlay: {
    overlay: 'rgba(0, 0, 0, 0.85)',
  },

  // 文字：经典绿字
  text: {
    primary: '#4ade80',
    secondary: '#22c55e',
    tertiary: '#16a34a',
    inverse: '#000000',
    placeholder: '#14532d',
    onBrand: '#000000',
  },

  // 链接：亮绿
  link: {
    default: '#86efac',
    visited: '#a7f3d0',
  },

  // 边框：暗绿
  border: {
    primary: '#0f1a0f',
    secondary: '#0a110a',
    divider: '#050805',
    dashed: '#166534',
    outline: '#22c55e',
  },

  // 图表色板：终端绿主调 + 系统色板
  dataViz: {
    chart1: '#22c55e',
    chart2: '#4ade80',
    chart3: '#86efac',
    chart4: '#bbf7d0',
    chart5: '#dcfce7',
    chart6: '#16a34a',
    chart7: '#15803d',
    chart8: '#166534',
    chart9: '#10b981',
    chart10: '#34d399',
    chart11: '#6ee7b7',
    chart12: '#a7f3d0',
    chart13: '#fde047',
    chart14: '#facc15',
    chart15: '#eab308',
    chart16: '#ca8a04',
    chart17: '#f87171',
    chart18: '#737373',
  },

  // 选区
  selection: {
    bg: 'rgba(34, 197, 94, 0.35)',
    text: '#000000',
  },

  // 骨架屏
  skeleton: {
    base: '#0a110a',
    shimmer: '#0f1a0f',
  },

  // 阴影：终端绿光晕
  shadow: {
    soft: 'rgba(34, 197, 94, 0.15)',
    medium: 'rgba(34, 197, 94, 0.3)',
    strong: 'rgba(34, 197, 94, 0.5)',
  },

  // 滚动条
  scrollbar: {
    track: '#050805',
    thumb: '#0f1a0f',
  },

  // 渐变：黑→深绿→亮绿
  gradient: {
    brandFrom: '#14532d',
    brandVia: '#16a34a',
    brandTo: '#22c55e',
    accentFrom: '#22c55e',
    accentVia: '#4ade80',
    accentTo: '#86efac',
  },

  // 主题全局状态色值：本层不特化 使用默认值
  state: defaultStateColor,

  // 代码高亮：经典终端绿
  codeHighlight: terminalCodeHighlight,
};

/* ─────────────────────────── 主题元信息 ─────────────────────────── */

/**
 * Terminal 主题元信息（统一规范：仅保留 sn / name / description）
 *
 * - sn         = 'tech-terminal'（与主题目录 {visual}/{slug} 对齐，扫描后作为 themeStyles 的 key）
 * - visual     来源是文件路径（exclusive 扫描产物 themeVisualMap 拿）
 * - slug       来源是文件路径
 */
export const terminalThemeMeta: PresetTheme['meta'] = {
  sn: 'tech-terminal',
  name: '终端',
  description: '硬朗、纯等宽字体的经典终端主题',
};

/* ─────────────────────────── 组合导出 ─────────────────────────── */

/**
 * Terminal 主题完整 PresetTheme
 *
 * - color: 颜色 token（纯黑底 + 经典绿字）
 * - style: 自身样式补丁（零圆角 + 全等宽 + 极快动效）
 *
 * 层级加载顺序（preset/merge.ts 实现）：
 *   defaultStyleToken
 *      ← tech 视觉层    (exclusive/tech/style.ts)
 *         ← terminal 主题层 (exclusive/tech/terminal/style.ts ← 本文件 style 字段)
 */
export const terminalPresetTheme: PresetTheme = {
  meta: terminalThemeMeta,
  color: terminalTheme,
  style: terminalStyle,
};

/**
 * Terminal 主题自身的 StylePatch 快捷导出
 * 等价于 `import terminalStyle from './style'` 的 default 导出
 */
export { terminalStyle };