<template>
  <component
    :is="computedTag"
    :id="props.id"
    :class="allClasses"
    :style="mergedStyles"
    :title="props.title"
    :role="props.role"
    :aria-label="props.ariaLabel"
    :disabled="props.disabled"
    :contenteditable="editable"
    ref="textRef"
    @click="handleClick"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <!-- 前缀图标 -->
    <OIcon
      v-if="props.prefixIcon"
      :name="props.prefixIcon.name"
      :library="props.prefixIcon.library"
      :size="props.prefixIcon.size ?? 'small'"
      :style="prefixIconStyle"
      class="o-text__icon o-text__icon--prefix"
    />

    <!-- 逐字波浪：字符单独渲染 -->
    <template v-if="enableCharWave && charWaveChars.length > 0">
      <span
        v-for="(char, index) in charWaveChars"
        :key="index"
        class="o-text__char"
      >{{ char }}</span>
    </template>

    <!-- 打字机模式：只显示 displayedText，slot 不渲染 -->
    <template v-else-if="typingConfig">{{ displayedText }}</template>

    <!-- 内置语法高亮：v-html 输出 token 化后的 HTML（仅 pre + highlight 启用时） -->
    <!--
      完整调用链：
        1. slots.default() → getSlotTextContent() 提取源代码文本
        2. onMounted / onUpdated 钩子同步到 slotSourceText（响应式 ref）
        3. highlightedHtml computed 读取 slotSourceText + highlightResolved
        4. highlight() → tokenize() → 按语言规则输出带 o-text__hl-xxx span 的 HTML
        5. v-html 渲染输出
      token 配色完全由 theme 主题组件包按当前激活视觉×主题注入 --ohl-* 变量，
      组件层不持有任何主题状态，也不预设 light/dark/auto 等模式
    -->
    <template v-else-if="isHighlighted" v-html="highlightedHtml" />

    <!-- 默认：渲染 slot -->
    <slot v-else />

    <!-- 后缀图标 -->
    <OIcon
      v-if="props.suffixIcon"
      :name="props.suffixIcon.name"
      :library="props.suffixIcon.library"
      :size="props.suffixIcon.size ?? 'small'"
      :style="suffixIconStyle"
      class="o-text__icon o-text__icon--suffix"
    />

    <!-- 打字机光标（紧贴文本末尾） -->
    <span v-if="showCursor && isTyping" class="o-text__cursor">{{ typingConfig?.cursorChar || '|' }}</span>

    <!-- 复制 hover 提示图标（绝对定位，紧贴文本末尾） -->
    <OIcon
      v-if="showCopyIcon && !showCopySuccess"
      name="copy"
      library="static-base"
      size="tiny"
      class="o-text__copy-hint-icon"
      :aria-label="copyConfig.tooltip || '点击复制'"
    />

    <!-- 复制成功提示（绝对定位） -->
    <span v-if="showCopySuccess" class="o-text__copy-tip">
      <OIcon
        name="check"
        library="static-base"
        size="tiny"
        class="o-text__copy-tip-icon"
      />
      {{ copyTipText }}
    </span>
  </component>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUpdated, onUnmounted, nextTick, toRefs, useSlots } from 'vue'
import { OIcon } from '@octovue/icon'

defineOptions({ name: 'OText' })

import type {
  TextProps,
  TextLayoutResult,
  TextMeasureResult,
  TextLineInfo,
  TypingConfig,
  LoopAnimationConfig,
  GradientColor,
  TextShadowConfig,
  TextHighlightConfig,
  TextDecorationConfig,
  TextGlowConfig,
  TextHollowConfig,
  TextStrokeConfig,
  TextOutlineConfig,
  TextDecorationStyle,
  TextSelectConfig,
  TextCopyConfig,
  HoverEffectType,
  ClickEffectType,
  EnterAnimationType,
  LoopAnimationType,
} from './cpns/types'

import {
  prepareWithSegments,
  layoutWithLines,
  measureNaturalWidth,
  measureLineStats,
  type PreparedTextWithSegments,
  type LayoutLine,
} from './cpns/layout'

import { highlight } from './cpns/highlight'
import type { HighlightConfig, HighlightLanguage } from './cpns/highlight'

// ==================== Props ====================

const props = withDefaults(defineProps<TextProps>(), {
  tag: undefined,
  tony: 'default',
  size: 'md',
  weight: 'normal',
  ellipsis: false,
  align: 'left',
  direction: 'ltr',
  font: '',
  maxWidth: undefined,
  lineHeight: '',
  letterSpacing: '',
  textIndent: '',
  whiteSpace: 'normal',
  wordBreak: 'normal',
  precisionLayout: false,
  rows: undefined,
  verticalAlign: 'baseline',
  userSelect: 'text',
  disabled: false,
  monospace: false,
  uppercase: false,
  lowercase: false,
  capitalize: false,
  gradient: undefined,
  gradientDirection: 'horizontal',
  shadow: undefined,
  stroke: undefined,
  hollow: undefined,
  glow: false,
  mark: undefined,
  outline: undefined,
  hover: () => ({}),
  click: () => ({}),
  copyable: false,
  selectable: true,
  animation: 'none',
  typing: false,
  loop: 'none',
  animationDelay: 0,
  animationDuration: undefined,
  decoration: 'none',
  prefixIcon: undefined,
  suffixIcon: undefined,
})

const emit = defineEmits<{
  (e: 'layout', result: TextLayoutResult): void
  (e: 'measure', result: TextMeasureResult): void
  (e: 'click', event: MouseEvent): void
  (e: 'copy', text: string): void
  (e: 'animation-start'): void
  (e: 'animation-end'): void
  (e: 'typing-complete'): void
  (e: 'mouseenter'): void
  (e: 'mouseleave'): void
}>()

// ==================== Refs ====================

