/**
 * compose/parallel · 并发编排 (0.0.5 §6.5)
 *
 * 真实实现:同时启动全部节点,全部完成后触发 complete。
 * 通过 frame 轮询检查每个 tween/timeline 节点的 state。
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
} from './types.js'

function nanoId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)
}

type Unsubscribe = () => void

/** 并发编排 — 同时启动全部节点,全部完成后触发 complete */
export function parallel(targets: ComposeTarget[], options: ComposeOptions = {}): Compose {
  const driver: Driver = options.driver ?? getGlobalDriver()
  const { delay = 0 } = options

  const id = nanoId()
  const completedListeners = new Set<() => void>()
  let pendingCount = targets.length
  let killed = false
  let started = false
  let finished = false
  let frameUnsub: Unsubscribe | null = null

  function advance(): void {
    if (killed || finished) return
    pendingCount--
    if (pendingCount <= 0) {
      finished = true
      if (frameUnsub) {
        frameUnsub()
        frameUnsub = null
      }
      for (const cb of completedListeners) {
        try { cb() } catch (e) { console.error('[octovue/act:compose] complete listener error:', e) }
      }
    }
  }

  function runTarget(target: ComposeTarget): void {
    if (isCallTarget(target)) {
      try { target.fn() } catch (e) { console.error('[octovue/act:compose] call error:', e) }
      advance()
      return
    }
    if (isFnTarget(target)) {
      try { target() } catch (e) { console.error('[octovue/act:compose] fn error:', e) }
      advance()
      return
    }
    if (isTweenOrTimeline(target)) {
      try { target.play() } catch (e) { console.error('[octovue/act:compose] play error:', e) }
      return
    }
    advance()
  }

  function frameTick(): void {
    if (killed || finished) return
    for (const target of targets) {
      if (!isTweenOrTimeline(target)) continue
      if (target.state === 'finished') {
        advance()
      }
    }
  }

  const compose: Compose = {
    id,
    start() {
      if (started || killed || finished) return compose
      started = true

      if (targets.length === 0) {
        finished = true
        for (const cb of completedListeners) {
          try { cb() } catch (e) { console.error('[octovue/act:compose] complete listener error:', e) }
        }
        return compose
      }

      const startRun = () => {
        if (killed || finished) return
        for (const t of targets) runTarget(t)
        // 订阅帧检查完成
        frameUnsub = driver.subscribe(() => frameTick())
      }

      if (delay > 0) {
        setTimeout(startRun, delay)
      } else {
        startRun()
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