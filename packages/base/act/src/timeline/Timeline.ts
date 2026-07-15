/**
 * timeline/Timeline — 时间线主体 (0.0.5 §3.3 + §3.4 + §3.5)
 *
 * 实现:play / pause / resume / seek / reverse / progress / time / timeScale /
 *      duration / addLabel / getLabel / seekLabel / getById / getChildren /
 *      yoyo / repeat / repeatDelay / 嵌套继承 / event bus
 *
 * 使用 class 以支持 `this` 返回类型
 */
import type { Driver } from '../engine-core/engines/Driver.js'
import { getGlobalDriver } from '../engine-core/engines/Driver.js'
import type { TimelineId } from '../types.js'
import { TimelineEventBus } from './events.js'
import { createPlayhead, type Playhead } from './Playhead.js'
import {
  TIMELINE_KIND,
  type Timeline,
  type TimelineEvent,
  type TimelineEventType,
  type TimelineItem,
  type TimelineLabel,
  type TimelineListener,
  type TimelineOptions,
  type TimelinePosition,
} from './types.js'

/** 简易 nanoid */
function nanoId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)
}

/** timeline 嵌套判定(0.0.5 §3.5.7) */
function isTimelineLike(item: unknown): boolean {
  if (!item || typeof item !== 'object') return false
  const t = item as Record<string, unknown>
  return (
    t['kind'] === TIMELINE_KIND &&
    typeof t['add'] === 'function' &&
    typeof t['play'] === 'function' &&
    typeof t['kill'] === 'function'
  )
}

/** tween 判定 */
function isTweenLike(item: unknown): boolean {
  if (!item || typeof item !== 'object') return false
  const t = item as Record<string, unknown>
  return (
    t['kind'] === 'tween' &&
    typeof t['kill'] === 'function' &&
    typeof t['pause'] === 'function'
  )
}

/**
 * Timeline 实现类(满足 Timeline 接口)
 */
class TimelineImpl implements Timeline {
  readonly id: TimelineId
  private readonly driver: Driver
  private readonly playhead: Playhead
  private readonly items: TimelineItem[] = []
  private readonly labels: Map<string, TimelineLabel> = new Map()
  private readonly bus = new TimelineEventBus()
  private readonly unsubscribe: () => void

  private readonly yoyoEnabled: boolean
  private readonly repeatMax: number
  private readonly repeatDelay: number
  private readonly startDelay: number

  private repeatCount = 0
  private yoyoCount = 0
  private durationValue = 0
  private killed = false
  private startedAt = 0
  private isStarted = false
  private repeatDelayTimeoutId: ReturnType<typeof setTimeout> | null = null

  constructor(options: TimelineOptions = {}) {
    this.id = nanoId() as TimelineId
    this.driver = (options.driver ?? getGlobalDriver()) as Driver
    this.playhead = createPlayhead({ duration: 0 })
    this.yoyoEnabled = options.yoyo ?? false
    this.repeatMax = options.repeat === 'infinite' ? Infinity : (options.repeat ?? 0)
    this.repeatDelay = options.repeatDelay ?? 0
    this.startDelay = options.delay ?? 0

    // 帧订阅
    this.unsubscribe = this.driver.subscribe((delta, time) => {
      if (this.killed) return
      const state = this.playhead.state
      if (state !== 'playing' && state !== 'reversed') return

      // delay 还没到
      if (!this.isStarted) {
        if (time < this.startedAt) return
        this.isStarted = true
        this.emit('start')
      }

      const dt = delta * this.playhead.timeScale
      if (state === 'playing') {
        this.playhead.advance(dt)
      } else if (state === 'reversed') {
        this.playhead.advance(-Math.abs(dt))
      }

      // 触发 items 在当前 time 应有的动作
      for (const item of this.items) {
        item.tick?.(this.playhead.time)
      }

      this.emit('update')
      this.handleBoundary()
    })

    // kind 标记,供嵌套判定
    ;(this as unknown as Record<string, unknown>)['kind'] = TIMELINE_KIND
  }

  // --------------------------------------------------
  // 事件发射
  // --------------------------------------------------