const textRef = ref<HTMLElement | null>(null)
const isTyping = ref(false)
const displayedText = ref('')
const showCursor = ref(false)
const showCopySuccess = ref(false)
const copyTipText = ref('')
const showCopyIcon = ref(false)
const editable = computed(() => false)
const slots = useSlots()

// 逐字波浪：存储原始文本内容
const charWaveText = ref('')

// 逐字波浪：是否启用
const enableCharWave = computed(() => {
  if (loopConfig.value.type === 'char-wave') return true
  if (typeof props.animation === 'string' && props.animation === 'char-wave') return true
  return false
})

// 逐字波浪：分割字符数组
const charWaveChars = computed<string[]>(() => {
  if (!enableCharWave.value) return []
  if (!charWaveText.value) return []
  return charWaveText.value.split('')
})

// ==================== 内置语法高亮 ====================

/**
 * 规范化高亮配置：合并 props.highlight（多种形态）+ props.codeLanguage（便捷指定语言）
 *
 *   props.highlight:
 *     undefined / false / ''  → 不启用（返回 null）
 *     true                    → 启用（默认 javascript）
 *     'typescript'            → 启用，language='typescript'
 *     { language }            → 启用，按配置
 *
 *   props.codeLanguage 与 props.highlight.language 同义，后者优先
 *
 * token 配色完全由 theme 主题组件包按当前激活视觉×主题注入 --ohl-* 变量，
 * 组件层不持有任何主题状态，也不预设 light/dark/auto 等模式。
 */
const highlightResolved = computed<HighlightConfig | null>(() => {
  const h = props.highlight
  if (h === false || h === undefined || h === null || h === '') return null
  if (h === true) {
    return {
      language: props.codeLanguage ?? 'javascript',
    }
  }
  if (typeof h === 'string') {
    return {
      language: (h as HighlightLanguage) ?? props.codeLanguage ?? 'javascript',
    }
  }
  return {
    language: h.language ?? props.codeLanguage ?? 'javascript',
  }
})

/** 是否启用高亮（仅在 tag=pre 时才生效） */
const isHighlighted = computed(() =>
  computedTag.value === 'pre' && highlightResolved.value !== null,
)

/**
 * slot 内的源代码文本缓存
 * 独立成 ref 是为了在 onUpdated 钩子里主动同步,
 * 避免父组件异步更新 slot 内容（如 v-if 条件渲染、异步数据加载）时
 * computed 仅依赖 slots.default() 引用而在某些场景下漏触发
 */
const slotSourceText = ref('')

/** 主动从 slot 重新提取源代码文本 */
function refreshSlotText() {
  if (!isHighlighted.value) {
    slotSourceText.value = ''
    return
  }
  const text = getSlotTextContent()
  // 即便 text 为空也写入,确保 reactive 链路可见
  if (text !== slotSourceText.value) slotSourceText.value = text
}

/**
 * 高亮后的 HTML 字符串
 * - 从 slotSourceText 读取源代码（响应式 ref）
 * - 经过内置 highlight() 处理后生成可安全 v-html 的字符串
 * - 通过 onMounted / onUpdated 钩子保证 slot 异步更新时也能重新高亮
 */
const highlightedHtml = computed(() => {
  if (!isHighlighted.value) return ''
  if (!slotSourceText.value) return ''
  return highlight(slotSourceText.value, highlightResolved.value!)
})

// 初始化 + slot 异步更新 hook
onMounted(() => {
  refreshSlotText()
})
onUpdated(() => {
  // Vue 完成 patch 后重读 slot,保证异步条件渲染、动态数据加载时源文本同步
  refreshSlotText()
})

// 配置变化时主动重读
watch(
  () => [props.highlight, props.codeLanguage, computedTag.value] as const,
  refreshSlotText,
  { immediate: true },
)

// 逐字波浪：延迟初始化文本
function initCharWaveText() {
  if (!enableCharWave.value) return
  if (charWaveText.value) return // 已有内容，跳过

  nextTick(() => {
    const text = textRef.value?.textContent
    if (text) {
      charWaveText.value = text
    } else {
      // 再延迟一次确保 slot 内容渲染完成
      setTimeout(() => {
        const finalText = textRef.value?.textContent
        if (finalText) charWaveText.value = finalText
      }, 50)
    }
  })
}

// 打字机定时器
let typingTimer: ReturnType<typeof setTimeout> | null = null
let cursorTimer: ReturnType<typeof setInterval> | null = null
let copyTimer: ReturnType<typeof setTimeout> | null = null

// ==================== 配置解析 ====================

// 解析 typing 配置
const typingConfig = computed<TypingConfig | null>(() => {
  if (!props.typing) return null
  if (typeof props.typing === 'boolean') {
    return { speed: 80, cursor: true, cursorBlink: true }
  }
  return props.typing as TypingConfig
})

// 解析 loop 配置
const loopConfig = computed<LoopAnimationConfig>(() => {
  if (typeof props.loop === 'string') {
    return { type: props.loop as LoopAnimationType, duration: 1.5 }
  }
  return (props.loop || { type: 'none' }) as LoopAnimationConfig
})

// 解析 hover 配置
const hoverConfig = computed(() => {
  const defaultHover = { type: 'none' as HoverEffectType, duration: 0.25 }
  if (typeof props.hover === 'boolean') return defaultHover
  return { ...defaultHover, ...(props.hover || {}) }
})

// 解析 click 配置
const clickConfig = computed(() => {
  const defaultClick = { type: 'none' as ClickEffectType, duration: 0.3 }
  if (typeof props.click === 'boolean') return defaultClick
  return { ...defaultClick, ...(props.click || {}) }
})

