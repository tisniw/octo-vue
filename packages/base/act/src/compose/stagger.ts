/**
 * compose/stagger · 批量交错编排 (0.0.5 §6.6)
 *
 * 真实实现:按 interval 错开启动各节点,所有节点完成后触发 complete。
 * 通过 frame 轮询检查每个 tween/timeline 完成状态。
 */
import { getGlobalDriver } from '../engine-core/engines/Driver.js'
import type { Driver } from '../engine-core/engines/Driver.js'
import { computeStaggerOrder } from '../tween/stagger-order.js'
import {
  isCallTarget,
  isFnTarget,
  isTweenOrTimeline,
  type Compose,
  type ComposeTarget,
  type StaggerConfig,
} from './types.js'

function nanoId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)
}

type Unsubscribe = () => void

/** Stagger 编排 */
export function stagger(targets: ComposeTarget[], config: StaggerConfig = {}): Compose {
  const driver: Driver = config.driver ?? getGlobalDriver()
  const {
    interval = 50,
    from = 'start',
    grid,
    delay = 0,
    yoyo = false,
    repeat = 0,
  } = config

  const id = nanoId()
  const completedListeners = new Set<() => void>()
  let killed = false
  let started = false
  let finished = false
  let frameUnsub: Unsubscribe | null = null

  const order = computeStaggerOrder(targets.length, from, grid)
  const totalNodes = order.length
  const repeatMax = repeat === 'infinite' ? Infinity : repeat
  let repeatCount = 0
  let yoyoDirection: 'forward' | 'backward' = 'forward'
  let pendingCount = 0
  let scheduledTimers: ReturnType<typeof setTimeout>[] = []

  function clearTimers(): void {
    for (const t of scheduledTimers) clearTimeout(t)
    scheduledTimers = []
  }

  function resetAndRepeat(): void {
    if (killed || finished) return
    if (repeatMax !== Infinity && repeatCount > repeatMax) {
      finished = true
      if (frameUnsub) {
        frameUnsub()
        frameUnsub = null
      }
      for (const cb of completedListeners) {
        try { cb() } catch (e) { console.error('[octovue/act:compose] complete error:', e) }
      }
      return
    }
    repeatCount++
    pendingCount = totalNodes
    if (yoyo) {
      yoyoDirection = yoyoDirection === 'forward' ? 'backward' : 'forward'
    }
    runCycle()
  }

  function runOne(targetIdx: number, i: number): void {
    if (killed) return
    const target = targets[targetIdx]
    if (target === undefined) {
      pendingCount--
      if (pendingCount <= 0) resetAndRepeat()
      return
    }
    const timerId = setTimeout(() => {
      if (killed) return
      if (isCallTarget(target)) {
        try { target.fn() } catch (e) { console.error('[octovue/act:compose] call error:', e) }
        pendingCount--
        if (pendingCount <= 0) resetAndRepeat()
        return
      }
      if (isFnTarget(target)) {
        try { target() } catch (e) { console.error('[octovue/act:compose] fn error:', e) }
        pendingCount--
        if (pendingCount <= 0) resetAndRepeat()
        return
      }
      if (isTweenOrTimeline(target)) {
        try { target.play() } catch (e) {
          console.error('[octovue/act:compose] play error:', e)
          pendingCount--
          if (pendingCount <= 0) resetAndRepeat()
        }
        return
      }
      pendingCount--
      if (pendingCount <= 0) resetAndRepeat()
    }, i * interval)
    scheduledTimers.push(timerId)
  }

  function runCycle(): void {
    if (killed || finished) return
    pendingCount = totalNodes
    const indices = yoyoDirection === 'forward' ? order : order.slice().reverse()
    indices.forEach((targetIdx, i) => runOne(targetIdx, i))
  }

  function frameTick(): void {
    if (killed || finished) return
    for (const target of targets) {
      if (isTweenOrTimeline(target) && target.state === 'finished') {
        // 已完成的 tween/timeline 需要 decrement pendingCount
        // 注意:每个节点只能减一次,这里用 Set 跟踪
      }
    }
  }

  // 简化版 frame tick:每帧减少已完成的节点数
  const completedSet = new WeakSet<ComposeTarget>()
  function frameTickReal(): void {
    if (killed || finished) return
    for (const target of targets) {
      if (!isTweenOrTimeline(target)) continue
      if (target.state === 'finished' && !completedSet.has(target)) {
        completedSet.add(target)
        pendingCount--
        if (pendingCount <= 0) resetAndRepeat()
      }
    }
  }

  const compose: Compose = {
    id,
    start() {
      if (started || killed || finished) return compose
      started = true
      const startCycle = () => {
        if (killed || finished) return
        runCycle()
        frameUnsub = driver.subscribe(() => frameTickReal())
      }
      if (delay > 0) {
        setTimeout(startCycle, delay)
      } else {
        startCycle()
      }
      return compose
    },
    pause() {
      for (const t of targets) {
        if (isTweenOrTimeline(t)) {
          t.pause()
        }
      }
      return compose
    },
    resume() {
      for (const t of targets) {
        if (isTweenOrTimeline(t)) {
          t.resume()
        }
      }
      return compose
    },
    kill() {
      killed = true
      finished = true
      clearTimers()
      if (frameUnsub) {
        frameUnsub()
        frameUnsub = null
      }
      for (const t of targets) {
        if (isTweenOrTimeline(t)) {
          try { t.kill() } catch { /* noop */ }
        }
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