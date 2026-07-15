/**
 * engine-core/engines · Driver 全局驱动 (0.0.4 §4)
 *
 * 单例 · 持有 FrameClock 与 Adapter,订阅帧回调转发给 listener
 * `tween(target, props, options?)` 委托给 Adapter.createTween
 *
 * **adapter 延迟绑定**:`createDriver()` 不强制要求 engine,
 * 首次 `tween()` 时按默认 ID 获取。
 */
import type {
  Adapter,
  TweenHandle,
  TweenOptions,
  TweenTarget,
} from '../adapter/_adapter.js'
import { getAdapter } from '../adapter/index.js'
import type { FrameClock, FrameListener } from './FrameClock.js'
import { getGlobalClock } from './FrameClock.js'

/** Driver 配置 */
export interface DriverOptions {
  /** 默认 getGlobalClock() */
  readonly clock?: FrameClock
  /** 默认 null(延迟到首次 createTween 时按 'gsap' 获取) */
  readonly engine?: Adapter | null
}

/** Driver 接口 */
export interface Driver {
  /** 订阅帧 (内部动画 tick 用) */
  readonly subscribe: (cb: FrameListener) => () => void
  /** 当前 adapter */
  readonly getEngine: () => Adapter | null
  /** 设置 adapter */
  readonly setEngine: (adapter: Adapter | null) => void
  /** 创建 tween (委托给 adapter) */
  readonly tween: (
    target: TweenTarget,
    props: Record<string, unknown>,
    options?: TweenOptions,
  ) => TweenHandle
  /** 当前活跃 tween 数 (Stage 2 占位:listeners.size;Stage 5+ 改 activeTween 集合) */
  readonly activeCount: () => number
  /** 是否空闲 */
  readonly isIdle: () => boolean
}

/** 默认 adapter ID(由 0.0.8 init 模块注册) */
export const DEFAULT_ADAPTER_ID = 'gsap'

/**
 * 创建 Driver
 * listener 集合用于 activeCount / isIdle 占位计数
 */
export function createDriver(opts: DriverOptions = {}): Driver {
  const clock = opts.clock ?? getGlobalClock()
  const listeners = new Set<FrameListener>()
  let engine: Adapter | null = opts.engine ?? null

  // 挂到 FrameClock (单一同步订阅)
  clock.subscribe((delta, time) => {
    for (const cb of listeners) {
      try {
        cb(delta, time)
      } catch (e) {
        console.error('[octovue/act:engines] Driver listener error:', e)
      }
    }
  })

  function setEngine(adapter: Adapter | null): void {
    engine = adapter
  }

  function getEngine(): Adapter | null {
    return engine
  }

  function tween(
    target: TweenTarget,
    props: Record<string, unknown>,
    options?: TweenOptions,
  ): TweenHandle {
    // adapter 延迟绑定:运行时按 'gsap' 获取
    if (!engine) {
      const found = getAdapter(DEFAULT_ADAPTER_ID)
      if (!found) {
        throw new Error(
          `[octovue/act:engines] Driver.tween: no engine adapter registered (default id "${DEFAULT_ADAPTER_ID}")`,
        )
      }
      engine = found
    }
    return engine.createTween(target, props, options)
  }

  function activeCount(): number {
    // 当前活跃订阅数(真实实现 — Driver 维护 listener Set)
    return listeners.size
  }

  function isIdle(): boolean {
    return listeners.size === 0 && engine === null
  }

  return {
    subscribe(cb: FrameListener) {
      listeners.add(cb)
      return () => {
        listeners.delete(cb)
      }
    },
    getEngine,
    setEngine,
    tween,
    activeCount,
    isIdle,
  }
}

/** 全局 Driver 单例(惰性) */
let globalDriver: Driver | null = null

/** 获取全局 Driver(惰性) */
export function getGlobalDriver(): Driver {
  if (!globalDriver) globalDriver = createDriver()
  return globalDriver
}

/** 设置全局 Driver(测试/替换) */
export function setGlobalDriver(driver: Driver | null): void {
  globalDriver = driver
}
