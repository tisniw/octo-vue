/**
 * o-text 文本布局引擎
 * 完整实现 pretext 项目的文本排版算法
 *
 * 这是 o-text 模块对外的统一入口（单入口 cpns/index 模式）。
 * 消费者可直接从此入口导入 Vue 组件、分析/测量/布局/行断/双向文本等模块以及全部类型。
 */

// ==================== Vue 组件 ====================
export { default as OText } from '../index.vue'

// ==================== 类型定义 ====================
export type {
  // 基础标签与语义
  TextTag,
  TextTony,
  TextSize,
  TextWeight,
  TextAlign,
  TextEllipsis,
  TextDirection,
  // 文本装饰
  TextDecorationStyle,
  TextMarkType,
  GradientDirection,
  GradientColor,
  TextShadowConfig,
  TextStrokeConfig,
  TextDecorationConfig,
  TextHighlightConfig,
  TextOutlineConfig,
  TextHollowConfig,
  TextGlowConfig,
  TextDecorationElement,
  // 交互
  HoverEffectType,
  TextHoverConfig,
  ClickEffectType,
  TextClickConfig,
  TextSelectConfig,
  TextCopyConfig,
  // 动画
  EnterAnimationType,
  TypingConfig,
  LoopAnimationType,
  LoopAnimationConfig,
  TypingEffectConfig,
  // 事件与预设
  TextEvents,
  TextPreset,
  TextPresets,
  // 核心 Props 与结果
  TextProps,
  TextLayoutResult,
  TextLineInfo,
  TextMeasureResult,
} from './types'

// ==================== 分析模块 ====================
export {
  analyzeText,
  normalizeWhitespaceNormal,
  isCJK,
  isNumericRunSegment,
  endsWithClosingQuote,
  canContinueKeepAllTextRun,
  clearAnalysisCaches,
  setAnalysisLocale,
  kinsokuStart,
  kinsokuEnd,
  leftStickyPunctuation,
  type WhiteSpaceMode,
  type WordBreakMode,
  type SegmentBreakKind,
  type TextAnalysis,
  type AnalysisChunk,
} from './analysis'

// ==================== 测量模块 ====================
export {
  getMeasureContext,
  getSegmentMetricCache,
  getSegmentMetrics,
  getEngineProfile,
  parseFontSize,
  textMayContainEmoji,
  getCorrectedSegmentWidth,
  getSegmentGraphemeWidths,
  getSegmentBreakableFitAdvances,
  getFontMeasurementState,
  clearMeasurementCaches,
  type SegmentMetrics,
  type EngineProfile,
  type BreakableFitMode,
} from './measurement'

// ==================== 布局模块 ====================
export {
  prepare,
  prepareWithSegments,
  layout,
  layoutWithLines,
  layoutNextLine,
  layoutNextLineRange,
  measureNaturalWidth,
  measureLineStats,
  walkLineRanges,
  materializeLineRange,
  clearCache,
  setLocale,
  type PreparedText,
  type PreparedTextWithSegments,
  type LayoutCursor,
  type LayoutResult,
  type LayoutLine,
  type LayoutLineRange,
  type LayoutLinesResult,
  type LineStats,
  type PrepareOptions,
} from './layout'

// ==================== 行断模块 ====================
export {
  countPreparedLines,
  walkPreparedLines,
  // 向后兼容别名（保留 stepLineRange 命名，避免破坏既有调用方）
  layoutNextLineRange as stepLineRange,
  stepPreparedLineGeometry,
  measurePreparedLineGeometry,
  normalizeLineStart,
  type InternalLayoutLine,
  type LineBreakCursor,
  type PreparedLineBreakData,
} from './line-break'

// ==================== 双向文本模块 ====================
export {
  computeSegmentLevels,
} from './bidi'
