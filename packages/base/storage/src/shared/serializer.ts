import type { StorageValue } from './types'

/**
 * 安全的 JSON 序列化辅助。
 * Web Storage 适配器在 set 时调用 serialize,在 get 时调用 deserialize。
 * IndexedDB 适配器直接存储 Blob / File,无需 JSON 序列化(由 IndexedDB 原生支持)。
 */
export interface Serializer<T extends StorageValue = StorageValue> {
  serialize(value: T): string
  deserialize(raw: string): T
}

/** 默认 JSON 序列化器 */
export const jsonSerializer: Serializer = {
  serialize: (value) => JSON.stringify(value),
  deserialize: (raw) => JSON.parse(raw) as StorageValue,
}
