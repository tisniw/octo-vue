/**
 * o-text 文本组件类型定义
 * 集成 pretext 布局引擎的高级排版功能
 * 支持：显示效果 / 交互效果 / 动画效果
 */

import type { WhiteSpaceMode, WordBreakMode } from './analysis'
import type { FunctionalSemantic } from '@octovue/theme'
import type { HighlightProp, HighlightLanguage } from './highlight'

// ==================== 基础枚举 ====================

/** HTML 标签类型 */
export type TextTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div' | 'label' | 'strong' | 'em' | 'code' | 'pre'

/** 简写标签类型（用作 prop 时） */
export type TextTagShortcut = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'strong' | 'em' | 'code' | 'pre'

/**
 * 文本色调：严格 6 语义对齐主题系统 FUNCTIONAL_SEMANTICS
 *   default / success / error / warning / info / emphasis
 * 与 o-link / o-button 严格保持一致。
 */
export type TextTony = FunctionalSemantic

/** 尺寸 */
export type TextSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

/** 字重 */
export type TextWeight = 'thin' | 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold'

/** 对齐 */
export type TextAlign = 'left' | 'center' | 'right' | 'justify' | 'start' | 'end'

/** 省略模式 */
export type TextEllipsis = boolean | number | { rows?: number; append?: string }

/** 文本方向 */
export type TextDirection = 'ltr' | 'rtl' | 'auto'

/** 文本装饰线样式 */
export type TextDecorationStyle = 'solid' | 'dashed' | 'dotted' | 'double' | 'wavy'

/** 强调标记类型 */
export type TextMarkType = 'highlight' | 'underline' | 'del' | 'ins' | 'code' | 'quote'

// ==================== 显示效果类型 ====================

/** 渐变文字方向 */
export type GradientDirection = 'horizontal' | 'vertical' | 'diagonal' | 'radial' | number

/** 渐变颜色配置 */
export interface GradientColor {
  color: string
  offset?: number // 0-100 百分比
}

/** 文字阴影配置 */
export interface TextShadowConfig {
  x?: number | string
  y?: number | string
  blur?: number | string
  color?: string
}

/** 文字描边模式（2026-06 扩展） */
export type TextStrokeMode = 'outline' | 'inline' | 'double'

/** 文字描边配置 */
export interface TextStrokeConfig {
  /** 描边宽度，默认 2px（建议用 em 单位适配不同字号，如 '0.05em'） */
  width?: number | string
  /** 描边颜色，默认 currentColor（自动适配主题） */
  color?: string
  /** 文字填充，false 时文字透明只显示轮廓，默认 true */
  filled?: boolean
  /** 描边模式（2026-06 新增）：
   * - 'outline'：外描边（paint-order: stroke fill），文字不变粗
   * - 'inline'：内描边（paint-order: fill stroke），描边变文字色
   * - 'double'：双层描边（需配合 layers 使用）
   */
  mode?: TextStrokeMode
  /** 双层描边配置（仅 mode='double' 生效） */
  layers?: Array<{ color: string; width: number | string }>
  /** 深色模式专用描边颜色（未指定则自动推导为高对比度颜色） */
  darkColor?: string
}

/** 装饰线配置 */
export interface TextDecorationConfig {
  line?: 'underline' | 'overline' | 'line-through' | 'none'
  style?: TextDecorationStyle
  color?: string
  thickness?: number
  offset?: number // 下划线距文字的间距
}

/** 高亮/标记模式（2026-06 扩展） */
export type TextMarkMode = 'block' | 'line' | 'marker' | 'underline'

/** 高亮/标记配置 */
export interface TextHighlightConfig {
  /** 高亮背景色（默认 'rgba(255, 220, 60, 0.6)' 黄色高亮笔） */
  color?: string
  /** 高亮时文字颜色（可选覆盖 tony 主题色） */
  textColor?: string
  /** 圆角（仅 block/marker 模式生效） */
  radius?: number
  /** 内边距（仅 block 模式生效） */
  padding?: string
  /** 高亮模式（2026-06 新增，默认 'line' 高亮笔效果）：
   * - 'block'：纯色块背景
   * - 'line'：高亮笔划线效果（默认）
   * - 'marker'：马克笔块状效果（带阴影）
   * - 'underline'：厚下划线效果
   */
  mode?: TextMarkMode
  /** 深色模式专用颜色 */
  darkColor?: string
}

/** 轮廓/边框配置 */
export interface TextOutlineConfig {
  color?: string
  width?: number
  style?: TextDecorationStyle
}

