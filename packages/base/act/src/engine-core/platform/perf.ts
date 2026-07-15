/**
 * engine-core/platform/perf — 性能采样 (0.0.2)
 */
import type { PerfSample } from './types.js'

/** 简单 FPS 计数器 */
export function measureFps(durationMs: number = 1000): Promise<number> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(0)
      return
    }
    let frames = 0
    const start = performance.now()
    const tick = () => {
      frames++
      if (performance.now() - start >= durationMs) {
        const fps = (frames * 1000) / (performance.now() - start)
        resolve(fps)
      } else {
        requestAnimationFrame(tick)
      }
    }
    requestAnimationFrame(tick)
  })
}

/** 标记帧(由 Driver 内部调用) */
export function markFrame(): void {
  // 占位:Driver 帧回调钩子;实际 FPS 采样由 measureFps 提供
}

/** 单次帧采样 (不计时,只记录当前值) */
export function samplePerf(prev: PerfSample | null, fps: number): PerfSample {
  return {
    time: Date.now(),
    fps,
    frameMs: fps > 0 ? 1000 / fps : 0,
  }
}
