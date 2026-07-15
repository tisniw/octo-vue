/**
 * compose 模块类型定义 (0.0.5 §6.3)
 *
 * 编排层公共类型:ComposeTarget / Compose / ComposeOptions 等
 * 使用 act 真实 TweenHandle / Timeline 类型,避免循环依赖
 */
import type { Driver } from '../engine-core/engines/Driver.js'
import type { TweenHandle } from '../tween/types.js'
import type { Timeline } from '../timeline/types.js'

// ============================================================
// 节点目标(§6.3) — 真实类型
// ============================================================

/**
 * 编排节点
 * - TweenHandle:act 标准 tween 句柄(可来自 tween/fromTo 或 adapter.createTween)
 * - Timeline:act 标准 timeline(可来自 createTimeline 或 adapter.createTimeline)
 * - () => void:同步函数(立即执行,等价 set)
 * - { kind: 'call'; fn }:显式 call 节点(语义同函数)
 */
export type ComposeTarget =
  | TweenHandle
  | Timeline
  | (() => void)
  | { readonly kind: 'call'; readonly fn: () => void }

/** 内部对齐接口 — 任意目标规整为 { run, cancel } */
export interface Runnable {
  readonly run: () => void
  readonly cancel: () => void
  /** 完成回调(同步函数为 undefined) */
  onComplete?: () => void
  /** 原始 target 类型(用于 cast-free 检查) */
  readonly target?: ComposeTarget
}

// ============================================================
// 编排配置(§6.3)
// ============================================================

/** 通用编排配置 */
export interface ComposeOptions {
  /** 整体起始延迟 ms */
  readonly delay?: number
  /** 单一 Driver(默认全局) */
  readonly driver?: Driver
  /** 整体 yoyo */
  readonly yoyo?: boolean
  /** 整体 repeat */
  readonly repeat?: number | 'infinite'
  /** 重复间隔 ms */
  readonly repeatDelay?: number
}

// ============================================================
// Compose 句柄(§6.3)
// ============================================================

export type ComposeEventType = 'complete' | 'progress'

export interface Compose {
  readonly id: string
  /** 启动 */
  start(): Compose
  /** 暂停 */
  pause(): Compose
  /** 恢复 */
  resume(): Compose
  /** 销毁 */
  kill(): void
  /** 事件订阅 */
  on(type: ComposeEventType, listener: (...args: unknown[]) => void): () => void
}

// ============================================================
// Stagger 配置(§6.6)
// ============================================================

export interface StaggerConfig extends ComposeOptions {
  /** 错开间隔 ms,默认 50 */
  readonly interval?: number
  /** 起始模式 */
  readonly from?: 'start' | 'end' | 'center' | number
  /** 网格布局 */
  readonly grid?: { readonly rows: number; readonly cols: number }
}

// ============================================================
// ScrollDriven 配置(§6.7)
// ============================================================

export type ScrollDrivenAxis = 'block' | 'inline'

/** 触发边界:元素 / 像素 / vh / 百分比 */
export type ScrollBoundary = HTMLElement | number | `${number}vh` | `${number}%`

export interface ScrollDrivenOptions extends ComposeOptions {
  /** 触发起始位置 */
  readonly start?: ScrollBoundary
  /** 触发结束位置 */
  readonly end?: ScrollBoundary
  /** 轴向 */
  readonly axis?: ScrollDrivenAxis
  /** scrub:false = 单次播放(进入视口启动);true = 实时驱动 */
  readonly scrub?: boolean | number
  /** 是否在视口外也继续 */
  readonly once?: boolean
}

/** 解析后的边界内部表示 */
export interface ScrollBoundaryResolved {
  readonly element?: HTMLElement
  readonly offsetPx: number
}

// ============================================================
// 辅助判定(使用真实类型,不用 unknown cast)
// ============================================================

/** TweenHandle / Timeline 判定(duck typing on real shape) */
export function isTweenOrTimeline(t: unknown): t is TweenHandle | Timeline {
  if (!t || typeof t !== 'object') return false
  const obj = t as Record<string, unknown>
  if (typeof obj['play'] !== 'function') return false
  if (typeof obj['kill'] !== 'function') return false
  // TweenHandle 有 kind === 'tween';Timeline 有 kind === 'timeline'
  return obj['kind'] === 'tween' || obj['kind'] === 'timeline'
}

/** call 节点判定 */
export function isCallTarget(t: ComposeTarget): t is { kind: 'call'; fn: () => void } {
  if (!t || typeof t !== 'object') return false
  return (t as { kind?: string }).kind === 'call'
}

/** 函数节点判定 */
export function isFnTarget(t: ComposeTarget): t is () => void {
  return typeof t === 'function'
}

/** TweenHandle 判定(严格) */
export function isTweenHandle(t: unknown): t is TweenHandle {
  if (!t || typeof t !== 'object') return false
  return (t as { kind?: string }).kind === 'tween'
}

/** Timeline 判定(严格) */
export function isTimelineHandle(t: unknown): t is Timeline {
  if (!t || typeof t !== 'object') return false
  return (t as { kind?: string }).kind === 'timeline'
}