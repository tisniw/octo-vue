import type { StorageAdapter } from './types'

/**
 * 纯内存适配器,基于 Map。
 * 适用于 SSR / 单元测试 / 短期缓存。
 */
export function createMemoryAdapter(): StorageAdapter {
  const store = new Map<string, unknown>()

  return {
    get<V>(key: string): V | undefined {
      return store.has(key) ? (store.get(key) as V) : undefined
    },
    set(key: string, value: unknown): void {
      store.set(key, value)
    },
    remove(key: string): void {
      store.delete(key)
    },
    keys(): string[] {
      return Array.from(store.keys())
    },
    clear(): void {
      store.clear()
    },
  }
}