  private emit(type: TimelineEventType, extra?: Partial<TimelineEvent>): void {
    const event: TimelineEvent = {
      type,
      time: this.playhead.time,
      progress: this.playhead.progress,
      ...(extra ?? {}),
    } as TimelineEvent
    this.bus.emit(event)
  }

  // --------------------------------------------------
  // 边界处理(yoyo / repeat)
  // --------------------------------------------------

  private handleBoundary(): void {
    const duration = this.durationValue

    if (this.yoyoEnabled) {
      if (this.playhead.direction === 'forward' && this.playhead.progress >= 1) {
        this.playhead.setDirection('backward')
        this.playhead.setTime(duration)
        this.yoyoCount++
        this.emit('yoyo', { direction: 'backward', count: this.yoyoCount })
        return
      }
      if (this.playhead.direction === 'backward' && this.playhead.progress <= 0) {
        this.playhead.setDirection('forward')
        this.playhead.setTime(0)
        this.yoyoCount++
        this.emit('yoyo', { direction: 'forward', count: this.yoyoCount })
        if (this.repeatMax !== Infinity && this.repeatCount >= this.repeatMax) {
          this.finishTimeline()
          return
        }
        this.repeatCount++
        this.emit('repeat', { count: this.repeatCount })
        return
      }
      return
    }

    if (this.playhead.direction === 'forward' && this.playhead.progress >= 1) {
      if (this.repeatMax === Infinity || this.repeatCount < this.repeatMax) {
        this.repeatCount++
        this.playhead.setTime(0)
        if (this.repeatDelay > 0) {
          this.playhead.setState('paused')
          if (this.repeatDelayTimeoutId) clearTimeout(this.repeatDelayTimeoutId)
          this.repeatDelayTimeoutId = setTimeout(() => {
            if (!this.killed && this.playhead.state === 'paused') {
              this.playhead.setState('playing')
            }
            this.repeatDelayTimeoutId = null
          }, this.repeatDelay)
        }
        this.emit('repeat', { count: this.repeatCount })
      } else {
        this.finishTimeline()
      }
    }
  }

  private finishTimeline(): void {
    this.playhead.setState('finished')
    this.emit('complete')
  }

  // --------------------------------------------------
  // 公开 API(满足 Timeline 接口)
  // --------------------------------------------------

  get state() { return this.playhead.state }
  get currentTime() { return this.playhead.time }
  get childCount() { return this.items.length }

  duration(value?: number): number | Timeline {
    if (value === undefined) return this.durationValue
    this.durationValue = Math.max(0, value)
    this.emit('duration', { duration: this.durationValue })
    return this
  }

  progress(): number
  progress(value: number): Timeline
  progress(value?: number): number | Timeline {
    if (value === undefined) return this.playhead.progress
    const clamped = Math.max(0, Math.min(1, value))
    this.seek(clamped * this.durationValue)
    return this
  }

  add<T>(item: T, position?: TimelinePosition): Timeline {
    const insertAt = typeof position === 'string'
      ? (this.labels.get(position)?.time ?? this.playhead.time)
      : (position ?? this.playhead.time)

    const timelineItem: TimelineItem = {
      id: nanoId(),
      item,
      insertAt,
      tick: undefined,
    }
    this.items.push(timelineItem)

    // 嵌套继承(0.0.5 §3.5.7)
    if (isTimelineLike(item) || isTweenLike(item)) {
      const obj = item as unknown as Record<string, unknown>
      if (obj['_yoyo'] === undefined) obj['_yoyo'] = this.yoyoEnabled
      if (obj['_repeat'] === undefined) obj['_repeat'] = this.repeatMax
      if (obj['_duration'] === undefined && this.durationValue > 0) {
        obj['_duration'] = this.durationValue
      }
    }

    if (insertAt > this.durationValue) this.durationValue = insertAt

    return this
  }

