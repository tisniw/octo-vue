import { defineStore, type Store } from 'pinia'
import type { DefineStoreOptions, StateTree } from 'pinia'
import type { StoreOptions } from './types'

/**
 * 类型化 Pinia store 工厂。
 * 完全兼容 Pinia 的 DefineStoreOptions,新增 persistKey / persist 字段。
 */
export function createStore<
  Id extends string,
  S extends StateTree,
  G = {},
  A = {}
>(
  id: Id,
  options: StoreOptions<Id, S, G, A>
): () => Store<Id, S, G, A> {
  return defineStore(
    id,
    options as unknown as DefineStoreOptions<Id, S, G, A>
  ) as unknown as () => Store<Id, S, G, A>
}
