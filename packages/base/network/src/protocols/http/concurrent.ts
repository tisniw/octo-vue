/** 全部成功或失败的结构化结果 */
export type SettledResult<T> =
  | { ok: true; value: T }
  | { ok: false; reason: unknown }

/** 全部成功(任一失败抛错) */
export async function all<T>(requests: Promise<T>[]): Promise<T[]> {
  return Promise.all(requests)
}

/** 任一成功(全部失败抛 AggregateError) */
export async function any<T>(requests: Promise<T>[]): Promise<T> {
  return Promise.any(requests)
}

/** 全部完成,返回结构化结果 */
export async function allSettled<T>(requests: Promise<T>[]): Promise<SettledResult<T>[]> {
  const results = await Promise.allSettled(requests)
  return results.map((r) =>
    r.status === 'fulfilled'
      ? { ok: true as const, value: r.value }
      : { ok: false as const, reason: r.reason }
  )
}

/** 串行执行 */
export async function sequence<T>(tasks: (() => Promise<T>)[]): Promise<T[]> {
  const results: T[] = []
  for (const task of tasks) {
    results.push(await task())
  }
  return results
}

/** 数组批量(默认并发 6) */
export async function map<T, R>(
  items: T[],
  mapper: (item: T, index: number) => Promise<R>,
  concurrency = 6
): Promise<R[]> {
  return concurrent(items, mapper, concurrency)
}

/** 限制并发的批量执行 */
export async function concurrent<T, R>(
  items: T[],
  mapper: (item: T, index: number) => Promise<R>,
  concurrency: number
): Promise<R[]> {
  const results: R[] = new Array(items.length)
  let cursor = 0

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (true) {
      const idx = cursor++
      if (idx >= items.length) return
      results[idx] = await mapper(items[idx], idx)
    }
  })

  await Promise.all(workers)
  return results
}