/** 挖空/镂空模式（2026-06 重新定义，默认 'outline'） */
export type TextHollowMode = 'outline' | 'blur' | 'glass'

/** 挖空/镂空配置 */
export interface TextHollowConfig {
  /** 轮廓颜色（默认 currentColor） */
  color?: string
  /** 模糊半径（仅 mode='blur' 生效，默认 4px） */
  blur?: number
  /** 描边宽度（仅 mode='outline' 生效，默认 1.5px） */
  strokeWidth?: number | string
  /** 镂空模式（2026-06 重新定义）：
   * - 'outline'：外描边空心（默认推荐，真正的"空心字"）
   * - 'blur'：模糊文字（保留旧版行为作为向后兼容）
   * - 'glass'：玻璃态镂空（描边 + 背景模糊光晕）
   */
  mode?: TextHollowMode
  /** hover 填充色（未指定则填充为 currentColor） */
  fillColor?: string
  /** hover 时是否填充（默认 false） */
  fillOnHover?: boolean
  /** glass 模式下的背景模糊光晕色（默认 rgba(255,255,255,0.5)） */
  backdropColor?: string
  /** 深色模式专用描边色 */
  darkColor?: string
}

/** 发光效果配置 */
export interface TextGlowConfig {
  color?: string
  blur?: number
  spread?: number
}

/** 装饰元素（前后图标/文字） */
export interface TextDecorationElement {
  content: string
  position?: 'before' | 'after'
  spacing?: number
}

/** OText 内嵌 OIcon 配置 */
export interface TextIconConfig {
  /** 图标名（OIcon 的 name） */
  name: string
  /** 图标库（OIcon 的 library），默认 'static-base' */
  library?: string
  /** 图标尺寸（OIcon 的 size） */
  size?: 'tiny' | 'small' | 'medium' | 'large' | 'huge' | number
  /** 与文本间距（px） */
  spacing?: number
}

// ==================== 交互效果类型 ====================

/** Hover 效果类型 */
export type HoverEffectType =
  | 'none'
  | 'color'       // 颜色变化
  | 'scale'       // 缩放
  | 'underline'    // 下划线
  | 'opacity'     // 透明度
  | 'highlight'   // 高亮背景
  | 'wobble'      // 轻微抖动
  | 'lift'        // 上浮阴影
  | 'flash'       // 闪烁

/** Hover 效果配置 */
export interface TextHoverConfig {
  type?: HoverEffectType
  color?: string // hover 时的颜色
  scale?: number // 缩放比例
  duration?: number // 过渡时间（秒）
  backgroundColor?: string
  textDecoration?: string
}

/** 点击效果类型 */
export type ClickEffectType =
  | 'none'
  | 'ripple'        // 涟漪
  | 'press'         // 按下缩小
  | 'bounce'        // 弹跳
  | 'wave'          // 波浪
  | 'burst'         // 爆发

/** 点击效果配置 */
export interface TextClickConfig {
  type?: ClickEffectType
  color?: string // 涟漪颜色
  duration?: number
  scale?: number // 按下缩放比例
}

/** 文本选择配置 */
export interface TextSelectConfig {
  enabled?: boolean
  color?: string // 选中背景色
  textColor?: string // 选中文字色
  mode?: 'default' | 'all' | 'word'
}

/** 可复制配置 */
export interface TextCopyConfig {
  enabled?: boolean
  successText?: string // 复制成功后显示的文字
  duration?: number // 显示时长（毫秒）
  tooltip?: string // 提示文字
}

// ==================== 动画效果类型 ====================

/** 进入动画类型（一次性） */
export type EnterAnimationType =
  | 'none'
  // ── 基础进入 ──
  | 'fade'           // 淡入
  | 'slide-up'       // 从下往上滑入
  | 'slide-down'     // 从上往下滑入
  | 'slide-left'     // 从右往左滑入
  | 'slide-right'    // 从左往右滑入
  | 'zoom'           // 缩放淡入
  | 'blink'          // 闪烁进入
  | 'bounce'         // 弹跳进入
  | 'blur-in'        // 模糊淡入
  | 'elastic'        // 弹性进入
  | 'flip'           // 3D 翻转进入
  | 'slide-spin'     // 滑入+旋转
  | 'tremble'        // 震动进入
  | 'char-reveal'    // 逐字显示

  // ── 持续展示（可循环） ──
  | 'breathe'        // 呼吸缩放
  | 'float'          // 飘浮起伏
  | 'glow'           // 发光脉动
  | 'sway'           // 轻微摇晃
  | 'scale-pulse'    // 缩放脉冲
  | 'border-flow'    // 描边流光
  | 'reveal'         // 渐显（柔和）
  | 'sparkle'        // 星光闪烁
  | 'char-wave'      // 逐字波浪

  // ── 特殊 ──
  | 'typing'         // 打字机效果（JS 配合）

