import { defaultStateColor, type CodeHighlightColor, type ThemeColorToken } from '../../../../core/token/color';
import type { PresetTheme } from '../../../types';
import skyStyle from './style';

/**
 * Sky 主题的 codeHighlight 基线（在 bright 视觉基线之上微调）
 *
 * 设计定位：
 *   - 在 bright 基线（GitHub Light 风格）的基础上，把 keyword/operator 换成深天蓝
 *     让代码块与 sky 主题本身的「天蓝通透」调性一致
 *   - 其他 token 颜色继承 bright 视觉，仅对关键字系做语义关联
 *   - background 用极浅天蓝，与主题背景形成清晰但柔和的对比
 */
const skyCodeHighlight: CodeHighlightColor = {
  // 语言骨干（深天蓝系）
  keyword: '#0369a1',      // 深天蓝 — 关键字（与主题呼应）
  string: '#0a3069',       // 深蓝 — 字符串
  number: '#0550ae',       // 蓝 — 数字
  comment: '#64748b',      // 中灰 — 注释
  regex: '#cf222e',        // 红 — 正则（保留警示色）
  function: '#8250df',     // 紫 — 函数
  variable: '#953800',     // 棕红 — 变量
  type: '#953800',         // 棕红 — 类型
  tag: '#116329',          // 绿 — HTML 标签
  attr: '#0550ae',         // 蓝 — 属性
  operator: '#0369a1',     // 深天蓝 — 操作符
  punctuation: '#24292f',  // 近黑 — 标点
  property: '#0550ae',     // 蓝 — 属性访问
  builtin: '#0550ae',      // 蓝 — 内置常量
  boolean: '#0550ae',      // 蓝 — boolean
  null: '#0550ae',         // 蓝 — null/undefined
  selector: '#116329',     // 绿 — CSS 选择器
  plain: '#24292f',        // 近黑 — 普通文本
  background: '#f0f9ff',   // 极浅天蓝 — 与主题 background.base 协调
};

/**
 * Sky 主题颜色 token
 * 通透、清亮、午后阳光
 * - 浅蓝白主调，明亮视觉下的"天空感"
 * - 仅设置 ThemeColorToken 类型要求字段
 * - 状态/语义由上层 SemanticColor + SharedColorState 统一供应，本层不特化
 */
export const skyTheme: ThemeColorToken = {
  // 系统背景：白底 + 浅天蓝叠层
  background: {
    base: '#f0f9ff',
    primary: '#e0f2fe',
    secondary: '#bae6fd',
    tertiary: '#7dd3fc',
    elevated: '#ffffff',
  },

  // 组件级背景：与系统背景形成轻对比
  component: {
    base: '#f0f9ff',
    primary: '#e0f2fe',
    secondary: '#bae6fd',
    tertiary: '#7dd3fc',
    elevated: '#ffffff',
  },

  // 蒙层：浅蓝灰透明
  overlay: {
    overlay: 'rgba(186, 230, 253, 0.5)',
  },

  // 文字
  text: {
    primary: '#0c4a6e',
    secondary: '#0369a1',
    tertiary: '#0284c7',
    inverse: '#ffffff',
    placeholder: '#7dd3fc',
    onBrand: '#ffffff',
  },

  // 链接：亮天蓝
  link: {
    default: '#0ea5e9',
    visited: '#6366f1',
  },

  // 边框
  border: {
    primary: '#7dd3fc',
    secondary: '#bae6fd',
    divider: '#e0f2fe',
    dashed: '#94a3b8',
    outline: '#0ea5e9',
  },

  // 图表色板：天蓝主调 + 暖色点缀
  dataViz: {
    chart1: '#0ea5e9',
    chart2: '#38bdf8',
    chart3: '#7dd3fc',
    chart4: '#bae6fd',
    chart5: '#e0f2fe',
    chart6: '#22d3ee',
    chart7: '#06b6d4',
    chart8: '#0891b2',
    chart9: '#818cf8',
    chart10: '#a5b4fc',
    chart11: '#c4b5fd',
    chart12: '#fde68a',
    chart13: '#34d399',
    chart14: '#fbbf24',
    chart15: '#fb923c',
    chart16: '#f87171',
    chart17: '#c084fc',
    chart18: '#94a3b8',
  },

  // 选区
  selection: {
    bg: 'rgba(14, 165, 233, 0.2)',
    text: '#0c4a6e',
  },

  // 骨架屏
  skeleton: {
    base: '#e0f2fe',
    shimmer: '#bae6fd',
  },

  // 阴影：天空淡光
  shadow: {
    soft: 'rgba(14, 165, 233, 0.06)',
    medium: 'rgba(14, 165, 233, 0.12)',
    strong: 'rgba(14, 165, 233, 0.2)',
  },

  // 滚动条
  scrollbar: {
    track: '#e0f2fe',
    thumb: '#7dd3fc',
  },

  // 渐变：天蓝→青→靛蓝
  gradient: {
    brandFrom: '#0ea5e9',
    brandVia: '#38bdf8',
    brandTo: '#7dd3fc',
    accentFrom: '#22d3ee',
    accentVia: '#06b6d4',
    accentTo: '#6366f1',
  },

  // 主题全局状态色值：本层不特化 使用默认值
  state: defaultStateColor,

  // 代码高亮：天蓝通透调性
  codeHighlight: skyCodeHighlight,
};

/* ─────────────────────────── 主题元信息 ─────────────────────────── */

/**
 * Sky 主题元信息（统一规范：仅保留 sn / name / description）
 *
 * - sn         = 'bright-sky'（与主题目录 {visual}/{slug} 对齐，扫描后作为 themeStyles 的 key）
 * - visual     来源是文件路径（exclusive 扫描产物 themeVisualMap 拿）
 * - slug       来源是文件路径
 */
export const skyThemeMeta: PresetTheme['meta'] = {
  sn: 'bright-sky',
  name: '天空',
  description: '通透、清亮、午后阳光般的明亮主题',
};

/* ─────────────────────────── 组合导出 ─────────────────────────── */

/**
 * Sky 主题完整 PresetTheme
 *
 * - color: 颜色 token（天蓝通透色）
 * - style: 自身样式补丁（蓝天淡光阴影 + 舒展行高）
 *
 * 层级加载顺序（preset/merge.ts 实现）：
 *   defaultStyleToken
 *      ← bright 视觉层  (exclusive/bright/style.ts)
 *         ← sky 主题层   (exclusive/bright/sky/style.ts ← 本文件 style 字段)
 */
export const skyPresetTheme: PresetTheme = {
  meta: skyThemeMeta,
  color: skyTheme,
  style: skyStyle,
};

/**
 * Sky 主题自身的 StylePatch 快捷导出
 * 等价于 `import skyStyle from './style'` 的 default 导出
 */
export { skyStyle };