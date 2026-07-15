/**
 * timeline/events — 事件订阅总线 (0.0.5 §3.3)
 *
 * 集中管理事件订阅与触发
 */
import type {
  TimelineEvent,
  TimelineEventType,
  TimelineListener,
} from './types.js'

/** 事件总线 */
export class TimelineEventBus {
  private readonly listeners: Map<TimelineEventType, Set<TimelineListener>> = new Map()

  /** 订阅事件,返回取消订阅函数 */
  on(type: TimelineEventType, listener: TimelineListener): () => void {
    let set = this.listeners.get(type)
    if (!set) {
      set = new Set()
      this.listeners.set(type, set)
    }
    set.add(listener)
    return () => {
      this.listeners.get(type)?.delete(listener)
    }
  }

  /** 触发事件 */
  emit(event: TimelineEvent): void {
    const set = this.listeners.get(event.type)
    if (!set) return
    for (const cb of set) {
      try {
        cb(event)
      } catch (e) {
        console.error(`[octovue/act:timeline] listener error (${event.type}):`, e)
      }
    }
  }

  /** 清空所有订阅 */
  clear(): void {
    this.listeners.clear()
  }

  /** 监听者数量 */
  size(type?: TimelineEventType): number {
    if (type) return this.listeners.get(type)?.size ?? 0
    let total = 0
    for (const set of this.listeners.values()) total += set.size
    return total
  }
}