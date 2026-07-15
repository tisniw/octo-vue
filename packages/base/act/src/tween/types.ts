/**
 * tween 模块类型定义 (0.0.5 §5.1 + §5.7 + §5.9 + §5.10)
 */
import type { TweenId } from '../types.js'
import type { PlayState } from '../timeline/types.js'
import type { EasingFn } from '../easing/types.js'

// ============================================================
// TweenTarget · §5.1 + §5.7.2
// ============================================================

/** CSS Variable 键名(--xxx) */
export type CssVarPrefix = `--${string}`

/** 普通对象 target(Loose 表示允许扩展字段) */
export type TweenObjectTarget = Record<string, number | string>

/** TweenTarget 形态 */
export type TweenTarget =
  | HTMLElement
  | SVGElement
  | TweenObjectTarget
  | { readonly kind: 'css-var'; readonly element: HTMLElement; readonly varName: CssVarPrefix }

/** TweenTarget 解析后的内部表示(§5.3) */
export type TweenTargetResolved =
  | { readonly kind: 'dom'; readonly element: HTMLElement }
  | { readonly kind: 'object'; readonly obj: TweenObjectTarget }

// ============================================================
// TweenOptions / TweenHandle · §5.1 + §5.9.2
// ============================================================

/** 单 tween 配置 */
export interface TweenOptions {
  /** 持续时间 ms,默认 1000 */
  readonly duration?: number
  /** 延迟 ms,默认 0 */
  readonly delay?: number
  /** 缓动函数(函数 / 字符串),默认 easeInOutQuad */
  readonly ease?: EasingFn | string
  readonly onUpdate?: (progress: number) => void
  readonly onComplete?: () => void
  readonly onStart?: () => void
}

/** Stagger 配置 */
export interface StaggerOptions extends TweenOptions {
  /** stagger 间隔 ms,默认 50 */
  readonly stagger?: number
  /** 起始位置 */
  readonly from?: 'start' | 'end' | 'center' | number
  /** 网格布局 */
  readonly grid?: { readonly rows: number; readonly cols: number }
}

/** Tween 句柄 */
export interface TweenHandle {
  readonly id: TweenId
  state: PlayState
  readonly kind: 'tween'
  /** 启动(从 idle/finished 启动;已 playing 时 no-op) */
  play(): TweenHandle
  /** 暂停 */
  pause(): TweenHandle
  /** 恢复 */
  resume(): TweenHandle
  /** 跳转 progress ∈ [0, 1] */
  seek(progress: number): TweenHandle
  /** 反向(交换 from / to) */
  reverse(): TweenHandle
  /** 销毁 */
  kill(): void
}

/** tween 模块 kind 常量 */
export const TWEEN_KIND = 'tween' as const

// ============================================================
// Transform 组件 · §5.9.3
// ============================================================

export interface TransformParts {
  x?: number
  y?: number
  z?: number
  scale?: number
  scaleX?: number
  scaleY?: number
  scaleZ?: number
  rotate?: number
  rotateX?: number
  rotateY?: number
  rotateZ?: number
  skewX?: number
  skewY?: number
  origin?: string
  perspective?: number
}

// ============================================================
// SVG 属性 · §5.9.4
// ============================================================

export type SvgAttrKind = 'numeric' | 'color' | 'path' | 'points' | null

// ============================================================
// Path · §5.9.5
// ============================================================

export interface PathCommand {
  cmd: string
  x: number
  y: number
  ctrl1X?: number
  ctrl1Y?: number
  ctrl2X?: number
  ctrl2Y?: number
}

// ============================================================
// Morph · §5.10.4
// ============================================================

export interface MorphVertex {
  x: number
  y: number
}

export interface NormalizedSegment {
  x: number
  y: number
  c1x: number
  c1y: number
  c2x: number
  c2y: number
}

// ============================================================
// MotionPath · §5.10.2
// ============================================================

export interface MotionPathOptions extends Omit<TweenOptions, 'onUpdate'> {
  /** 路径(SVG path 字符串或预解析 PathCommand[]) */
  readonly path: string | PathCommand[]
  /** 是否自动旋转朝向运动方向 */
  readonly autoRotate?: boolean | number
  /** 起点归一化 0-1 */
  readonly start?: number
  /** 终点归一化 0-1 */
  readonly end?: number
  readonly onUpdate?: (point: { x: number; y: number; angle: number }) => void
}

// ============================================================
// ViewTimeline · §5.10.3
// ============================================================

export interface ViewTimelineOptions {
  readonly target: HTMLElement
  readonly axis?: 'block' | 'inline'
}

export interface ViewTimelineProgress {
  readonly progress: number
  readonly isActive: boolean
}

export interface ViewTimelineHandle {
  readonly id: string
  pause(): void
  resume(): void
  getProgress(): ViewTimelineProgress
  destroy(): void
  readonly onProgress: (listener: (p: ViewTimelineProgress) => void) => () => void
}

// ============================================================
// 3D 分层 · §5.10.5
// ============================================================

export interface Layer3DOptions {
  readonly parent: HTMLElement
  readonly perspective?: number
  readonly preserve3D?: boolean
  readonly backfaceHidden?: boolean
}

// ============================================================
// 解析中间表示 · §5.7.5
// ============================================================

export type CssValueParsed =
  | { readonly kind: 'number'; readonly number: number; readonly raw: string }
  | { readonly kind: 'color'; readonly color: { r: number; g: number; b: number; a: number }; readonly raw: string }
  | { readonly kind: 'string'; readonly raw: string }

// ============================================================
// 内部辅助 · §3.5.7 嵌套继承时复用
// ============================================================

/** 嵌套判定用 helper — 标记 tween 类型 */
export function isTweenHandle(item: unknown): item is TweenHandle {
  if (!item || typeof item !== 'object') return false
  return (item as { kind?: string }).kind === TWEEN_KIND
}