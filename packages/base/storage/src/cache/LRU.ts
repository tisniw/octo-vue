/**
 * LRU(Least Recently Used)缓存。
 * 基于 Map 的迭代顺序实现"最近使用"语义,
 * 容量超限时自动淘汰最久未访问的条目
 */
export class LRUCache<K, V> {
  // 内部 Map,迭代顺序即访问顺序,末尾最新,头部最旧
  protected readonly map = new Map<K, V>()

  // 最大条目数,超限时淘汰头部
  readonly maxSize: number

  constructor(maxSize: number) {
    if (maxSize <= 0) {
      throw new Error('LRUCache maxSize must be > 0')
    }
    this.maxSize = maxSize
  }

  // 取值,命中后立即移至末尾代表"最近使用"
  get(key: K): V | undefined {
    if (!this.map.has(key)) return undefined
    const value = this.map.get(key)!
    // 重新 set 移至末尾
    this.map.delete(key)
    this.map.set(key, value)
    return value
  }

  // 设值,超限时淘汰头部
  set(key: K, value: V): void {
    // 若已存在,先删再 set,避免顺序错误
    if (this.map.has(key)) {
      this.map.delete(key)
    }
    this.map.set(key, value)
    // 超限淘汰
    if (this.map.size > this.maxSize) {
      const oldestKey = this.map.keys().next().value as K
      this.map.delete(oldestKey)
    }
  }

  // 检查存在,不更新访问顺序
  has(key: K): boolean {
    return this.map.has(key)
  }

  // 删除
  delete(key: K): boolean {
    return this.map.delete(key)
  }

  // 清空
  clear(): void {
    this.map.clear()
  }

  // 当前条目数
  get size(): number {
    return this.map.size
  }

  // 所有 key,从最旧到最新
  keys(): IterableIterator<K> {
    return this.map.keys()
  }

  // 所有 value
  values(): IterableIterator<V> {
    return this.map.values()
  }

  // 所有 entries
  entries(): IterableIterator<[K, V]> {
    return this.map.entries()
  }

  // 默认迭代器,从最旧到最新
  [Symbol.iterator](): IterableIterator<[K, V]> {
    return this.map.entries()
  }
}
