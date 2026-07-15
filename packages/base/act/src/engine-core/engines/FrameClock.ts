/**
 * engine-core/engines · FrameClock 帧时钟 (0.0.4 §3)
 *
 * 包装底层 scheduler,维护全局时间戳状态 (lastTime / frameCount)
 * `globalClock` 单例 — 多个 Driver 共享同一个 scheduler
 */
import { createScheduler } from '../base/index.js'
import type { FrameListener, Scheduler } from '../base/types.js'

/** FrameClock 配置 */
export interface FrameClockOptions {
  /** 'raf' 默认 | 'manual' 单元测试 */
  readonly mode?: 'raf' | 'manual'
  /** 初始 delta (ms, 默认 16.67) */
  readonly initialDelta?: number
  /** tick 间最大 delta (ms, 默认 100, 防止后台大跳) */
  readonly maxDelta?: number
  /** 构造后自动 start (默认 true) */
  readonly autoStart?: boolean
}

/** FrameClock 接口 */
export interface FrameClock {
  /** 当前帧时间 (ms) */
  readonly now: () => number
  /** 当前帧 delta (ms) */
  readonly delta: () => number
  /** 累计帧数 */
  readonly frameCount: () => number
  /** 订阅帧回调 */
  readonly subscribe: (cb: FrameListener) => () => void
  /** 启动 */
  readonly start: () => void
  /** 停止 */
  readonly stop: () => void
  /** 是否运行中 */
  readonly isRunning: () => boolean
  /** 手动触发一帧 (仅 manual 模式) */
  readonly tickManual: (delta: number, time?: number) => void
}

/**
 * 创建 FrameClock
 * @param opts.mode 'raf'(默认) 或 'manual' (离线/单测)
 * @param opts.initialDelta 默认 16.67ms
 * @param opts.maxDelta 默认 100ms
 * @param opts.autoStart 默认 true
 */
export function createFrameClock(opts: FrameClockOptions = {}): FrameClock {
  const autoStart = opts.autoStart ?? true
  const initialDelta = opts.initialDelta ?? 16.67

  const scheduler: Scheduler = createScheduler({
    mode: opts.mode ?? 'raf',
    initialDelta,
    maxDelta: opts.maxDelta ?? 100,
  })

  let lastFrameDelta = initialDelta

  // bridge: scheduler 回调 → 内部状态
  scheduler.subscribe((delta, time) => {
    lastFrameDelta = delta
    void time
  })

  if (autoStart && opts.mode !== 'manual') {
    scheduler.start()
  }

  // 计 frameCount:从 scheduler 自身取
  function frameCountProxy(): number {
    return scheduler.getFrameCount()
  }

  function tickManual(delta: number, time?: number): void {
    scheduler.tickManual?.(delta, time)
  }

  return {
    now: () => scheduler.getFrameCount() > 0 ? lastFrameDelta : 0,
    delta: () => lastFrameDelta,
    frameCount: frameCountProxy,
    subscribe: scheduler.subscribe,
    start: scheduler.start,
    stop: scheduler.stop,
    isRunning: scheduler.isRunning,
    tickManual,
  }
}

/** 全局 FrameClock 单例(惰性创建) */
let globalClock: FrameClock | null = null

/** 获取全局 FrameClock(惰性) */
export function getGlobalClock(): FrameClock {
  if (!globalClock) globalClock = createFrameClock()
  return globalClock
}

/** 设置全局 FrameClock(测试/多实例场景) */
export function setGlobalClock(clock: FrameClock | null): void {
  globalClock = clock
}

// FrameListener 类型来自 base/types.ts, 此处 re-export 让消费方不需引用 base
export type { FrameListener }
