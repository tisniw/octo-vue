/**
 * composables/useFrame · 帧订阅 facade (0.0.6 §3)
 *
 * 订阅全局 FrameClock,组件卸载时自动取消订阅
 * 返回 unsubscribe 函数,可在组件销毁前手动调用提早停止
 */
import { onMounted, onUnmounted } from 'vue'
import { getGlobalClock } from '../engine-core/engines/index.js'
import type { FrameListener } from '../engine-core/base/index.js'
import type { UseFrameReturn } from './types.js'

/**
 * 订阅全局帧时钟
 * @example
 *   const stop = useFrame((delta, time) => {
 *     // 每帧回调
 *   });
 *   // 手动停止: stop();
 */
export function useFrame(cb: FrameListener): UseFrameReturn {
  let unsub: UseFrameReturn = () => {}

  onMounted(() => {
    if (typeof window === 'undefined') return
    unsub = getGlobalClock().subscribe(cb)
  })

  onUnmounted(() => {
    unsub()
  })

  return () => unsub()
}