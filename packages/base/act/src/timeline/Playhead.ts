/**
 * timeline/Playhead — 播放头(0.0.5 §3.2 + §3.4.2)
 *
 * 持有当前时间 / 进度 / 状态 / 方向 / 倍速
 * 提供 advance(delta) 推进一帧(已应用 timeScale)
 */
import type { PlayDirection, PlayState } from './types.js'

/** Playhead 配置 */
export interface PlayheadOptions {
  /** 总时长(ms) */
  readonly duration: number
}

/** Playhead 接口 */
export interface Playhead {
  readonly time: number
  readonly progress: number
  readonly state: PlayState
  readonly direction: PlayDirection
  readonly timeScale: number
  /** 推进一帧(已应用 timeScale 的 delta,可正可负) */
  readonly advance: (delta: number) => void
  /** 单独设置 timeScale */
  readonly setTimeScale: (scale: number) => void
  /** 重置到起点 */
  readonly reset: () => void
  /** 设置状态 */
  readonly setState: (state: PlayState) => void
  /** 设置方向 */
  readonly setDirection: (direction: PlayDirection) => void
  /** 直接跳到指定时间 */
  readonly setTime: (time: number) => void
}

/**
 * 创建 Playhead(框架无关,纯函数式状态机)
 */
export function createPlayhead(opts: PlayheadOptions): Playhead {
  const { duration } = opts

  let time = 0
  let state: PlayState = 'idle'
  let direction: PlayDirection = 'forward'
  let timeScaleValue = 1

  const playhead: Playhead = {
    get time() { return time },
    get progress() {
      return duration > 0 ? Math.max(0, Math.min(1, time / duration)) : 0
    },
    get state() { return state },
    get direction() { return direction },
    get timeScale() { return timeScaleValue },
    advance(delta: number) {
      const scaledDelta = delta * timeScaleValue
      time = Math.max(0, Math.min(duration, time + scaledDelta))
    },
    setTimeScale(scale: number) {
      timeScaleValue = scale
    },
    reset() {
      time = 0
      state = 'idle'
      direction = 'forward'
      timeScaleValue = 1
    },
    setState(next: PlayState) {
      state = next
    },
    setDirection(next: PlayDirection) {
      direction = next
    },
    setTime(t: number) {
      time = Math.max(0, Math.min(duration, t))
    },
  }

  return playhead
}