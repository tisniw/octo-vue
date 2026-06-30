interface TTLCacheEntry<V> {
  value: V
  /** 过期时间戳(Date.now() 毫秒) */
  expires: number
}

/**
 * TTL(Time-To-Live)缓存。
 * 每个条目有过期时间戳,过期后自动清理。
 */
export class TTLCache<K, V> {
  /** 默认 TTL(毫秒);set 时可覆盖 */
  readonly defaultTTL: number

  protected readonly map = new Map<K, TTLCacheEntry<V>>()

  constructor(defaultTTL: number) {
    if (defaultTTL <= 0) {
      throw new Error('TTLCache defaultTTL must be > 0')
    }
    this.defaultTTL = defaultTTL
  }

  /** 取值;命中过期自动清理 */
  get(key: K): V | undefined {
    const entry = this.map.get(key)
    if (!entry) return undefined
    if (Date.now() >= entry.expires) {
      this.map.delete(key)
      return undefined
    }
    return entry.value
  }

  /** 设值;ttl 不传则用 defaultTTL */
  set(key: K, value: V, ttl?: number): void {
    const expires = Date.now() + (ttl ?? this.defaultTTL)
    this.map.set(key, { value, expires })
  }

  /** 检查存在(同时清理过期) */
  has(key: K): boolean {
    return this.get(key) !== undefined
  }

  /** 删除 */
  delete(key: K): boolean {
    return this.map.delete(key)
  }

  /** 当前条目数(含过期未清理的) */
  get size(): number {
    return this.map.size
  }

  /** 主动遍历清理过期条目 */
  prune(): number {
    const now = Date.now()
    let removed = 0
    for (const [key, entry] of this.map) {
      if (now >= entry.expires) {
        this.map.delete(key)
        removed++
      }
    }
    return removed
  }

  /** 清空 */
  clear(): void {
    this.map.clear()
  }

  /** 所有 key(可能含过期未清理的) */
  keys(): IterableIterator<K> {
    return this.map.keys()
  }
}
