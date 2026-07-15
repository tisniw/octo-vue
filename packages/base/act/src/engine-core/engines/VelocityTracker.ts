/**
 * engine-core/engines · VelocityTracker 速度追踪 (0.0.4 §7)
 *
 * 滑动窗口采样,计算首末样本的速度(value/ms)
 * 用于惯性 / fling 场景
 */
export interface VelocityTrackerOptions {
  /** 采样窗口大小(帧数,默认 10) */
  readonly windowSize?: number
  /** 静止阈值 (默认 0.001) */
  readonly restThreshold?: number
}

/** VelocityTracker 接口 */
export interface VelocityTracker {
  readonly addSample: (value: number, time?: number) => void
  readonly getVelocity: () => number
  readonly isAtRest: () => boolean
  readonly reset: () => void
}

/**
 * 创建 VelocityTracker
 * @param opts.windowSize 默认 10(超出窗口的 sample 自动弹出)
 * @param opts.restThreshold 默认 0.001
 */
export function createVelocityTracker(
  opts: VelocityTrackerOptions = {},
): VelocityTracker {
  const windowSize = opts.windowSize ?? 10
  const restThreshold = opts.restThreshold ?? 0.001

  const samples: Array<{ value: number; time: number }> = []

  function getNow(): number {
    return typeof performance !== 'undefined' ? performance.now() : Date.now()
  }

  function addSample(value: number, time?: number): void {
    samples.push({ value, time: time ?? getNow() })
    // 弹出超出窗口的旧样本
    while (samples.length > windowSize) samples.shift()
  }

  function getVelocity(): number {
    if (samples.length < 2) return 0
    const first = samples[0]!
    const last = samples[samples.length - 1]!
    const dt = last.time - first.time
    return dt > 0 ? (last.value - first.value) / dt : 0
  }

  function isAtRest(): boolean {
    return Math.abs(getVelocity()) < restThreshold
  }

  function reset(): void {
    samples.length = 0
  }

  return {
    addSample,
    getVelocity,
    isAtRest,
    reset,
  }
}
