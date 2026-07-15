/**
 * composables/useStagger · stagger 编排 facade (0.0.6 §5)
 *
 * 组件挂载时自动 staggerTo(targets, props, options)
 */
import { onMounted, type Ref } from 'vue'
import { staggerTo } from '../tween/index.js'
import type { StaggerOptions, TweenTarget } from '../tween/types.js'

/**
 * stagger 编排(mount 时自动播放)
 * @example
 *   useStagger(refs, { opacity: 1, y: 0 }, { stagger: 50 })
 */
export function useStagger(
  targets: Ref<TweenTarget[]> | TweenTarget[],
  props: Record<string, number | string>,
  options?: StaggerOptions,
): void {
  onMounted(() => {
    if (typeof window === 'undefined') return
    const arr = Array.isArray(targets) ? targets : targets.value
    if (!arr || arr.length === 0) return
    staggerTo(arr, props, options)
  })
}