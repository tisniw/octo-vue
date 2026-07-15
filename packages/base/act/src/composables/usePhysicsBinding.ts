/**
 * composables/usePhysicsBinding · 物理引擎绑定 facade (0.0.6 §10)
 *
 * 将物理引擎 body 的某个属性绑定到 ref,每 16ms 同步一次(简化实现)
 */
import { onUnmounted, ref, watch, type Ref } from 'vue'
import type { UsePhysicsBindingOptions } from './types.js'

/** 强类型 body 视图 */
interface IndexableBody {
  readonly [key: string]: unknown
}

/**
 * 将物理引擎 body 的某个属性绑定到 ref
 * @example
 *   const body = ref(cannonBody);
 *   const x = usePhysicsBinding<number>({ body, prop: 'position.x' });
 */
export function usePhysicsBinding<T = unknown>(
  opts: UsePhysicsBindingOptions<T>,
): Ref<T | undefined> {
  const initial = readProp<T>(opts.body.value as IndexableBody | null | undefined, opts.prop)
  const value = ref(initial) as Ref<T | undefined>

  let lastBody = opts.body.value
  const interval = setInterval(() => {
    const body = opts.body.value as IndexableBody | null | undefined
    if (!body) return
    const next = readProp<T>(body, opts.prop)
    if (next !== undefined) value.value = next
  }, 16)

  // body 引用变化时立即同步一次
  const stopWatch = watch(
    () => opts.body.value,
    (next) => {
      if (next === lastBody) return
      lastBody = next
      const body = next as IndexableBody | null | undefined
      const v = readProp<T>(body, opts.prop)
      if (v !== undefined) value.value = v
    },
  )

  onUnmounted(() => {
    clearInterval(interval)
    stopWatch()
  })

  return value
}

/** 安全读取 body 属性 */
function readProp<T>(body: IndexableBody | null | undefined, prop: string): T | undefined {
  if (!body) return undefined
  const v = body[prop]
  return v as T | undefined
}