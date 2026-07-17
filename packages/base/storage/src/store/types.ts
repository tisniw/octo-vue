import type { DefineStoreOptions, StateTree } from 'pinia'

// 持久化选项
export interface PersistOptions {
  // 仅持久化指定字段
  paths?: string[]
  // 自定义序列化器,默认 JSON.stringify 与 JSON.parse
  serializer?: {
    serialize: (value: unknown) => string
    deserialize: (raw: string) => unknown
  }
  // 持久化目标 key 前缀,默认 'octovue:store:'
  keyPrefix?: string
  // 写入防抖时间,毫秒,在该时间窗口内的多次状态变更合并为一次写入,显著降低主线程阻塞;0 或 undefined 表示同步立即写入,默认行为
  debounceMs?: number
}

/**
 * 扩展自 DefineStoreOptions,新增持久化字段
 */
export interface StoreOptions<Id extends string, S extends StateTree, G, A>
  extends Omit<DefineStoreOptions<Id, S, G, A>, 'id'> {
  /**
   * 持久化 key。
   * 若设置,store 自动同步到 localStorage;
   * 不设置则不持久化,等同直接 defineStore
   */
  persistKey?: string

  // 持久化选项
  persist?: PersistOptions
}
