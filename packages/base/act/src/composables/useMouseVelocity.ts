/**
 * composables/useMouseVelocity · 鼠标速度追踪 facade (0.0.6 §8)
 */
import { onMounted, onUnmounted, ref, type Ref } from 'vue'
import { createVelocityTracker } from '../engine-core/engines/index.js'
import type { VelocityTracker } from '../engine-core/engines/index.js'
import type { UseMouseVelocityReturn } from './types.js'

type Unsubscribe = () => void

/**
 * 鼠标速度追踪(基于 VelocityTracker)
 * @example
 *   const { vx, vy, speed } = useMouseVelocity();
 */
export function useMouseVelocity(): UseMouseVelocityReturn {
  const vx: Ref<number> = ref(0)
  const vy: Ref<number> = ref(0)
  const speed: Ref<number> = ref(0)
  let trackerX: VelocityTracker | null = null
  let trackerY: VelocityTracker | null = null
  let unsub: Unsubscribe | null = null

  function handler(e: PointerEvent): void {
    trackerX?.addSample(e.clientX)
    trackerY?.addSample(e.clientY)
    vx.value = trackerX?.getVelocity() ?? 0
    vy.value = trackerY?.getVelocity() ?? 0
    speed.value = Math.sqrt(vx.value * vx.value + vy.value * vy.value)
  }

  onMounted(() => {
    if (typeof window === 'undefined') return
    trackerX = createVelocityTracker()
    trackerY = createVelocityTracker()
    window.addEventListener('pointermove', handler)
    unsub = () => window.removeEventListener('pointermove', handler)
  })

  onUnmounted(() => {
    unsub?.()
    trackerX?.reset()
    trackerY?.reset()
    trackerX = null
    trackerY = null
  })

  return { vx, vy, speed }
}