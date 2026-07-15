/**
 * engine-core/engines · SpringDriver 弹簧驱动 (0.0.4 §5)
 *
 * 批量管理多个弹簧目标,每帧调用 springFrame 求解
 * 受 FrameClock 调度,无 FrameClock 时不启动(SSR 友好)
 */
import type { SpringSpec } from '../base/types.js'
import { springFrame } from '../base/index.js'
import type { FrameClock } from './FrameClock.js'
import { getGlobalClock } from './FrameClock.js'

/** 弹簧目标 */
export interface SpringTarget<T extends number = number> {
  /** 当前值 */
  value: T
  /** 当前速度 */
  velocity: number
  /** 目标值 */
  target: T
  /** 弹簧规范 */
  spec: SpringSpec
}

/** SpringDriver 配置 */
export interface SpringDriverOptions {
  readonly clock?: FrameClock
  /** 初始目标(可后续 add/remove) */
  readonly targets?: readonly SpringTarget[]
}

/** SpringDriver 接口 */
export interface SpringDriver {
  /** 添加弹簧目标 */
  readonly add: (target: SpringTarget) => void
  /** 移除弹簧目标 */
  readonly remove: (target: SpringTarget) => boolean
  /** 获取所有目标 */
  readonly list: () => readonly SpringTarget[]
  /** 是否所有弹簧已静止 */
  readonly isAtRest: () => boolean
  /** 强制停止所有弹簧 */
  readonly stopAll: () => void
}

const MAX_DT_SEC = 1 / 30 // 限制最大步长 33ms 防数值爆炸

/**
 * 创建 SpringDriver
 * - 默认 clock = getGlobalClock()
 * - 每帧 (dt 秒) 调用 springFrame 求解
 * - isAtRest 默认 restSpeed 默认 0.01
 */
export function createSpringDriver(opts: SpringDriverOptions = {}): SpringDriver {
  const clock = opts.clock ?? getGlobalClock()
  const targets = new Set<SpringTarget>()

  // 初始 targets
  if (opts.targets) {
    for (const t of opts.targets) {
      targets.add(t)
    }
  }

  let lastTime = clock.now() || 0

  clock.subscribe((_delta, time) => {
    const dt = Math.min((time - lastTime) / 1000, MAX_DT_SEC)
    lastTime = time
    for (const target of targets) {
      const { value, velocity } = springFrame(
        target.value,
        target.velocity,
        target.target,
        target.spec,
        dt,
      )
      target.value = value
      target.velocity = velocity
    }
  })

  function add(target: SpringTarget): void {
    targets.add(target)
  }

  function remove(target: SpringTarget): boolean {
    return targets.delete(target)
  }

  function list(): readonly SpringTarget[] {
    return [...targets]
  }

  function isAtRest(): boolean {
    for (const t of targets) {
      const restSpeed = t.spec.restSpeed ?? 0.01
      if (Math.abs(t.velocity) >= restSpeed) return false
    }
    return true
  }

  function stopAll(): void {
    for (const t of targets) {
      t.velocity = 0
      t.value = t.target
    }
    targets.clear()
  }

  return {
    add,
    remove,
    list,
    isAtRest,
    stopAll,
  }
}