// 解析 copyable 配置
const copyConfig = computed<TextCopyConfig>(() => {
  if (typeof props.copyable === 'boolean') {
    return { enabled: props.copyable, duration: 2000, successText: '复制成功' }
  }
  return { enabled: false, ...(props.copyable || {}) }
})

// 解析 selectable 配置
const selectConfig = computed<TextSelectConfig>(() => {
  if (typeof props.selectable === 'boolean') {
    return { enabled: props.selectable }
  }
  return { enabled: true, ...(props.selectable || {}) }
})

// ==================== 样式驱动（SCSS 单一来源）====================
// 6 严格语义 tony / 6 档字号 / 7 档字重 全部由 cpns/index.scss 中的
// @each 遍历 $o-text-themes / $o-text-sizes / $o-text-weights 自动生成类样式
// JS 不再维护 SIZE/WEIGHT/TONY_COLOR map,避免双重来源造成 inline style 覆盖 SCSS class

const ALIGN_MAP: Record<string, string> = {
  left: 'left',
  center: 'center',
  right: 'right',
  justify: 'justify',
  start: 'start',
  end: 'end',
}

// ==================== 计算属性 ====================

// 字重语义名 → 数字映射(对齐 SCSS 中 $o-text-weights 的数字类名)
const WEIGHT_MAP: Record<string, number> = {
  thin: 100,
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
}

// 计算标签
const computedTag = computed(() => {
  // 优先使用显式的 tag 属性
  if (props.tag) return props.tag

  // 支持简写形式：<o-text h1>, <o-text pre>, <o-text code> 等
  const shortcutTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'strong', 'em', 'code', 'pre']
  for (const t of shortcutTags) {
    if ((props as any)[t]) return t
  }

  // 默认渲染为 p 标签
  return 'p'
})

// 标题标签自带字号(h1-h6 在 SCSS $o-text-heading-sizes 中有专属 font-size)
// 当使用标题标签时跳过通用 size 类,避免 .o-text--md 覆盖标题专属字号
// 注:p/span/code/pre 保留 size 类,让用户可显式覆盖字号
const HEADING_TAGS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])

// 计算类名
const allClasses = computed<string[]>(() => {
  const classes = ['o-text']

  // 标签类型
  if (computedTag.value) {
    classes.push(`o-text--tag-${computedTag.value}`)
  }

  // 色调
  classes.push(`o-text--${props.tony}`)
  // 标题标签(h1-h6)在 SCSS 中有专属字号+字重,跳过通用 size/weight 类避免覆盖
  const isHeading = HEADING_TAGS.has(computedTag.value)
  // pre + highlight 启用时,源代码显示走 token 配色,跳过 size/weight 类
  // （SCSS 中 o-text--pre + o-text--highlighted 已锁定等宽 + 合理字号,不再被通用 size 覆盖）
  if (!isHeading && !isHighlighted.value) {
    classes.push(`o-text--${props.size}`)
  }
  // 标题标签跳过默认 weight(normal=400),保留标签专属字重(h1=700/h2-h3=600/h4-h6=500)
  // 用户显式传非默认 weight 时仍生效(e.g. <o-text h1 weight="bold">)
  const weightNum = WEIGHT_MAP[props.weight] ?? props.weight
  if (!isHighlighted.value && (!isHeading || props.weight !== 'normal')) {
    classes.push(`o-text--weight-${weightNum}`)
  }

  // 省略
  if (props.ellipsis === true) classes.push('o-text--ellipsis')
  else if (typeof props.ellipsis === 'number' || typeof props.rows === 'number') {
    classes.push('o-text--clamp')
  }

  // 等宽
  if (props.monospace) classes.push('o-text--mono')

  // 内置语法高亮（仅 pre + highlight 启用时）
  // 配色完全由 theme 主题组件包按当前激活视觉×主题注入 --ohl-* 变量，
  // 组件层不再推送 hl-light / hl-dark / hl-auto 之类硬编码主题类。
  if (isHighlighted.value) {
    classes.push('o-text--highlighted')
  }

  // 变换
  if (props.uppercase) classes.push('o-text--uppercase')
  else if (props.lowercase) classes.push('o-text--lowercase')
  else if (props.capitalize) classes.push('o-text--capitalize')

  // 渐变文字
  if (props.gradient) classes.push('o-text--gradient')

  // 阴影
  if (props.shadow) classes.push('o-text--shadow')

  // 发光
  if (props.glow) classes.push('o-text--glow')

  // 描边（2026-06 重构：基类 + mode 类组合，避免遗漏样式）
  // 修复 P0：之前只推送 o-text--stroke-${mode}，导致 SCSS 中基类的
  //   paint-order / text-shadow / 默认 -webkit-text-stroke 全部丢失
  if (props.stroke) {
    // 基类永远推送（包含 paint-order + 8 方向锐利 text-shadow + 默认外描边）
    classes.push('o-text--stroke')
    const s = props.stroke as any
    const mode = s.mode ?? 'outline'
    classes.push(`o-text--stroke-${mode}`)
  }

  // 挖空/镂空（2026-06 重新定义：默认 outline 模式为真正的空心字）
  if (props.hollow) {
    const h = props.hollow as any
    const mode = h.mode ?? 'outline'
    classes.push(`o-text--hollow-${mode}`)
    if (h.fillOnHover) classes.push('o-text--hollow-fillable')
  }

  // 高亮标记（2026-06 重构：支持 4 种 mode，默认 line 高亮笔效果）
  if (props.mark) {
    let m: any
    if (typeof props.mark === 'string') {
      m = { color: props.mark, mode: 'line' }
    } else {
      m = props.mark
    }
    const mode = m.mode ?? 'line'
    classes.push(`o-text--mark-${mode}`)
  }

  // 轮廓
  if (props.outline) classes.push('o-text--outline')

  // Hover 效果
  if (hoverConfig.value.type && hoverConfig.value.type !== 'none') {
    classes.push(`o-text--hover-${hoverConfig.value.type}`)
  }

  // 点击效果
  if (clickConfig.value.type && clickConfig.value.type !== 'none') {
    classes.push(`o-text--click-${clickConfig.value.type}`)
  }

  // 动画类型
  const animType = typeof props.animation === 'string' ? props.animation : (props.animation as LoopAnimationConfig).type
  if (animType && animType !== 'none') {
    classes.push(`o-text--anim-${animType}`)
  }

  // 循环动画
  if (loopConfig.value.type && loopConfig.value.type !== 'none') {
    classes.push(`o-text--loop-${loopConfig.value.type}`)
  }

  // 禁用
  if (props.disabled) classes.push('o-text--disabled')

  // 可复制
  if (copyConfig.value.enabled) classes.push('o-text--copyable')

  // 可选择
  if (!selectConfig.value.enabled) classes.push('o-text--no-select')


  if (props.decoration && props.decoration !== 'none') {
    let line: string
    if (typeof props.decoration === 'string') {
      line = props.decoration
    } else {
      line = props.decoration.line ?? 'none'
    }
    if (line === 'underline') {
      classes.push('o-text--underline')
    } else if (line === 'line-through' || line === 'del' || line === 'strike') {
      classes.push('o-text--del')
    } else if (line === 'ins') {
      classes.push('o-text--ins')
    } else if (line === 'overline') {
      classes.push('o-text--overline')
    }
  }

  return classes
})

