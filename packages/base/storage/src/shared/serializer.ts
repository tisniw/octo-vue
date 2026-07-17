import type { StorageValue } from './types'

// 序列化器接口,Web Storage 适配器在 set 与 get 时调用,IndexedDB 适配器无需 JSON 序列化
export interface Serializer<T extends StorageValue = StorageValue> {
  serialize(value: T): string
  deserialize(raw: string): T
}

// 默认 JSON 序列化器
export const jsonSerializer: Serializer = {
  serialize: (value) => JSON.stringify(value),
  deserialize: (raw) => JSON.parse(raw) as StorageValue,
}
