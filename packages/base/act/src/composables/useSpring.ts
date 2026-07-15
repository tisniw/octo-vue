/**
 * composables/useSpring · 响应式弹簧值 facade (0.0.6 §4)
 *
 * 真实实现:
 * - 内部使用 SpringDriver 批量管理
 * - 通过 FrameClock 订阅每帧更新(替代 setInterval,0.0.6 §14 已知限制已修复)
 * - 组件卸载时自动清理 driver + 订阅
 */
import { onUnmounted, ref, type Ref } from 'vue'
import { createSpringDriver, getGlobalClock } from '../engine-core/engines/index.js'
import type { SpringTarget } from '../engine-core/engines/SpringDriver.js'
import type { SpringSpec } from '../engine-core/base/types.js'
import type { UseSpringReturn } from './types.js'

type Unsubscribe = () => void

/**
 * 创建响应式弹簧值
 * @example
 *   const x = useSpring(0, { stiffness: 200, damping: 20 });
 *   x.setTarget(100);   // 平滑过渡
 */
export function useSpring<T extends number>(
  initial: T,
  spec: SpringSpec,
): UseSpringReturn<T> {
  const value = ref(initial) as Ref<T>
  const velocity = ref(0)
  const isAnimating = ref(false)

  // SpringDriver 默认创建(initial 时不挂任何 target)
  const driver = createSpringDriver({ targets: [] })

  let targetRef: SpringTarget<number> | null = null
  let frameUnsub: Unsubscribe | null = null
  let isMounted = true

  function ensureTarget(v: T): SpringTarget<number> {
    if (targetRef) return targetRef
    const t: SpringTarget<number> = {
      value: initial as number,
      velocity: 0,
      target: v as number,
      spec,
    }
    targetRef = t
    driver.add(t)
    subscribeFrame()
    return t
  }

  function subscribeFrame(): void {
    if (frameUnsub) return
    if (typeof window === 'undefined') return // SSR 跳过
    try {
      frameUnsub = getGlobalClock().subscribe(() => {
        if (!targetRef) return
        value.value = targetRef.value as T
        velocity.value = targetRef.velocity
        const restSpeed = spec.restSpeed ?? 0.01
        const restDelta = spec.restDelta ?? 0.0001
        if (
          Math.abs(targetRef.velocity) < restSpeed &&
          Math.abs(targetRef.value - targetRef.target) < restDelta
        ) {
          isAnimating.value = false
        }
      })
    } catch (e) {
      console.error('[octovue/act:useSpring] FrameClock subscribe failed:', e)
    }
  }

  onUnmounted(() => {
    isMounted = false
    if (frameUnsub) {
      frameUnsub()
      frameUnsub = null
    }
    driver.stopAll()
    targetRef = null
  })

  function setTarget(v: T): void {
    const t = ensureTarget(v)
    t.target = v as number
    isAnimating.value = true
  }

  function jump(v: T): void {
    if (targetRef) {
      targetRef.value = v as number
      targetRef.velocity = 0
      targetRef.target = v as number
    }
    value.value = v
    isAnimating.value = false
  }

  function stop(): void {
    isAnimating.value = false
    if (targetRef) {
      targetRef.value = targetRef.target
      targetRef.velocity = 0
    }
  }

  return {
    value,
    velocity,
    isAnimating,
    setTarget,
    jump,
    stop,
  }
}