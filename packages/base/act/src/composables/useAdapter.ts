/**
 * composables/useAdapter · adapter 异步加载 facade (0.0.6 §9)
 */
import { onMounted, ref, type Ref } from 'vue'
import type { Adapter } from '../engine-core/adapter/_adapter.js'
import type { AdapterId, AdapterState } from '../types.js'
import { getAdapter } from '../engine-core/adapter/_registry.js'
import { loadAdapterById } from '../engine-core/adapter/_loader.js'
import type { UseAdapterReturn } from './types.js'

/**
 * adapter 异步加载状态
 * @example
 *   const { adapter, state } = useAdapter('three' as AdapterId);
 *   if (state.value === 'ready') { ... }
 */
export function useAdapter(id: AdapterId): UseAdapterReturn {
  const initialAdapter = getAdapter(id)
  const adapter: Ref<Adapter | null> = ref(initialAdapter ?? null)
  const state: Ref<AdapterState> = ref(initialAdapter?.state ?? 'pending')
  const error: Ref<Error | null> = ref(null)

  async function reload(): Promise<void> {
    state.value = 'loading'
    error.value = null
    const result = await loadAdapterById(id)
    if (result.ok && result.adapter) {
      adapter.value = result.adapter
      state.value = 'ready'
    } else {
      error.value = result.error instanceof Error
        ? result.error
        : new Error(String(result.error ?? 'Unknown error'))
      state.value = 'failed'
    }
  }

  onMounted(() => {
    if (!adapter.value) {
      void reload()
    }
  })

  return { adapter, state, error, reload }
}