  play(from?: number): Timeline {
    if (this.killed) return this
    if (typeof from === 'number') this.playhead.setTime(from)
    if (this.playhead.state === 'finished') {
      this.playhead.setTime(0)
      this.repeatCount = 0
      this.yoyoCount = 0
    }
    this.playhead.setState('playing')
    this.playhead.setDirection('forward')
    if (!this.isStarted) {
      this.startedAt = performance.now() + this.startDelay
    }
    return this
  }

  pause(): Timeline {
    if (this.playhead.state === 'playing' || this.playhead.state === 'reversed') {
      this.playhead.setState('paused')
      this.emit('pause')
    }
    return this
  }

  resume(): Timeline {
    if (this.playhead.state === 'paused') {
      this.playhead.setState(this.playhead.direction === 'backward' ? 'reversed' : 'playing')
      this.emit('resume')
    }
    return this
  }

  seek(time: number): Timeline {
    if (this.killed) return this
    const clamped = Math.max(0, Math.min(this.durationValue, time))
    this.playhead.setTime(clamped)
    for (const item of this.items) {
      item.tick?.(this.playhead.time)
    }
    this.emit('seek')
    return this
  }

  reverse(from?: number): Timeline {
    if (this.killed) return this
    if (typeof from === 'number') this.playhead.setTime(from)
    if (this.playhead.state === 'finished') {
      this.playhead.setTime(this.durationValue)
      this.repeatCount = 0
    }
    this.playhead.setState('reversed')
    this.playhead.setDirection('backward')
    if (!this.isStarted) {
      this.startedAt = performance.now() + this.startDelay
    }
    this.emit('reverse')
    return this
  }

  time(time: number): Timeline {
    const clamped = Math.max(0, Math.min(this.durationValue, time))
    this.seek(clamped)
    return this
  }

  timeScale(scale: number): Timeline {
    if (scale === 0) {
      console.warn('[act/timeline] timeScale(0) 会冻结动画,推荐使用 pause()')
    }
    this.playhead.setTimeScale(scale)
    if (scale < 0 && this.playhead.state === 'playing') {
      this.playhead.setDirection('backward')
    } else if (
      scale > 0 &&
      this.playhead.direction === 'backward' &&
      this.playhead.state === 'reversed'
    ) {
      this.playhead.setDirection('forward')
    }
    this.emit('timeScale', { scale })
    return this
  }

  addLabel(name: string, position?: number): Timeline {
    const t = position ?? this.playhead.time
    if (t < 0) {
      throw new RangeError(`[act/timeline] Label "${name}" time=${t} 不能为负`)
    }
    const label: TimelineLabel = { name, time: t }
    this.labels.set(name, label)
    this.emit('label', { label })
    return this
  }

  getLabel(name: string): TimelineLabel | undefined {
    return this.labels.get(name)
  }

  seekLabel(name: string): Timeline {
    const label = this.labels.get(name)
    if (!label) {
      console.warn(`[act/timeline] Label "${name}" not found`)
      return this
    }
    this.seek(label.time)
    return this
  }

  getById(targetId: string) {
    for (let i = 0; i < this.items.length; i++) {
      if (this.items[i]!.id === targetId) {
        return { item: this.items[i]!, position: i }
      }
    }
    return undefined
  }

  getChildren(): readonly TimelineItem[] {
    return this.items.slice()
  }

  getChildrenAfter(time: number): TimelineItem[] {
    return this.items.filter((it) => it.insertAt >= time)
  }

  on(type: TimelineEventType, listener: TimelineListener): () => void {
    return this.bus.on(type, listener)
  }

  kill(): void {
    this.killed = true
    if (this.repeatDelayTimeoutId) {
      clearTimeout(this.repeatDelayTimeoutId)
      this.repeatDelayTimeoutId = null
    }
    this.unsubscribe()
    for (const item of this.items) {
      const obj = item.item as { kill?: () => void } | null
      try {
        obj?.kill?.()
      } catch (e) {
        console.error('[octovue/act:timeline] kill child error:', e)
      }
    }
    this.items.length = 0
    this.labels.clear()
    this.bus.clear()
  }
}

/**
 * 工厂函数:创建 Timeline
 */
export function createTimeline(options: TimelineOptions = {}): Timeline {
  return new TimelineImpl(options)
}