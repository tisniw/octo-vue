/**
 * 批量重置多个 store。
 * 对每个 store 调用 $reset(若存在)。
 */
export function resetStores(
  ...stores: Array<{ $reset?: () => void } | undefined>
): void {
  stores.forEach((store) => resetStore(store))
}

/**
 * 单个 store 安全调用 $reset。
 * 若 store 没有 $reset(如 Pinia 未启用 $reset 选项),跳过。
 */
export function resetStore(
  store: { $reset?: () => void } | undefined | null
): void {
  if (!store) return
  if (typeof store.$reset === 'function') {
    store.$reset()
  }
}
