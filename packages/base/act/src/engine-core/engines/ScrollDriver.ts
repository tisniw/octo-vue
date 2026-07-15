/**
 * engine-core/engines · ScrollDriver 滚动驱动 (0.0.4 §6)
 *
 * 滚动事件 → 归一化进度 (0-1) + 速度 (px/ms)
 * 自实现(不依赖 @gsap/scroll-trigger),独立 rAF 循环
 *
 * **SSR noop fallback**:容器不可用时返回 dummy 0 进度与 no-op subscribe
 */
import type { ScrollDirection } from '../../types.js'

/** ScrollDriver 配置 */
export interface ScrollOptions {
  /** 滚动容器(默认 window) */
  readonly container?: Window | HTMLElement | null
  /** 滚动方向('y' 默认,0.0.9 §7.1 横向 axis:'x' 已取消) */
  readonly axis?: 'y' | 'x'
  /** 平滑系数 (0-1, 越大越平滑) */
  readonly smoothing?: number
  /** 偏移 */
  readonly offset?: { start?: number; end?: number }
}

/** 滚动快照 */
export interface ScrollProgress {
  /** 归一化进度 0-1 */
  readonly progress: number
  /** 当前滚动位置 (px) */
  readonly position: number
  /** 最大滚动距离 (px) */
  readonly max: number
  /** 当前速度 (px/ms) */
  readonly velocity: number
  /** 当前方向 */
  readonly direction: ScrollDirection
}

/** ScrollDriver 接口 */
export interface ScrollDriver {
  readonly getProgress: () => ScrollProgress
  readonly subscribe: (cb: (progress: ScrollProgress) => void) => () => void
  readonly scrollTo: (target: number, smooth?: boolean) => void
  readonly destroy: () => void
}

/** SSR noop stub */
function ssrStubDriver(): ScrollDriver {
  const noopProgress: ScrollProgress = {
    progress: 0,
    position: 0,
    max: 0,
    velocity: 0,
    direction: 'down',
  }
  return {
    getProgress: () => noopProgress,
    subscribe: () => () => {
      /* noop */
    },
    scrollTo: () => {
      /* noop */
    },
    destroy: () => {
      /* noop */
    },
  }
}

/**
 * 创建 ScrollDriver
 * SSR / 无 window 时返回 noop stub
 */
export function createScrollDriver(opts: ScrollOptions = {}): ScrollDriver {
  const container = opts.container ?? (typeof window !== 'undefined' ? window : null)
  // 早返回 SSR/无容器
  if (!container) {
    return ssrStubDriver()
  }
  // 局部非空别名(closure 内的 narrowing 用)
  const target: Window | HTMLElement = container

  const axis = opts.axis ?? 'y'
  const smoothing = opts.smoothing ?? 0
  const startOffset = opts.offset?.start ?? 0
  const endOffset = opts.offset?.end ?? 0

  const listeners = new Set<(p: ScrollProgress) => void>()

  function getPosition(): number {
    if (target instanceof Window) {
      return axis === 'y' ? window.scrollY : window.scrollX
    }
    return axis === 'y' ? target.scrollTop : target.scrollLeft
  }

  function getMax(): number {
    if (target instanceof Window) {
      const d = document.documentElement
      return d.scrollHeight - window.innerHeight
    }
    return target.scrollHeight - target.clientHeight
  }

  let lastPosition = getPosition()
  let lastTime =
    typeof performance !== 'undefined' ? performance.now() : Date.now()
  let velocity = 0
  let smoothedPosition = lastPosition
  let rafId = 0

  function tick(): void {
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now()
    const dt = now - lastTime
    const pos = getPosition()

    velocity = dt > 0 ? (pos - lastPosition) / dt : 0
    lastPosition = pos
    lastTime = now

    if (smoothing > 0) {
      smoothedPosition += (pos - smoothedPosition) * smoothing
    } else {
      smoothedPosition = pos
    }

    const max = getMax()
    const span = max - endOffset - startOffset
    const progress =
      span > 0
        ? Math.max(0, Math.min(1, (smoothedPosition - startOffset) / span))
        : 0
    const direction: ScrollDirection =
      velocity > 0
        ? axis === 'y'
          ? 'down'
          : 'right'
        : axis === 'y'
          ? 'up'
          : 'left'

    for (const cb of listeners) {
      try {
        cb({ progress, position: smoothedPosition, max, velocity, direction })
      } catch (e) {
        console.error('[octovue/act:engines] ScrollDriver listener error:', e)
      }
    }
    rafId = requestAnimationFrame(tick)
  }

  // 仅浏览器端可启动 rAF
  if (typeof requestAnimationFrame === 'function') {
    rafId = requestAnimationFrame(tick)
  }

  return {
    getProgress: () => {
      const max = getMax()
      const span = max - endOffset - startOffset
      const progress =
        span > 0
          ? Math.max(0, Math.min(1, (smoothedPosition - startOffset) / span))
          : 0
      const direction: ScrollDirection =
        velocity > 0
          ? axis === 'y' ? 'down' : 'right'
          : axis === 'y' ? 'up' : 'left'
      return { progress, position: smoothedPosition, max, velocity, direction }
    },
    subscribe(cb) {
      listeners.add(cb)
      return () => {
        listeners.delete(cb)
      }
    },
    scrollTo(px, smooth = false) {
      const scrollOpts: ScrollToOptions = smooth ? { behavior: 'smooth' } : {}
      if (target instanceof Window) {
        if (axis === 'y') window.scrollTo({ top: px, ...scrollOpts })
        else window.scrollTo({ left: px, ...scrollOpts })
      } else {
        if (axis === 'y') target.scrollTo({ top: px, ...scrollOpts })
        else target.scrollTo({ left: px, ...scrollOpts })
      }
    },
    destroy() {
      if (typeof cancelAnimationFrame === 'function') {
        cancelAnimationFrame(rafId)
      }
      listeners.clear()
    },
  }
}
