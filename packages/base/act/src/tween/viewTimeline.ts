/**
 * tween/viewTimeline · 视图驱动时间线 (0.0.5 §5.10.3)
 *
 * 基于 IntersectionObserver + scroll/resize 事件,提供 progress ∈ [0, 1]
 */
import type {
  ViewTimelineHandle,
  ViewTimelineOptions,
  ViewTimelineProgress,
} from './types.js'

type Unsubscribe = () => void

/** 简易 nanoid */
function nanoId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)
}

/**
 * 创建 ViewTimeline
 * SSR 安全:无 window 时返回 noop 句柄
 */
export function createViewTimeline(options: ViewTimelineOptions): ViewTimelineHandle {
  const { target, axis = 'block' } = options

  if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') {
    // SSR / 旧浏览器兜底
    return {
      id: nanoId(),
      pause() {},
      resume() {},
      getProgress: () => ({ progress: 0, isActive: false }),
      destroy() {},
      onProgress() { return () => {} },
    }
  }

  const id = nanoId()
  const listeners = new Set<(p: ViewTimelineProgress) => void>()
  let active = true
  let lastProgress = 0

  function computeProgress(): ViewTimelineProgress {
    const rect = target.getBoundingClientRect()
    const vpSize = axis === 'block' ? window.innerHeight : window.innerWidth
    const targetStart = axis === 'block' ? rect.bottom : rect.right
    const entered = vpSize - targetStart
    const progress = Math.max(0, Math.min(1, entered / vpSize))
    return { progress, isActive: active }
  }

  function onChange(): void {
    if (!active) return
    const p = computeProgress()
    if (Math.abs(p.progress - lastProgress) > 0.001) {
      lastProgress = p.progress
      for (const cb of listeners) {
        try { cb(p) } catch (e) { console.error('[octovue/act:viewTimeline] listener error:', e) }
      }
    }
  }

  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      active = e.isIntersecting || e.intersectionRatio > 0
    }
    onChange()
  }, { threshold: [0, 0.01, 0.5, 0.99, 1] })
  io.observe(target)

  const scrollHandler: () => void = () => onChange()
  window.addEventListener('scroll', scrollHandler, { passive: true })
  window.addEventListener('resize', scrollHandler)

  return {
    id,
    pause() { active = false },
    resume() { active = true; onChange() },
    getProgress: computeProgress,
    destroy() {
      io.disconnect()
      window.removeEventListener('scroll', scrollHandler)
      window.removeEventListener('resize', scrollHandler)
      listeners.clear()
    },
    onProgress(listener) {
      listeners.add(listener)
      return () => { listeners.delete(listener) }
    },
  }
}