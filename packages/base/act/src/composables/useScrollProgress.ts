/**
 * composables/useScrollProgress · 滚动进度 facade (0.0.6 §6)
 *
 * 创建 ScrollDriver 并暴露响应式 progress / position / velocity / direction refs
 */
import { onMounted, onUnmounted, ref, type Ref } from 'vue'
import { createScrollDriver } from '../engine-core/engines/index.js'
import type {
  ScrollDriver,
  ScrollOptions,
  ScrollProgress,
} from '../engine-core/engines/index.js'
import type { ScrollDirection } from '../types.js'
import type { UseScrollProgressReturn } from './types.js'

type Unsubscribe = () => void

/**
 * 响应式滚动进度
 * @example
 *   const { progress } = useScrollProgress();
 *   watch(progress, (p) => console.log(p));
 */
export function useScrollProgress(opts?: ScrollOptions): UseScrollProgressReturn {
  const progress = ref(0)
  const position = ref(0)
  const velocity = ref(0)
  const direction = ref<ScrollDirection>('down')

  let driver: ScrollDriver | null = null
  let unsub: Unsubscribe | null = null

  onMounted(() => {
    if (typeof window === 'undefined') return
    driver = createScrollDriver(opts)
    unsub = driver.subscribe((p: ScrollProgress) => {
      progress.value = p.progress
      position.value = p.position
      velocity.value = p.velocity
      direction.value = p.direction
    })
  })

  onUnmounted(() => {
    unsub?.()
    driver?.destroy()
  })

  return {
    progress,
    position,
    velocity,
    direction,
    scrollTo: (target, smooth = false) => driver?.scrollTo(target, smooth),
    destroy: () => {
      unsub?.()
      driver?.destroy()
    },
  }
}