// 计算样式
const mergedStyles = computed<Record<string, any>>(() => {
  const styles: Record<string, any> = {}
  const tag = computedTag.value
  const isPre = tag === 'pre'
  const isCode = tag === 'code'
  const isSpecialTag = isPre || isCode

  // pre/code 标签：样式全部由 SCSS 类名控制（.o-text--tag-pre / .o-text--tag-code），
  // inline style 只设置用户级覆盖项，避免覆盖 SCSS 中的 !important 样式
  if (isSpecialTag) {
    // 用户自定义样式仍然生效
    if (props.font) styles.fontFamily = props.font
    return styles
  }

  // ── 以下为非 pre/code 标签的样式逻辑 ──

  // 渐变文字（通过 CSS 变量注入）
  if (props.gradient) {
    // gradient 为字符串时直接作为 background-image 使用（如 "linear-gradient(90deg, #667eea, #764ba2)"）
    // gradient 为数组时由 JS 构造渐变（配合 gradientDirection）
    if (Array.isArray(props.gradient)) {
      const colors = (props.gradient as GradientColor[]).map(c => c.color).join(', ')
      const dir = props.gradientDirection
      let gradientAngle = '90deg'
      if (typeof dir === 'number') gradientAngle = `${dir}deg`
      else if (dir === 'horizontal') gradientAngle = '90deg'
      else if (dir === 'vertical') gradientAngle = '180deg'
      else if (dir === 'diagonal') gradientAngle = '135deg'
      else if (dir === 'radial') gradientAngle = 'ellipse'
      styles['--o-text-gradient'] = `linear-gradient(${gradientAngle}, ${colors})`
    } else {
      styles['--o-text-gradient'] = props.gradient as string
    }
  } else {
    // 非渐变模式：颜色由 SCSS class .o-text--{tony} 驱动（cpns/index.scss 中 @each 自动生成）
    // 此处不写 inline color,避免覆盖类样式
  }

  // 字号 / 行高 / 字间距 / 字重 由 SCSS class 驱动：
  //   - .o-text--{size}  →  @each $size 遍历 $o-text-sizes
  //   - .o-text--tag-{tag}  →  标签有专属尺寸（h1~h6 / p / span / strong / em / code / pre）
  //   - .o-text--weight-{weight}  →  @each $weight 遍历 $o-text-weights
  // 此处不写 inline fontSize/lineHeight/letterSpacing/fontWeight,避免覆盖类样式

  // 自定义字体
  if (props.font) {
    styles.fontFamily = props.font
  } else if (props.monospace) {
    styles.fontFamily = "'Fira Code', 'Cascadia Code', 'Consolas', monospace"
  }

  // 文本变换
  if (props.uppercase) styles.textTransform = 'uppercase'
  else if (props.lowercase) styles.textTransform = 'lowercase'
  else if (props.capitalize) styles.textTransform = 'capitalize'

  // 对齐
  styles.textAlign = ALIGN_MAP[props.align] || 'left'

  // 方向
  styles.direction = props.direction

  // 省略
  // 2026-06 修复：display 与 webkit-box-orient 移到 SCSS .o-text--clamp 类（带 !important），
  //   避免被 .o-text--tag-p { display: block !important } 覆盖导致多行截断失效；
  //   -webkit-line-clamp 通过 CSS 变量 --o-text-line-clamp 动态注入。
  if (props.ellipsis === true) {
    styles.overflow = 'hidden'
    styles.textOverflow = 'ellipsis'
    styles.whiteSpace = 'nowrap'
  } else if (typeof props.ellipsis === 'number') {
    styles['--o-text-line-clamp'] = String(props.ellipsis)
  } else if (typeof props.rows === 'number') {
    styles['--o-text-line-clamp'] = String(props.rows)
  }

  // 最大宽度
  if (props.maxWidth !== undefined) {
    styles.maxWidth = typeof props.maxWidth === 'number' ? `${props.maxWidth}px` : props.maxWidth
  }

  // 自定义行高
  if (props.lineHeight) styles.lineHeight = props.lineHeight

  // 字间距
  if (props.letterSpacing !== '') styles.letterSpacing = props.letterSpacing

  // 首行缩进
  if (props.textIndent) styles.textIndent = typeof props.textIndent === 'number' ? `${props.textIndent}px` : props.textIndent

  // 垂直对齐
  styles.verticalAlign = props.verticalAlign

  // 用户选择
  if (props.userSelect !== 'text') {
    styles.userSelect = props.userSelect
    styles.webkitUserSelect = props.userSelect
  }

  // white-space
  if (props.whiteSpace && props.whiteSpace !== 'normal') styles.whiteSpace = props.whiteSpace

  // word-break
  if (props.wordBreak && props.wordBreak !== 'normal') styles.wordBreak = props.wordBreak

  // 装饰线（对象形式参数：color/thickness/offset 使用 CSS 变量驱动 SCSS 类）
  // 与 mark/stroke/hollow 统一：CSS 变量驱动类样式，inline 只传变量不传属性
  if (props.decoration && typeof props.decoration === 'object') {
    const d = props.decoration
    if (d.color) styles['--o-decoration-color'] = d.color
    if (d.thickness !== undefined) {
      styles['--o-decoration-thickness'] = typeof d.thickness === 'number' ? `${d.thickness}px` : d.thickness
    }
    if (d.offset !== undefined) {
      styles['--o-decoration-offset'] = typeof d.offset === 'number' ? `${d.offset}px` : d.offset
    }
  }

  // ==================== 显示效果样式 ====================

  // 文字阴影
  if (props.shadow) {
    const parseShadow = (s: TextShadowConfig | string): string => {
      if (typeof s === 'string') return s
      const x = s.x ?? 0
      const y = s.y ?? 0
      const blur = s.blur ?? 0
      const color = s.color ?? 'rgba(0,0,0,0.3)'
      const xVal = typeof x === 'number' ? `${x}px` : x
      const yVal = typeof y === 'number' ? `${y}px` : y
      const blurVal = typeof blur === 'number' ? `${blur}px` : blur
      return `${xVal} ${yVal} ${blurVal} ${color}`
    }

    if (Array.isArray(props.shadow)) {
      styles.textShadow = (props.shadow as (TextShadowConfig | string)[]).map(parseShadow).join(', ')
    } else {
      styles.textShadow = parseShadow(props.shadow as TextShadowConfig | string)
    }
  }

  // 发光效果
  if (props.glow) {
    const g = props.glow
    const glowColor = g.color ?? '#00d4ff'
    const glowBlur = g.blur ?? 15
    // 多层 shadow 增强发光强度
    styles.textShadow = [
      `0 0 ${glowBlur}px ${glowColor}`,
      `0 0 ${glowBlur * 2}px ${glowColor}80`,
      `0 0 ${glowBlur * 4}px ${glowColor}40`,
    ].join(', ')
    if (props.glow.spread) {
      styles.textShadow += `, 0 0 ${glowBlur * 6}px ${glowColor}20`
    }
  }

  // 文字描边（2026-06 重构：CSS 变量驱动 + paint-order + 锐利 text-shadow）
  if (props.stroke) {
    const s = props.stroke as any
    const strokeColor = s.color ?? 'currentColor'
    const strokeWidth = s.width ?? 2
    const widthVal = typeof strokeWidth === 'number' ? `${strokeWidth}px` : strokeWidth

    // CSS 变量驱动 SCSS 类（核心修复：不再用 inline 覆盖类）
    styles['--o-stroke-color'] = strokeColor
    styles['--o-stroke-width'] = widthVal

    // 深色模式专用颜色
    if (s.darkColor) styles['--o-stroke-color-dark'] = s.darkColor

    // 生成锐利的 text-shadow（8 个方向 + 8 个对角，0px blur）
    // 只在字宽 >= 1px 时生成，避免任意不锐利的边缘
    const pxMatch = String(widthVal).match(/^([\d.]+)/)
    const pxVal = pxMatch ? parseFloat(pxMatch[1]) : 2
    const shadowOffset = Math.max(0.5, pxVal * 0.4)
    const shadows: string[] = []
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4
      const x = (Math.cos(angle) * shadowOffset).toFixed(2)
      const y = (Math.sin(angle) * shadowOffset).toFixed(2)
      shadows.push(`${x}px ${y}px 0 ${strokeColor}`)
    }
    styles['--o-stroke-shadows'] = shadows.join(', ')

    // 双层描边：额外设置外层描边颜色 + 宽度（外层用 -webkit-text-stroke，内层用 text-shadow 模拟）
    if (s.mode === 'double' && Array.isArray(s.layers) && s.layers.length >= 2) {
      const outerLayer = s.layers[0]
      const innerLayer = s.layers[1]
      const outerWidth = typeof outerLayer.width === 'number'
        ? `${outerLayer.width}px` : outerLayer.width
      const innerWidth = typeof innerLayer.width === 'number'
        ? `${innerLayer.width}px` : innerLayer.width
      styles['--o-stroke-color-outer'] = outerLayer.color
      styles['--o-stroke-width-outer'] = outerWidth

      // 内层细描边：生成多层 0px blur text-shadow 形成锐利细描边
      // 通过在文字内侧的方向（负方向）实现
      const innerShadowOffset = parseFloat(String(innerWidth).match(/^([\d.]+)/)?.[1] || '1')
      const innerShadows: string[] = []
      const innerShadowColor = innerLayer.color || strokeColor
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI) / 4
        // 内层描边方向略向内收缩
        const x = (Math.cos(angle) * innerShadowOffset * 0.5).toFixed(2)
        const y = (Math.sin(angle) * innerShadowOffset * 0.5).toFixed(2)
        innerShadows.push(`${x}px ${y}px 0 ${innerShadowColor}`)
      }
      styles['--o-stroke-shadows'] = innerShadows.join(', ')
    }

    // filled=false：文字透明（描边作为空心字轮廓）
    if (s.filled === false) {
      styles.color = 'transparent'
      styles.webkitTextFillColor = 'transparent'
    }
  }

  // 挖空/镂空字（2026-06 重新定义：默认 mode='outline' 真正的空心字）
  if (props.hollow) {
    const h = props.hollow as any
    const mode = h.mode ?? 'outline'

    if (mode === 'outline') {
      // 真正的空心字：外描边 + 透明填充
      const strokeColor = h.color ?? 'currentColor'
      const strokeWidth = h.strokeWidth ?? 1.5
      const widthVal = typeof strokeWidth === 'number' ? `${strokeWidth}px` : strokeWidth
      styles['--o-hollow-stroke-color'] = strokeColor
      styles['--o-hollow-stroke-width'] = widthVal
      if (h.darkColor) styles['--o-hollow-stroke-color-dark'] = h.darkColor
      if (h.fillColor) styles['--o-hollow-fill-color'] = h.fillColor
    } else if (mode === 'blur') {
      // 向后兼容：模糊文字（使用 CSS 变量驱动类）
      const blur = h.blur ?? 4
      styles['--o-hollow-blur'] = `${blur}px`
    } else if (mode === 'glass') {
      // 玻璃态镂空
      const strokeColor = h.color ?? 'currentColor'
      styles['--o-hollow-stroke-color'] = strokeColor
      if (h.backdropColor) styles['--o-hollow-backdrop'] = h.backdropColor
    }
  }

  // 高亮标记（2026-06 重构：CSS 变量驱动 + 4 种模式）
  if (props.mark) {
    let m: any
    if (typeof props.mark === 'string') {
      m = { color: props.mark, mode: 'line' }
    } else {
      m = props.mark
    }
    const mode = m.mode ?? 'line'
    const color = m.color ?? 'rgba(255, 220, 60, 0.6)'

    // CSS 变量驱动 SCSS 类
    styles['--o-mark-color'] = color
    if (m.darkColor) styles['--o-mark-color-dark'] = m.darkColor
    if (m.radius !== undefined) {
      styles['--o-mark-radius'] = typeof m.radius === 'number' ? `${m.radius}px` : m.radius
    }
    if (m.padding) styles['--o-mark-padding'] = m.padding

    // textColor 仍是 inline 覆盖（SCSS 类中不设置文字色，保留主题 tony 颜色控制）
    if (m.textColor) {
      styles.color = m.textColor
      styles.webkitTextFillColor = m.textColor
    }
  }

  // 轮廓文字
  if (props.outline) {
    const o = props.outline
    styles.webkitTextStroke = `${o.width ?? 1}px ${o.color ?? styles.color}`
    styles.textShadow = `1px 1px 0 ${o.color ?? '#000'}`
  }

  // ==================== 交互效果样式 ====================

  // Hover 过渡时间
  if (hoverConfig.value.duration) {
    styles.transition = `all ${hoverConfig.value.duration}s ease`
  }

  // 点击涟漪（需要父元素 position）
  if (clickConfig.value.type === 'ripple') {
    styles.position = 'relative'
    styles.overflow = 'hidden'
  }

  // ==================== 动画样式 ====================

  // 动画延迟
  if (props.animationDelay) {
    styles.animationDelay = typeof props.animationDelay === 'number' ? `${props.animationDelay}s` : props.animationDelay
  }

  // 动画时长
  if (props.animationDuration) {
    styles.animationDuration = typeof props.animationDuration === 'number' ? `${props.animationDuration}s` : props.animationDuration
  } else {
    styles.animationDuration = '0.6s'
  }

  // 打字机效果
  if (typingConfig.value) {
    styles.overflow = 'hidden'
  }

  // 用户自定义 style（外部传入的 :style 合并到内联样式中，props.style 拥有最高优先级，
  // 覆盖上面所有由 props 推导的样式项）。这是 o-text 公共 API（TextProps.style），
  // 之前未在 mergedStyles 中被消费，导致外部传入的 style（如 masonry 演示中的
  // :style="{ minHeight: '200px' }"）被静默丢弃。
  if (props.style) {
    Object.assign(styles, props.style)
  }

  return styles
})

