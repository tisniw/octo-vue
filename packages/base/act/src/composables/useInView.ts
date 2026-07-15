/**
 * composables/useInView · 视口判定 facade (0.0.6 §7)
 *
 * 基于 IntersectionObserver 检测元素是否进入视口
 */
import { onMounted, onUnmounted, ref, watch, type Ref } from 'vue'
import type { UseInViewOptions, UseInViewReturn } from './types.js'

/**
 * 元素进入视口判定(IntersectionObserver)
 * @example
 *   const { inView } = useInView(ref(el));
 */
export function useInView(
  target: Ref<HTMLElement | null | undefined>,
  options: UseInViewOptions = {},
): UseInViewReturn {
  const inView = ref(false)
  const ratio = ref(0)
  let observer: IntersectionObserver | null = null

  function setup(el: HTMLElement | null | undefined): void {
    if (!el || typeof IntersectionObserver === 'undefined') return
    if (observer) observer.disconnect()
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          inView.value = entry.isIntersecting
          ratio.value = entry.intersectionRatio
          if (options.once && entry.isIntersecting) {
            observer?.disconnect()
            observer = null
          }
        }
      },
      {
        threshold: options.threshold ?? 0,
        root: options.root ?? null,
        rootMargin: options.rootMargin ?? '0px',
      },
    )
    observer.observe(el)
  }

  onMounted(() => {
    setup(target.value)
    // 监听 ref 变化(target 可能 mount 后才绑定)
    watch(target, (el) => setup(el), { flush: 'post' })
  })

  onUnmounted(() => {
    observer?.disconnect()
    observer = null
  })

  return {
    inView,
    ratio,
    stop: () => {
      observer?.disconnect()
      observer = null
    },
  }
}