/**
 * engine-core/base 共享类型 (0.0.1)
 */
import type { EngineTarget, PerfTier, FallbackReason } from '../../types.js'

/** 插值函数 */
export type InterpolationFn<T> = (t: number) => T

/** 可插值类型 */
export type Interpolatable = number | string

/** 关键帧 */
export interface Keyframe<T> {
  /** 时间偏移 (0-1 归一化) */
  readonly offset: number
  /** 该帧值 */
  readonly value: T
  /** 该帧缓动 (可选,默认线性) */
  readonly easing?: (t: number) => number
}

/** 关键帧配置 */
export interface KeyframesConfig<T> {
  readonly frames: Keyframe<T>[]
  readonly interpolate?: (a: T, b: T) => InterpolationFn<T>
}

/** scheduler 模式 */
export type SchedulerMode = 'raf' | 'manual'

/** scheduler 配置 */
export interface SchedulerOptions {
  readonly mode?: SchedulerMode
  readonly initialDelta?: number
  readonly maxDelta?: number
}

/** scheduler 接口 (Driver 内部使用) */
export interface Scheduler {
  /** 注册 tick 回调 */
  readonly subscribe: (cb: (delta: number, time: number) => void) => () => void
  /** 启动 */
  readonly start: () => void
  /** 停止 */
  readonly stop: () => void
  /** 是否运行中 */
  readonly isRunning: () => boolean
  /** 当前累计帧数 */
  readonly getFrameCount: () => number
  /** 手动触发一帧 (仅 manual 模式) */
  readonly tickManual?: (delta: number, time?: number) => void
}

/** 帧回调 */
export type FrameListener = (delta: number, time: number) => void

/** 弹簧规范 (0.0.1 §6) */
export interface SpringSpec {
  readonly stiffness: number
  readonly damping: number
  readonly mass?: number
  readonly restSpeed?: number
  readonly restDelta?: number
}

/** 弹簧积分结果 */
export interface SpringFrameResult {
  readonly value: number
  readonly velocity: number
}

/** EnvSnapshot (引擎层,封装 platform.detect) */
export interface EnvSnapshot {
  readonly isBrowser: boolean
  readonly isSSR: boolean
  readonly isReducedMotion: boolean
  readonly isTouch: boolean
  readonly perfTier: PerfTier
  readonly engineTarget: EngineTarget
  readonly timestamp: number

  // 0.0.9 扩展 5 字段
  readonly platform: 'web' | 'wechat' | 'dingtalk' | 'work-wechat' | 'weapp' | 'unknown'
  readonly isMobile: boolean
  readonly isRetina: boolean
  readonly isLandscape: boolean
  readonly connection:
    | 'slow-2g'
    | '2g'
    | '3g'
    | '4g'
    | '5g'
    | 'unknown'
    | 'offline'
}