/** 打字机效果配置 */
export interface TypingConfig {
  speed?: number // 每个字符速度（毫秒），默认 60
  cursor?: boolean // 是否显示光标
  cursorChar?: string // 光标字符，默认 '|'
  cursorBlink?: boolean // 光标闪烁，默认 true
  startDelay?: number // 开始延迟（毫秒）
  loop?: boolean // 是否循环
  loopDelay?: number // 循环间隔（毫秒），默认 3000
  keepMode?: 'keep' | 'backspace' | 'fade' // 循环重置方式
  streaming?: boolean // 流式模式（外部控制，不自动打字）
}

/** 循环动画类型 */
export type LoopAnimationType =
  | 'none'
  | 'pulse'          // 脉动（放大+透明度）
  | 'blink'          // 闪烁（透明度）
  | 'bounce'         // 上下弹跳
  | 'shake'          // 左右抖动
  | 'rotate'         // 旋转
  | 'wander'         // 飘动（轻微位移+旋转）
  | 'wave'           // 波浪形（逐字波浪）
  | 'char-wave'      // 逐字波浪（JS 配合）
  | 'shimmer'        // 光泽流动
  | 'gradient-flow'  // 渐变流动
  | 'countdown'      // 倒计时效果

/** 循环动画配置 */
export interface LoopAnimationConfig {
  type?: LoopAnimationType
  duration?: number // 单次动画时长（秒）
  delay?: number // 延迟（秒）
  iterations?: number | 'infinite' // 重复次数
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse'
  easing?: string // CSS 缓动函数
}

/** 打字机效果配置 */
export type TypingEffectConfig = TypingConfig

// ==================== Props 主接口 ====================

/**
 * o-text 文本组件完整 Props
 */
export interface TextProps {
  // ── 简写标签（直接作为 prop 使用，如 <o-text pre>） ──
  /** 简写 h1 标签 */
  h1?: boolean
  /** 简写 h2 标签 */
  h2?: boolean
  /** 简写 h3 标签 */
  h3?: boolean
  /** 简写 h4 标签 */
  h4?: boolean
  /** 简写 h5 标签 */
  h5?: boolean
  /** 简写 h6 标签 */
  h6?: boolean
  /** 简写 p 标签 */
  p?: boolean
  /** 简写 span 标签 */
  span?: boolean
  /** 简写 strong 标签 */
  strong?: boolean
  /** 简写 em 标签 */
  em?: boolean
  /** 简写 code 标签 */
  code?: boolean
  /** 简写 pre 标签 */
  pre?: boolean

  // ── 基础属性 ──
  /** HTML 标签 */
  tag?: TextTag
  /** 色调 */
  tony?: TextTony
  /** 尺寸 */
  size?: TextSize
  /** 字重 */
  weight?: TextWeight
  /** 文本截断 */
  ellipsis?: TextEllipsis
  /** 对齐方式 */
  align?: TextAlign
  /** 文本方向 */
  direction?: TextDirection
  /** 自定义字体 */
  font?: string
  /** 最大宽度 */
  maxWidth?: number | string
  /** 行高 */
  lineHeight?: number | string
  /** 字间距 */
  letterSpacing?: number | string
  /** 首行缩进 */
  textIndent?: number | string
  /** white-space 模式 */
  whiteSpace?: WhiteSpaceMode
  /** word-break 模式 */
  wordBreak?: WordBreakMode
  /** 装饰线 */
  decoration?: string | TextDecorationConfig
  /** 前缀图标（OIcon 配置） */
  prefixIcon?: TextIconConfig
  /** 后缀图标（OIcon 配置） */
  suffixIcon?: TextIconConfig
  /** 垂直对齐 */
  verticalAlign?: 'top' | 'middle' | 'bottom' | 'baseline'
  /** 用户选择 */
  userSelect?: 'none' | 'text' | 'all' | 'contain'
  /** 是否禁用 */
  disabled?: boolean
  /** 组件样式名称（用于自定义样式覆盖） */
  mode?: string

