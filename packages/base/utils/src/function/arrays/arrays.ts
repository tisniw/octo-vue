/** 数组去重（基于严格相等） */
export function unique<T>(arr: T[]): T[] {
  return [...new Set(arr)]
}

/** 数组去重（基于 key 函数返回值） */
export function uniqueBy<T>(arr: T[], key: (item: T) => unknown): T[] {
  const seen = new Set<unknown>()
  return arr.filter((item) => {
    const k = key(item)
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
}

/** 交集 */
export function intersection<T>(...arrs: T[][]): T[] {
  if (!arrs.length) return []
  const first = arrs[0]
  const rest = arrs.slice(1)
  return unique(first.filter((v) => rest.every((a) => a.includes(v))))
}

/** 并集 */
export function union<T>(...arrs: T[][]): T[] {
  return unique(arrs.flat())
}

/** 差集 */
export function difference<T>(arr: T[], ...excludes: T[][]): T[] {
  const excludeSet = new Set(excludes.flat())
  return arr.filter((v) => !excludeSet.has(v))
}

/** 按 key 分组 */
export function groupBy<T, K extends PropertyKey>(
  arr: T[],
  key: (item: T) => K
): Record<K, T[]> {
  return arr.reduce((acc, item) => {
    const k = key(item)
    acc[k] = acc[k] ?? []
    acc[k].push(item)
    return acc
  }, {} as Record<K, T[]>)
}

/** 按数量分块 */
export function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size))
  }
  return result
}

/** 二分查找索引（按 predicate 分割为 [true, false]） */
export function partition<T>(
  arr: T[],
  predicate: (item: T) => boolean
): [T[], T[]] {
  const pass: T[] = []
  const fail: T[] = []
  for (const item of arr) {
    if (predicate(item)) pass.push(item)
    else fail.push(item)
  }
  return [pass, fail]
}

/** 按数量等分 */
export function chunkInto<T>(arr: T[], parts: number): T[][] {
  if (parts <= 0) return []
  const size = Math.ceil(arr.length / parts)
  return chunk(arr, size)
}

/** 扁平化（深度） */
export function flatten<T>(arr: any[], depth = Infinity): T[] {
  return depth > 0
    ? arr.reduce(
        (acc, val) =>
          acc.concat(Array.isArray(val) ? flatten(val, depth - 1) : val),
        [] as T[]
      )
    : arr.slice()
}

/** 拉链（交错合并） */
export function zip<T>(...arrs: T[][]): T[][] {
  const len = Math.min(...arrs.map((a) => a.length))
  return Array.from({ length: len }, (_, i) => arrs.map((a) => a[i]))
}

/** 解拉链 */
export function unzip<T>(arr: T[][]): T[][] {
  if (!arr.length) return []
  const len = arr[0].length
  return Array.from({ length: len }, (_, i) => arr.map((row) => row[i]))
}

/** 按 key 升序 */
export function sortBy<T>(
  arr: T[],
  key: (item: T) => number | string
): T[] {
  return [...arr].sort((a, b) => {
    const ka = key(a)
    const kb = key(b)
    return ka < kb ? -1 : ka > kb ? 1 : 0
  })
}

/** 按 key 降序 */
export function sortByDesc<T>(
  arr: T[],
  key: (item: T) => number | string
): T[] {
  return [...arr].sort((a, b) => {
    const ka = key(a)
    const kb = key(b)
    return ka > kb ? -1 : ka < kb ? 1 : 0
  })
}

/** 多 key 排序 */
export function sortByMany<T>(
  arr: T[],
  keys: ((item: T) => number | string)[]
): T[] {
  return [...arr].sort((a, b) => {
    for (const key of keys) {
      const ka = key(a)
      const kb = key(b)
      if (ka < kb) return -1
      if (ka > kb) return 1
    }
    return 0
  })
}

/** Fisher-Yates 洗牌 */
export function shuffle<T>(arr: T[]): T[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/** 求和 */
export function sum<T>(arr: T[], selector?: (item: T) => number): number {
  return arr.reduce((acc, item) => acc + (selector ? selector(item) : Number(item)), 0)
}

/** 平均值 */
export function mean<T>(arr: T[], selector?: (item: T) => number): number {
  if (!arr.length) return 0
  return sum(arr, selector) / arr.length
}

/** 最大值 */
export function max<T>(arr: T[], selector?: (item: T) => number): T | undefined {
  if (!arr.length) return undefined
  let maxItem = arr[0]
  let maxValue = selector ? selector(maxItem) : Number(maxItem)
  for (let i = 1; i < arr.length; i++) {
    const value = selector ? selector(arr[i]) : Number(arr[i])
    if (value > maxValue) {
      maxValue = value
      maxItem = arr[i]
    }
  }
  return maxItem
}

/** 最小值 */
export function min<T>(arr: T[], selector?: (item: T) => number): T | undefined {
  if (!arr.length) return undefined
  let minItem = arr[0]
  let minValue = selector ? selector(minItem) : Number(minItem)
  for (let i = 1; i < arr.length; i++) {
    const value = selector ? selector(arr[i]) : Number(arr[i])
    if (value < minValue) {
      minValue = value
      minItem = arr[i]
    }
  }
  return minItem
}

/** 按 key 计数 */
export function countBy<T, K extends PropertyKey>(
  arr: T[],
  key: (item: T) => K
): Record<K, number> {
  return arr.reduce((acc, item) => {
    const k = key(item)
    acc[k] = (acc[k] ?? 0) + 1
    return acc
  }, {} as Record<K, number>)
}

/** 取第 N 个元素 */
export function nth<T>(arr: T[], n: number): T | undefined {
  return arr[n < 0 ? arr.length + n : n]
}

/** 随机取一个 */
export function sample<T>(arr: T[]): T | undefined {
  if (!arr.length) return undefined
  return arr[Math.floor(Math.random() * arr.length)]
}

/** 随机取 N 个 */
export function sampleSize<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, n)
}

/** 移除 falsy 值 */
export function compact<T>(arr: (T | null | undefined | false | '' | 0)[]): T[] {
  return arr.filter(Boolean) as T[]
}

/** 替换元素 */
export function replaceAt<T>(arr: T[], index: number, value: T): T[] {
  const result = [...arr]
  result[index] = value
  return result
}

/** 移除元素（返回新数组） */
export function without<T>(arr: T[], ...items: T[]): T[] {
  const set = new Set(items)
  return arr.filter((v) => !set.has(v))
}