// ==================== 前缀/后缀图标样式 ====================

const prefixIconStyle = computed<Record<string, any>>(() => {
  if (!props.prefixIcon) return {}
  const spacing = props.prefixIcon.spacing ?? 4
  return { marginRight: `${spacing}px` }
})

const suffixIconStyle = computed<Record<string, any>>(() => {
  if (!props.suffixIcon) return {}
  const spacing = props.suffixIcon.spacing ?? 4
  return { marginLeft: `${spacing}px` }
})

// ==================== 事件处理 ====================

function handleClick(e: MouseEvent) {
  emit('click', e)

  // 涟漪效果
  if (clickConfig.value.type === 'ripple') {
    createRipple(e)
  }

  // 复制功能
  if (copyConfig.value.enabled && !props.disabled) {
    copyText()
  }
}

function handleMouseEnter() {
  emit('mouseenter')

  // 可复制 hover 时显示复制图标（替代 emoji）
  if (copyConfig.value.enabled && !props.disabled) {
    showCopyIcon.value = true
  }

  // Hover 效果：颜色变化
  if (hoverConfig.value.type === 'color' && hoverConfig.value.color && textRef.value) {
    textRef.value.dataset._origColor = textRef.value.style.color
    textRef.value.style.color = hoverConfig.value.color
  }

  // Hover 效果：高亮背景
  if (hoverConfig.value.type === 'highlight' && hoverConfig.value.backgroundColor && textRef.value) {
    textRef.value.style.backgroundColor = hoverConfig.value.backgroundColor
  }

  // Hover 效果：透明度
  if (hoverConfig.value.type === 'opacity' && textRef.value) {
    textRef.value.style.opacity = '0.7'
  }
}

