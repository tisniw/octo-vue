/**
 * compose/scrollDriven · 滚动驱动编排 (0.0.5 §6.7)
 *
 * 真实实现:基于 IntersectionObserver + scroll/resize 事件。
 * scrub=true 时实时驱动 tween.seek(progress)。
 * scrub=false 时进入视口后单次播放。
 *
 * SSR 安全:无 window 时返回 noop 句柄。
 */
import {
  isCallTarget,
  isFnTarget,
  isTweenOrTimeline,
  type Compose,
  type ComposeTarget,
  type ScrollBoundary,
  type ScrollBoundaryResolved,
  type ScrollDrivenOptions,
} from './types.js'

function nanoId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)
}

/** 解析 ScrollBoundary → 内部表示 */
function parseBoundary(
  opt: ScrollBoundary | undefined,
  axis: 'block' | 'inline',
): ScrollBoundaryResolved {
  if (opt === undefined) return { offsetPx: 0 }
  if (typeof HTMLElement !== 'undefined' && opt instanceof HTMLElement) {
    return { element: opt, offsetPx: 0 }
  }
  if (typeof opt === 'number') return { offsetPx: opt }
  if (typeof opt === 'string') {
    if (opt.endsWith('vh')) {
      return {
        offsetPx: (parseFloat(opt) / 100) *
          (typeof window !== 'undefined' ? window.innerHeight : 0),
      }
    }
    if (opt.endsWith('%')) {
      const vp = typeof window !== 'undefined'
        ? (axis === 'block' ? window.innerHeight : window.innerWidth)
        : 0
      return { offsetPx: (parseFloat(opt) / 100) * vp }
    }
    return { offsetPx: parseFloat(opt) }
  }
  return { offsetPx: 0 }
}

/** SSR 兜底句柄 */
function ssrCompose(id: string): Compose {
  return {
    id,
    start() { return this },
    pause() { return this },
    resume() { return this },
    kill() {},
    on() { return () => {} },
  }
}

/** 滚动驱动编排 */
export function scrollDriven(targets: ComposeTarget[], options: ScrollDrivenOptions): Compose {
  const {
    start: startOpt,
    end: endOpt,
    axis = 'block',
    scrub = true,
    once = false,
  } = options

  const id = nanoId()
  const onProgressListeners = new Set<(p: number) => void>()
  const completedListeners = new Set<() => void>()
  let killed = false
  let entryPlayed = false
  let lastApplied = -1
  let reachedEnd = false

  // SSR 兜底
  if (typeof window === 'undefined') {
    return ssrCompose(id)
  }

  const startBoundary = parseBoundary(startOpt, axis)
  const endBoundary = parseBoundary(endOpt, axis)
  const range = endBoundary.offsetPx - startBoundary.offsetPx

  function driveTargets(p: number): void {
    // 始终调用 progress listener(包括重复值)
    for (const cb of onProgressListeners) {
      try { cb(p) } catch (e) { console.error('[octovue/act:compose] progress error:', e) }
    }
    if (Math.abs(p - lastApplied) < 0.001) return
    lastApplied = p
    for (const t of targets) {
      if (isTweenOrTimeline(t) && typeof t.seek === 'function') {
        try { t.seek(p) } catch (e) {
          console.error('[octovue/act:compose] scrollDriven seek error:', e)
        }
      } else if (isCallTarget(t)) {
        try { t.fn() } catch (e) { console.error('[octovue/act:compose] call error:', e) }
      } else if (isFnTarget(t)) {
        try { t() } catch (e) { console.error('[octovue/act:compose] fn error:', e) }
      }
    }
  }

  function computeProgress(): number {
    const elementTop = startBoundary.element
      ? startBoundary.element.getBoundingClientRect().top
      : 0
    const scrolled = -elementTop + startBoundary.offsetPx
    if (range === 0) return scrolled >= 0 ? 1 : 0
    return Math.max(0, Math.min(1, scrolled / range))
  }

  function onScroll(): void {
    if (killed) return
    if (once && entryPlayed) return
    const progress = computeProgress()
    if (scrub) {
      driveTargets(progress)
    } else if (!entryPlayed && progress > 0) {
      for (const t of targets) {
        if (isCallTarget(t)) {
          try { t.fn() } catch (e) { console.error('[octovue/act:compose] call error:', e) }
        } else if (isFnTarget(t)) {
          try { t() } catch (e) { console.error('[octovue/act:compose] fn error:', e) }
        } else if (isTweenOrTimeline(t)) {
          try { t.play() } catch (e) { console.error('[octovue/act:compose] play error:', e) }
        }
      }
      entryPlayed = true
    }
    if (progress >= 1 && !reachedEnd) {
      reachedEnd = true
      for (const cb of completedListeners) {
        try { cb() } catch (e) { console.error('[octovue/act:compose] complete error:', e) }
      }
    } else if (progress < 1) {
      reachedEnd = false
    }
  }

  if (scrub) {
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
  } else if (startBoundary.element && typeof IntersectionObserver !== 'undefined') {
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !entryPlayed) {
          onScroll()
          if (once) io.disconnect()
        }
      },
      { threshold: 0 },
    )
    io.observe(startBoundary.element)
  }

  return {
    id,
    start() {
      onScroll()
      return this
    },
    pause() { return this },
    resume() {
      onScroll()
      return this
    },
    kill() {
      killed = true
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      onProgressListeners.clear()
      completedListeners.clear()
    },
    on(type, listener) {
      if (type === 'progress') {
        const cb = listener as (p: number) => void
        onProgressListeners.add(cb)
        return () => { onProgressListeners.delete(cb) }
      }
      if (type === 'complete') {
        const cb = listener as () => void
        completedListeners.add(cb)
        return () => { completedListeners.delete(cb) }
      }
      return () => {}
    },
  }
}