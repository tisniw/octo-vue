/**
 * engine-core/base/scheduler — 帧调度器 (0.0.1 §5)
 *
 * 批量 tick 机制,允许多个动画共享同一帧回调
 * 暴露 tickManual 用于离线渲染 / 单元测试
 */
import type { Scheduler, SchedulerOptions } from './types.js'

const DEFAULT_MAX_DELTA = 100
const DEFAULT_INITIAL_DELTA = 16.67

/**
 * 创建 scheduler
 * - mode='raf'(默认):requestAnimationFrame 循环
 * - mode='manual':不启动 rAF,需手动调用 tickManual
 */
export function createScheduler(opts: SchedulerOptions = {}): Scheduler {
  const mode = opts.mode ?? 'raf'
  const initialDelta = opts.initialDelta ?? DEFAULT_INITIAL_DELTA
  const maxDelta = opts.maxDelta ?? DEFAULT_MAX_DELTA

  const listeners = new Set<(delta: number, time: number) => void>()
  let running = false
  let rafId = 0
  let lastTime = 0
  let frameCount = 0

  function tick(now: number): void {
    if (!running) return
    const delta = Math.min(now - lastTime, maxDelta)
    lastTime = now
    frameCount++
    // 批量调用,即使抛错也不影响其他
    for (const cb of listeners) {
      try {
        cb(delta, now)
      } catch (e) {
        console.error('[octovue/act:base] scheduler listener error:', e)
      }
    }
    rafId = requestAnimationFrame(tick)
  }

  return {
    subscribe(cb) {
      listeners.add(cb)
      return () => {
        listeners.delete(cb)
      }
    },
    start() {
      if (running) return
      if (mode === 'manual') {
        running = true
        lastTime = 0
        return
      }
      running = true
      lastTime = performance.now()
      rafId = requestAnimationFrame(tick)
    },
    stop() {
      running = false
      if (mode === 'raf') cancelAnimationFrame(rafId)
    },
    isRunning: () => running,
    getFrameCount: () => frameCount,
    tickManual(delta, time) {
      if (mode !== 'manual') {
        console.warn('[octovue/act:base] tickManual() 只在 manual 模式下有效')
        return
      }
      lastTime = time ?? lastTime + initialDelta
      frameCount++
      for (const cb of listeners) {
        try {
          cb(delta, lastTime)
        } catch (e) {
          console.error('[octovue/act:base] scheduler listener error:', e)
        }
      }
    },
  }
}

/** 预创建 single-scheduler 工具(常用于 FrameClock) */
export function scheduleTick(
  cb: (delta: number, time: number) => void,
  opts?: SchedulerOptions,
): () => void {
  const s = createScheduler(opts)
  s.start()
  const unsub = s.subscribe(cb)
  return () => {
    unsub()
    s.stop()
  }
}