function handleMouseLeave() {
  emit('mouseleave')

  // 隐藏复制图标
  showCopyIcon.value = false

  // 恢复颜色
  if (hoverConfig.value.type === 'color' && textRef.value) {
    const orig = textRef.value.dataset._origColor
    if (orig) textRef.value.style.color = orig
  }

  // 恢复背景
  if (hoverConfig.value.type === 'highlight' && textRef.value) {
    textRef.value.style.backgroundColor = ''
  }

  // 恢复透明度
  if (hoverConfig.value.type === 'opacity' && textRef.value) {
    textRef.value.style.opacity = '1'
  }
}

// 涟漪效果
function createRipple(event: MouseEvent) {
  if (!textRef.value) return

  const ripple = document.createElement('span')
  ripple.className = 'o-text__ripple'

  const rect = textRef.value.getBoundingClientRect()
  const size = Math.max(rect.width, rect.height)
  const x = event.clientX - rect.left - size / 2
  const y = event.clientY - rect.top - size / 2

  ripple.style.cssText = `
    position: absolute;
    width: ${size}px;
    height: ${size}px;
    left: ${x}px;
    top: ${y}px;
    background: ${clickConfig.value.color || 'rgba(255,255,255,0.3)'};
    border-radius: 50%;
    transform: scale(0);
    animation: o-text-ripple ${clickConfig.value.duration || 0.4}s ease-out forwards;
    pointer-events: none;
  `

  textRef.value.appendChild(ripple)
  setTimeout(() => ripple.remove(), (clickConfig.value.duration || 0.4) * 1000)
}