  // ── 显示效果 ──
  /** 渐变文字（前景色） */
  gradient?: string | GradientColor[]
  /** 渐变方向 */
  gradientDirection?: GradientDirection
  /** 文字阴影 */
  shadow?: string | TextShadowConfig | TextShadowConfig[]
  /** 文字描边（空心字） */
  stroke?: TextStrokeConfig
  /** 挖空/镂空字 */
  hollow?: TextHollowConfig
  /** 发光效果 */
  glow?: TextGlowConfig
  /** 高亮标记 */
  mark?: string | TextHighlightConfig
  /** 轮廓/边框文字 */
  outline?: TextOutlineConfig
  /** 等宽字体（代码风格） */
  monospace?: boolean
  /**
   * 是否启用内置语法高亮（仅 tag=pre 时生效）
   *
   *   undefined / false → 不启用
   *   true              → 启用，默认 javascript
   *   HighlightConfig   → 启用并应用配置
   *
   * 启用后，组件会把 slot 文本经过内置的轻量 token 化处理（零外部依赖），
   * 自动套上 .o-text__hl-* 类，颜色由 theme 主题组件包按当前激活视觉×主题注入 --ohl-* 变量。
   *
   * 注：可独立传 codeLanguage 指定语言，等价于 { highlight: { language: codeLanguage } }。
   */
  highlight?: HighlightProp
  /** 便捷指定高亮语言（不传 highlight 时，本字段不生效） */
  codeLanguage?: HighlightLanguage
  /** 大写转换 */
  uppercase?: boolean
  /** 小写转换 */
  lowercase?: boolean
  /** 首字母大写 */
  capitalize?: boolean

  // ── 交互效果 ──
  /** Hover 效果配置 */
  hover?: TextHoverConfig
  /** 点击效果配置 */
  click?: TextClickConfig
  /** 是否可复制 */
  copyable?: boolean | TextCopyConfig
  /** 文本选择配置 */
  selectable?: boolean | TextSelectConfig
  /** 点击事件回调 */
  onClick?: (e: MouseEvent) => void

  // ── 动画效果 ──
  /** 进入动画 */
  animation?: EnterAnimationType | LoopAnimationConfig
  /** 打字机效果配置（优先级高于 animation） */
  typing?: TypingEffectConfig | boolean
  /** 循环动画 */
  loop?: LoopAnimationType | LoopAnimationConfig
  /** 动画延迟（秒） */
  animationDelay?: number | string
  /** 动画时长（秒） */
  animationDuration?: number | string

  // ── 高级布局 ──
  /** 是否启用 pretext 精确测量 */
  precisionLayout?: boolean
  /** 显示行数（与 ellipsis 配合） */
  rows?: number

  // ── 辅助属性 ──
  /** 标题提示（原生 title） */
  title?: string
  /** 额外样式 */
  style?: Record<string, any>
  /** 额外类名 */
  className?: string
  /** 引用 ID */
  id?: string
  /** 角色属性（无障碍） */
  role?: string
  /** aria-label */
  ariaLabel?: string
}

// ==================== 事件定义 ====================

export interface TextEvents {
  /** 布局计算完成 */
  onLayout?: (result: TextLayoutResult) => void
  /** 测量完成 */
  onMeasure?: (result: TextMeasureResult) => void
  /** 点击事件 */
  onClick?: (e: MouseEvent) => void
  /** 复制成功 */
  onCopy?: (text: string) => void
  /** 动画开始 */
  onAnimationStart?: () => void
  /** 动画结束 */
  onAnimationEnd?: () => void
  /** 打字完成 */
  onTypingComplete?: () => void
  /** hover 进入 */
  onMouseenter?: () => void
  /** hover 离开 */
  onMouseleave?: () => void
}

// ==================== 结果类型 ====================

/** 布局结果 */
export interface TextLayoutResult {
  lineCount: number
  height: number
  lines: TextLineInfo[]
}

/** 单行信息 */
export interface TextLineInfo {
  text: string
  width: number
  start: { segmentIndex: number; graphemeIndex: number }
  end: { segmentIndex: number; graphemeIndex: number }
}

/** 测量结果 */
export interface TextMeasureResult {
  naturalWidth: number
  lineCount: number
  height: number
  maxLineWidth: number
}

// ==================== 快捷预设类型（用于主题/配置） ====================

/** 预设文本样式 */
export interface TextPreset {
  /** 显示预设 */
  display?: Partial<Pick<TextProps,
    | 'gradient'
    | 'shadow'
    | 'stroke'
    | 'hollow'
    | 'glow'
    | 'mark'
    | 'outline'
    | 'monospace'
  >>
  /** 交互预设 */
  interaction?: Partial<Pick<TextProps, 'hover' | 'click' | 'copyable' | 'selectable'>>
  /** 动画预设 */
  animation?: Partial<Pick<TextProps, 'animation' | 'typing' | 'loop'>>
}

/** 预设集合 */
export interface TextPresets {
  [key: string]: TextPreset
}