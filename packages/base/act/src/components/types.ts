/**
 * components 模块类型定义 (0.0.7 §3-§5)
 */
import type { Adapter } from '../engine-core/adapter/_adapter.js'
import type { FrameClockOptions } from '../engine-core/engines/FrameClock.js'
import type { AdapterId } from '../types.js'
import type { ScrollOptions } from '../engine-core/engines/ScrollDriver.js'

// ============================================================
// AnimationHost(0.0.7 §3)
// ============================================================

export interface AnimationHostProps {
  /** 自定义 Clock 选项 */
  readonly clockOptions?: FrameClockOptions
  /** 自定义 Driver 选项 */
  readonly driverOptions?: {
    readonly clock?: FrameClockOptions
    readonly engine?: Adapter | null
  }
  /** 是否在 SSR 时跳过初始化(默认 true) */
  readonly ssrSafe?: boolean
}

// ============================================================
// PhysicsLayer(0.0.7 §4)
// ============================================================

export interface PhysicsLayerProps {
  /** 物理引擎 adapter ID(cannon / matter 等) */
  readonly engine: AdapterId
  /** 重力设置 */
  readonly gravity?: { readonly x: number; readonly y: number; readonly z?: number }
  /** 时间步长(默认 1/60) */
  readonly timeStep?: number
  /** viewport 边界 */
  readonly bounds?: {
    readonly x: number
    readonly y: number
    readonly width: number
    readonly height: number
  }
}

// ============================================================
// ScrollScene(0.0.7 §5)
// ============================================================

export interface ScrollSceneProps {
  /** 滚动选项 */
  readonly scrollOptions?: ScrollOptions
  /** scrub 模式:进度拖动(true 或平滑秒数) */
  readonly scrub?: boolean | number
  /** 进入视口时播放一次 */
  readonly playOnEnter?: boolean
  /** 视口阈值 */
  readonly inViewThreshold?: number
}

// ============================================================
// 模块级常量
// ============================================================

/** 注入键:Driver(由 AnimationHost 提供) */
export const ACT_DRIVER_KEY = 'act:driver' as const

/** 注入键:PhysicsWorld(由 PhysicsLayer 提供) */
export const ACT_PHYSICS_WORLD_KEY = 'act:physics-world' as const