// 复制文本
async function copyText() {
  const text = textRef.value?.textContent || ''
  try {
    await navigator.clipboard.writeText(text)
    emit('copy', text)

    // 显示成功提示
    copyTipText.value = copyConfig.value.successText || '复制成功'
    showCopySuccess.value = true

    if (copyTimer) clearTimeout(copyTimer)
    copyTimer = setTimeout(() => {
      showCopySuccess.value = false
    }, copyConfig.value.duration || 2000)
  } catch {
    console.warn('[o-text] 复制失败')
  }
}

// ==================== 打字机效果 ====================

// 原始文本（从 slot VNode 提取）
let typingOriginalText = ''
// 当前打字机运行 ID（用于取消旧任务）
let typingRunId = 0

// 从 slot VNode 中提取纯文本（避免 DOM textContent 被打字内容污染）
function getSlotTextContent(): string {
  if (!slots.default) return ''
  const vnodes = slots.default()

  function extractText(vnode: any): string {
    if (!vnode) return ''
    if (typeof vnode === 'string') return vnode
    if (typeof vnode.text === 'string') return vnode.text
    if (typeof vnode.children === 'string') return vnode.children
    if (Array.isArray(vnode.children)) {
      return vnode.children.map((c: any) => extractText(c)).join('')
    }
    return ''
  }

  let text = ''
  for (const vnode of vnodes) {
    text += extractText(vnode)
  }
  return text.trim()
}

// 清理所有打字机定时器
function clearTypingTimers() {
  if (typingTimer) { clearTimeout(typingTimer); typingTimer = null }
  if (cursorTimer) { clearInterval(cursorTimer); cursorTimer = null }
}

// 启动光标闪烁
function startCursorBlink() {
  if (cursorTimer) { clearInterval(cursorTimer); cursorTimer = null }
  if (typingConfig.value?.cursorBlink !== false) {
    cursorTimer = setInterval(() => {
      showCursor.value = !showCursor.value
    }, 530)
  }
}

function startTyping() {
  if (!typingConfig.value) return

  // 流式模式：不自动打字，等外部调用
  if (typingConfig.value.streaming) return

  // 从 slot VNode 读取原始文本
  const fullText = getSlotTextContent()
  if (!fullText) return

  // 取消之前的运行
  typingRunId++
  const currentRunId = typingRunId

  typingOriginalText = fullText
  clearTypingTimers()

  isTyping.value = true
  displayedText.value = ''
  showCursor.value = typingConfig.value.cursor || false

  if (showCursor.value) startCursorBlink()

  const speed = typingConfig.value.speed || 60
  const startDelay = typingConfig.value.startDelay || 0
  let index = 0

  setTimeout(() => {
    function typeNext() {
      // 被新任务取消
      if (currentRunId !== typingRunId) return
      if (!isTyping.value) return

      if (index < fullText.length) {
        displayedText.value = fullText.substring(0, index + 1)
        index++
        typingTimer = setTimeout(typeNext, speed)
      } else {
        // 打字完成
        onTypingComplete(currentRunId)
      }
    }
    typeNext()
  }, startDelay)
}

// 打字完成后的处理
function onTypingComplete(runId: number) {
  if (runId !== typingRunId) return

  if (!typingConfig.value?.loop) {
    // 非循环：停止
    clearTypingTimers()
    showCursor.value = false
    isTyping.value = false
    emit('typing-complete')
  } else {
    // 循环模式
    const loopDelay = typingConfig.value.loopDelay || 3000
    const keepMode = typingConfig.value.keepMode || 'keep'

    typingTimer = setTimeout(() => {
      if (runId !== typingRunId) return
      if (!typingConfig.value?.loop) return

      if (keepMode === 'backspace') {
        startBackspace(runId)
      } else {
        // 清空后重新打字
        displayedText.value = ''
        let index = 0
        const speed = typingConfig.value.speed || 60

        function typeNext() {
          if (runId !== typingRunId) return
          if (!isTyping.value) return

          if (index < typingOriginalText.length) {
            displayedText.value = typingOriginalText.substring(0, index + 1)
            index++
            typingTimer = setTimeout(typeNext, speed)
          } else {
            onTypingComplete(runId)
          }
        }
        typeNext()
      }
    }, loopDelay)
  }
}

