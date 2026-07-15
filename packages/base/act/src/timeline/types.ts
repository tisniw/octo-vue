/**
 * timeline 模块类型定义 (0.0.5 §3.1 + §3.5)
 */
import type { TimelineId } from '../types.js'

// ============================================================
// 播放状态
// ============================================================

/** 时间线播放状态机 */
export type PlayState = 'idle' | 'playing' | 'paused' | 'reversed' | 'finished'

/** 播放方向 */
export type PlayDirection = 'forward' | 'backward'

/** 事件类型 */
export type TimelineEventType =
  | 'start'
  | 'complete'
  | 'update'
  | 'repeat'
  | 'reverse'
  | 'pause'
  | 'resume'
  | 'seek'
  | 'timeScale'
  | 'yoyo'
  | 'duration'
  | 'label'

// ============================================================
// 事件载荷(0.0.5 §3.5.8 增量)
// ============================================================

/** 通用更新事件 */
export interface TimelineUpdateEvent {
  readonly type: 'update'
  readonly time: number
  readonly progress: number
}

/** 完成事件 */
export interface TimelineCompleteEvent {
  readonly type: 'complete'
  readonly time: number
  readonly progress: number
}

/** 跳转事件 */
export interface TimelineSeekEvent {
  readonly type: 'seek'
  readonly time: number
  readonly progress: number
}

/** 倍速事件 */
export interface TimelineTimeScaleEvent {
  readonly type: 'timeScale'
  readonly time: number
  readonly progress: number
  readonly scale: number
}

/** Yoyo 事件 */
export interface TimelineYoyoEvent {
  readonly type: 'yoyo'
  readonly time: number
  readonly progress: number
  readonly direction: PlayDirection
  readonly count: number
}

/** 重复事件 */
export interface TimelineRepeatEvent {
  readonly type: 'repeat'
  readonly time: number
  readonly progress: number
  readonly count: number
}

/** duration setter 事件 */
export interface TimelineDurationEvent {
  readonly type: 'duration'
  readonly time: number
  readonly progress: number
  readonly duration: number
}

/** 标签事件 */
export interface TimelineLabelEvent {
  readonly type: 'label'
  readonly time: number
  readonly progress: number
  readonly label: TimelineLabel
}

/** 反向播放事件 */
export interface TimelineReverseEvent {
  readonly type: 'reverse'
  readonly time: number
  readonly progress: number
}

/** 暂停/恢复/开始事件 */
export interface TimelineSimpleEvent {
  readonly type: 'start' | 'pause' | 'resume'
  readonly time: number
  readonly progress: number
}

/** 所有事件的联合 */
export type TimelineEvent =
  | TimelineUpdateEvent
  | TimelineCompleteEvent
  | TimelineSeekEvent
  | TimelineTimeScaleEvent
  | TimelineYoyoEvent
  | TimelineRepeatEvent
  | TimelineDurationEvent
  | TimelineLabelEvent
  | TimelineReverseEvent
  | TimelineSimpleEvent

/** 事件监听器 */
export type TimelineListener = (event: TimelineEvent) => void

// ============================================================
// 配置(0.0.5 §3.1 + §3.5.4)
// ============================================================

/** 时间线配置 */
export interface TimelineOptions {
  /** 默认缓动(语义提示,业务可读) */
  readonly ease?: unknown
  /** 是否循环 */
  readonly repeat?: number | 'infinite'
  /** 重复间隔(ms) */
  readonly repeatDelay?: number
  /** 延迟启动 */
  readonly delay?: number
  /** 是否 yoyo(正向反向交替) */
  readonly yoyo?: boolean
  /** Driver(默认 getGlobalDriver()) */
  readonly driver?: unknown
}

// ============================================================
// 标签(0.0.5 §3.5.2)
// ============================================================

/** 时间线标签 */
export interface TimelineLabel {
  readonly name: string
  readonly time: number
}

/** 子项插入位置:number = ms,string = label 名 */
export type TimelinePosition = number | string

// ============================================================
// 子项(0.0.5 §3.5.6)
// ============================================================

/** 子项结构(嵌套类型用 `unknown` 避免循环导入) */
export interface TimelineItem {
  readonly id: string
  readonly item: unknown
  readonly insertAt: number
  readonly tick?: (time: number) => void
}

// ============================================================
// 公开 Timeline 接口(0.0.5 §3.1 + §3.5)
// ============================================================

/** Timeline 公开接口 */
export interface Timeline {
  readonly id: TimelineId
  readonly state: PlayState
  readonly currentTime: number
  /** 设置 / 读取总时长 */
  duration(value?: number): number | Timeline
  /** 读取 / 设置进度(0-1) */
  progress(): number
  progress(value: number): Timeline
  /** 时间跳转(ms) */
  time(time: number): Timeline
  readonly childCount: number
  /** 添加子项(tween / timeline / label) */
  add<T>(item: T, position?: TimelinePosition): Timeline
  /** 播放 */
  play(from?: number): Timeline
  /** 暂停 */
  pause(): Timeline
  /** 恢复 */
  resume(): Timeline
  /** 跳转到指定时间(ms) */
  seek(time: number): Timeline
  /** 反向播放 */
  reverse(from?: number): Timeline
  /** 倍速 */
  timeScale(scale: number): Timeline
  /** 标签管理 */
  addLabel(name: string, position?: number): Timeline
  getLabel(name: string): TimelineLabel | undefined
  seekLabel(name: string): Timeline
  /** 子项查询 */
  getById(id: string): { item: TimelineItem; position: number } | undefined
  getChildren(): readonly TimelineItem[]
  getChildrenAfter(time: number): TimelineItem[]
  /** 事件订阅 */
  on(type: TimelineEventType, listener: TimelineListener): () => void
  /** 销毁 */
  kill(): void
}

/** 模块级别 kind 标记(§3.5.7 嵌套判定用) */
export const TIMELINE_KIND = 'timeline' as const