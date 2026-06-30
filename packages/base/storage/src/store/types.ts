import type { DefineStoreOptions, StateTree } from 'pinia'

/** 持久化选项 */
export interface PersistOptions {
  /** 仅持久化指定字段 */
  paths?: string[]
  /** 自定义序列化器(默认 JSON.stringify / JSON.parse) */
  serializer?: {
    serialize: (value: unknown) => string
    deserialize: (raw: string) => unknown
  }
  /** 持久化目标 key 前缀(默认 'octovue:store:') */
  keyPrefix?: string
}

/**
 * 扩展自 DefineStoreOptions,新增持久化字段。
 */
export interface StoreOptions<Id extends string, S extends StateTree, G, A>
  extends Omit<DefineStoreOptions<Id, S, G, A>, 'id'> {
  /**
   * 持久化 key。若设置,store 自动同步到 localStorage。
   * 不设置则不持久化(等同直接 defineStore)。
   */
  persistKey?: string

  /** 持久化选项 */
  persist?: PersistOptions
}