// 退格删除效果
function startBackspace(runId: number) {
  if (!typingOriginalText) return

  const fullText = typingOriginalText
  let index = fullText.length
  const speed = (typingConfig.value?.speed || 60) / 2

  function removeNext() {
    if (runId !== typingRunId) return
    if (!isTyping.value) return

    if (index > 0) {
      displayedText.value = fullText.substring(0, index - 1)
      index--
      typingTimer = setTimeout(removeNext, speed)
    } else {
      // 删除完毕，延迟后重新打字
      typingTimer = setTimeout(() => {
        if (runId !== typingRunId) return
        if (!typingConfig.value?.loop) return

        displayedText.value = ''
        let newIndex = 0
        const typeSpeed = typingConfig.value?.speed || 60

        function typeNext() {
          if (runId !== typingRunId) return
          if (!isTyping.value) return

          if (newIndex < fullText.length) {
            displayedText.value = fullText.substring(0, newIndex + 1)
            newIndex++
            typingTimer = setTimeout(typeNext, typeSpeed)
          } else {
            onTypingComplete(runId)
          }
        }
        typeNext()
      }, 500)
    }
  }

  removeNext()
}

// ==================== 布局计算 ====================

const preparedText = ref<PreparedTextWithSegments | null>(null)

function performLayout() {
  if (!textRef.value || !props.precisionLayout) return

  const text = textRef.value.textContent || ''
  if (!text) return

  const maxWidth = props.maxWidth as number || textRef.value.parentElement?.clientWidth || 800

  preparedText.value = prepareWithSegments(text, mergedStyles.value.fontFamily || '', {
    whiteSpace: props.whiteSpace,
    wordBreak: props.wordBreak,
  })

  const layoutResult = layoutWithLines(preparedText.value, maxWidth, Number(mergedStyles.value.lineHeight) || 1.5)

  emit('layout', {
    lineCount: layoutResult.lineCount,
    height: layoutResult.height,
    lines: layoutResult.lines.map((line: LayoutLine) => ({
      text: line.text,
      width: line.width,
      start: line.start,
      end: line.end,
    })),
  })
}

function measure(): TextMeasureResult {
  if (!textRef.value) {
    return { naturalWidth: 0, lineCount: 0, height: 0, maxLineWidth: 0 }
  }

  const text = textRef.value.textContent || ''
  const maxWidth = props.maxWidth as number || 800

  const prepared = prepareWithSegments(text, mergedStyles.value.fontFamily || '', {
    whiteSpace: props.whiteSpace,
    wordBreak: props.wordBreak,
  })

  const naturalWidth = measureNaturalWidth(prepared)
  const stats = measureLineStats(prepared, maxWidth)

  const result: TextMeasureResult = {
    naturalWidth,
    lineCount: stats.lineCount,
    height: stats.lineCount * Number(mergedStyles.value.lineHeight || 1.5),
    maxLineWidth: stats.maxLineWidth,
  }

  emit('measure', result)
  return result
}

// ==================== 生命周期 ====================

onMounted(() => {
  performLayout()

  // 逐字波浪：延迟初始化文本
  initCharWaveText()

  // 打字机：流式模式不自动启动
  if (typingConfig.value && !typingConfig.value.streaming) {
    nextTick(() => startTyping())
  }
})

onUnmounted(() => {
  // 清理定时器
  if (typingTimer) clearTimeout(typingTimer)
  if (cursorTimer) clearInterval(cursorTimer)
  if (copyTimer) clearTimeout(copyTimer)
})

// 监听内容变化
watch(
  () => textRef.value?.textContent,
  (newText) => {
    // 更新逐字波浪文本
    if (enableCharWave.value && newText) {
      charWaveText.value = newText
    }
    // 打字机模式：不再基于 textContent 重触发（避免循环）
  },
)

watch(
  () => [props.typing, props.loop, props.maxWidth, props.size],
  () => {
    nextTick(() => {
      if (typingConfig.value && textRef.value) startTyping()
    })
  },
)

// ==================== 暴露方法 ====================

defineExpose({
  measure,
  performLayout,
  copyText: () => copyText(),

  /**
   * 启动打字机（从 slot 文本）
   */
  startTyping: () => startTyping(),

  /**
   * 停止打字机，显示完整文本
   */
  stopTyping: () => {
    typingRunId++ // 取消所有进行中的任务
    clearTypingTimers()
    isTyping.value = false
    showCursor.value = false
    if (typingOriginalText) {
      displayedText.value = typingOriginalText
    }
  },

  /**
   * 重置打字机（清空内容，回到初始状态）
   */
  resetTyping: () => {
    typingRunId++
    clearTypingTimers()
    isTyping.value = false
    showCursor.value = false
    displayedText.value = ''
    typingOriginalText = ''
  },

  /**
   * AI 流式回复：追加新内容（chunk 模式）
   * 每次调用追加一小块文本，适合 SSE 逐块推送
   */
  appendStreamingChunk: (chunk: string) => {
    if (!chunk) return

    if (!isTyping.value) {
      isTyping.value = true
      showCursor.value = typingConfig.value?.cursor ?? true
      startCursorBlink()
    }

    displayedText.value += chunk
    typingOriginalText = displayedText.value
  },

  /**
   * AI 流式回复：设置完整文本（replace 模式）
   * 每次调用替换为累积文本，适合增量替换
   */
  updateStreamingText: (text: string) => {
    if (text === undefined) return

    if (!isTyping.value) {
      isTyping.value = true
      showCursor.value = typingConfig.value?.cursor ?? true
      startCursorBlink()
    }

    displayedText.value = text
    typingOriginalText = text
  },

  /**
   * 完成流式输出（隐藏光标，触发事件）
   */
  finishStreaming: () => {
    clearTypingTimers()
    showCursor.value = false
    isTyping.value = false
    emit('typing-complete')
  },
})
</script>

<style lang="scss">
@use './cpns/index.scss';
</style>