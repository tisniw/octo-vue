/**
 * compose/sequence · 顺序编排 (0.0.5 §6.4)
 *
 * 真实实现:
 * - TweenHandle:通过订阅 frame 轮询 state 完成检测(完成时 state === 'finished')
 * - Timeline:同上(state === 'finished')
 * - 函数:同步执行,微任务内 advance
 */
import { getGlobalDriver } from '../engine-core/engines/Driver.js'
import type { Driver } from '../engine-core/engines/Driver.js'
import {
  isCallTarget,
  isFnTarget,
  isTweenOrTimeline,
  type Compose,
  type ComposeOptions,
  type ComposeTarget,
  type Runnable,
} from './types.js'

function nanoId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)
}

type Unsubscribe = () => void

/**
 * 把任意 ComposeTarget 规整为 Runnable
 * - 函数 / call:同步执行,无 onComplete
 * - TweenHandle / Timeline:暴露状态监测 + 完成回调
 */
function normalize(target: ComposeTarget): Runnable {
  if (isCallTarget(target)) {
    return { run: () => target.fn(), cancel: () => {}, target }
  }
  if (isFnTarget(target)) {
    return { run: () => target(), cancel: () => {}, target }
  }
  if (isTweenOrTimeline(target)) {
    const t = target
    return {
      target,
      run: () => {
        try { t.play() } catch (e) {
          console.error('[octovue/act:compose] play error:', e)
        }
      },
      cancel: () => {
        try { t.kill() } catch (e) {
          console.error('[octovue/act:compose] kill error:', e)
        }
      },
    }
  }
  return { run: () => {}, cancel: () => {} }
}

/** 顺序编排 */
export function sequence(targets: ComposeTarget[], options: ComposeOptions = {}): Compose {
  const driver: Driver = options.driver ?? getGlobalDriver()
  const { delay = 0, yoyo = false, repeat = 0, repeatDelay = 0 } = options

  const id = nanoId()
  const completedListeners = new Set<() => void>()
  const runnables = targets.map(normalize)
  const totalNodes = runnables.length
  const repeatMax = repeat === 'infinite' ? Infinity : repeat

  let currentIndex = 0
  let yoyoDirection: 'forward' | 'backward' = 'forward'
  let repeatCount = 0
  let killed = false
  let started = false
  let finished = false
  let frameUnsub: Unsubscribe | null = null
  let advanceTimeoutId: ReturnType<typeof setTimeout> | null = null

  function finish(): void {
    if (finished) return
    finished = true
    if (frameUnsub) {
      frameUnsub()
      frameUnsub = null
    }
    for (const cb of completedListeners) {
      try { cb() } catch (e) { console.error('[octovue/act:compose] complete listener error:', e) }
    }
  }

  function advance(): void {
    if (killed || finished) return

    if (yoyoDirection === 'forward') {
      currentIndex++
      if (currentIndex >= totalNodes) {
        if (yoyo) {
          yoyoDirection = 'backward'
          currentIndex = totalNodes - 2
          if (currentIndex < 0) {
            finish()
            return
          }
        } else if (repeatMax === Infinity || repeatCount < repeatMax) {
          repeatCount++
          currentIndex = 0
          if (repeatDelay > 0) {
            advanceTimeoutId = setTimeout(() => step(), repeatDelay)
            return
          }
        } else {
          finish()
          return
        }
      }
    } else {
      currentIndex--
      if (currentIndex < 0) {
        yoyoDirection = 'forward'
        if (repeatMax === Infinity || repeatCount < repeatMax) {
          repeatCount++
          currentIndex = 0
          if (repeatDelay > 0) {
            advanceTimeoutId = setTimeout(() => step(), repeatDelay)
            return
          }
        } else {
          finish()
          return
        }
      }
    }
    step()
  }

  function step(): void {
    if (killed || finished) return
    if (currentIndex < 0 || currentIndex >= totalNodes) {
      finish()
      return
    }
    const r = runnables[currentIndex]!
    try {
      r.run()
    } catch (e) {
      console.error('[octovue/act:compose] runnable error:', e)
    }
    // 同步节点(函数/call):微任务内推进一步
    if (r.target && !isTweenOrTimeline(r.target)) {
      queueMicrotask(() => advance())
    }
  }

  /** 每帧检查活跃节点是否完成 */
  function frameTick(): void {
    if (killed || finished) return
    if (currentIndex < 0 || currentIndex >= totalNodes) return
    const r = runnables[currentIndex]
    if (r?.target && isTweenOrTimeline(r.target)) {
      if (r.target.state === 'finished') {
        advance()
      }
    }
  }

  const compose: Compose = {
    id,
    start() {
      if (started || killed || finished) return compose
      started = true

      if (totalNodes === 0) {
        finish()
        return compose
      }

      const startStep = () => {
        if (killed || finished) return
        step()
        frameUnsub = driver.subscribe(() => {
          frameTick()
        })
      }

      if (delay > 0) {
        setTimeout(startStep, delay)
      } else {
        startStep()
      }
      return compose
    },
    pause() {
      const r = runnables[currentIndex]
      if (r?.target && isTweenOrTimeline(r.target)) {
        r.target.pause()
      }
      return compose
    },
    resume() {
      const r = runnables[currentIndex]
      if (r?.target && isTweenOrTimeline(r.target)) {
        r.target.resume()
      }
      return compose
    },
    kill() {
      killed = true
      finished = true
      if (frameUnsub) {
        frameUnsub()
        frameUnsub = null
      }
      if (advanceTimeoutId) {
        clearTimeout(advanceTimeoutId)
        advanceTimeoutId = null
      }
      for (const r of runnables) {
        try { r.cancel() } catch { /* noop */ }
      }
      completedListeners.clear()
    },
    on(type, listener) {
      if (type === 'complete') {
        const cb = listener as () => void
        completedListeners.add(cb)
        return () => { completedListeners.delete(cb) }
      }
      return () => {}
    },
  }

  return compose
}