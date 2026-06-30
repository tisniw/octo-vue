import type { AnyObject } from '../../shared/types.js'

/**
 * 深克隆（支持 Date / RegExp / Map / Set / 循环引用）。
 */
export function deepClone<T>(value: T): T {
  const seen = new WeakMap<any, any>()

  function clone(v: any): any {
    if (v === null || typeof v !== 'object') return v
    if (v instanceof Date) return new Date(v.getTime())
    if (v instanceof RegExp) return new RegExp(v.source, v.flags)
    if (v instanceof Map) {
      return new Map(Array.from(v, ([k, val]) => [clone(k), clone(val)]))
    }
    if (v instanceof Set) {
      return new Set(Array.from(v, (val) => clone(val)))
    }
    if (Array.isArray(v)) return v.map((item) => clone(item))
    if (seen.has(v)) return seen.get(v)
    const obj: AnyObject = {}
    seen.set(v, obj)
    for (const key of Object.keys(v)) {
      obj[key] = clone(v[key])
    }
    return obj
  }

  return clone(value)
}

/**
 * 深合并（后写覆盖前写，递归合并对象）。
 */
export function merge<T extends AnyObject, S extends AnyObject>(
  target: T,
  ...sources: S[]
): T & S {
  const result: AnyObject = deepClone(target)

  function assign(to: AnyObject, from: AnyObject): AnyObject {
    for (const key of Object.keys(from)) {
      const fromVal = from[key]
      const toVal = to[key]
      if (
        fromVal &&
        typeof fromVal === 'object' &&
        !Array.isArray(fromVal) &&
        !(fromVal instanceof Date) &&
        !(fromVal instanceof RegExp) &&
        !(fromVal instanceof Map) &&
        !(fromVal instanceof Set) &&
        toVal &&
        typeof toVal === 'object' &&
        !Array.isArray(toVal)
      ) {
        to[key] = assign(toVal, fromVal)
      } else {
        to[key] = fromVal
      }
    }
    return to
  }

  for (const source of sources) {
    assign(result, source)
  }

  return result as T & S
}

/**
 * 挑选指定字段。
 */
export function pick<T extends AnyObject, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result: AnyObject = {}
  for (const key of keys) {
    result[key as unknown as string] = obj[key]
  }
  return result as Pick<T, K>
}

/**
 * 排除指定字段。
 */
export function omit<T extends AnyObject, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const keySet = new Set(keys as unknown as string[])
  const result: AnyObject = {}
  for (const key of Object.keys(obj)) {
    if (!keySet.has(key)) result[key] = obj[key]
  }
  return result as Omit<T, K>
}

/**
 * 挑选满足 predicate 的字段。
 */
export function pickBy<T extends AnyObject>(
  obj: T,
  predicate: (value: T[keyof T], key: keyof T) => boolean
): Partial<T> {
  const result: AnyObject = {}
  for (const [key, value] of Object.entries(obj)) {
    if (predicate(value, key)) result[key] = value
  }
  return result as Partial<T>
}

/**
 * 排除满足 predicate 的字段。
 */
export function omitBy<T extends AnyObject>(
  obj: T,
  predicate: (value: T[keyof T], key: keyof T) => boolean
): Partial<T> {
  return pickBy(obj, (value, key) => !predicate(value, key))
}

function toPath(path: string): (string | number)[] {
  return path
    .replace(/\[(\d+)\]/g, '.$1')
    .split('.')
    .filter(Boolean)
}

/**
 * 按路径读取（支持点路径 'a.b.c' 与数组索引 'a[0]'）。
 */
export function get(obj: any, path: string, defaultValue?: unknown): unknown {
  const keys = toPath(path)
  let current = obj
  for (const key of keys) {
    if (current == null || typeof current !== 'object') return defaultValue
    current = current[key]
  }
  return current === undefined ? defaultValue : current
}

/**
 * 按路径写入（路径不存在则创建）。
 */
export function set(obj: any, path: string, value: unknown): any {
  const keys = toPath(path)
  const result = deepClone(obj)
  let current = result
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    if (i === keys.length - 1) {
      current[key] = value
    } else {
      const nextKey = keys[i + 1]
      current[key] =
        current[key] && typeof current[key] === 'object'
          ? current[key]
          : typeof nextKey === 'number'
            ? []
            : {}
      current = current[key]
    }
  }
  return result
}

/**
 * 判断路径是否存在。
 */
export function has(obj: any, path: string): boolean {
  const keys = toPath(path)
  let current = obj
  for (const key of keys) {
    if (current == null || typeof current !== 'object') return false
    if (!(key in current)) return false
    current = current[key]
  }
  return true
}

/**
 * 类型安全版本的 get。
 */
export function getBy<T = unknown>(obj: any, path: string): T | undefined {
  return get(obj, path) as T | undefined
}

/**
 * 字段值映射。
 */
export function mapValues<T extends AnyObject, R>(
  obj: T,
  mapper: (value: T[keyof T], key: keyof T) => R
): Record<keyof T, R> {
  const result: AnyObject = {}
  for (const [key, value] of Object.entries(obj)) {
    result[key] = mapper(value, key)
  }
  return result as Record<keyof T, R>
}

/**
 * 字段 key 映射。
 */
export function mapKeys<T extends AnyObject>(
  obj: T,
  mapper: (key: keyof T, value: T[keyof T]) => string
): Record<string, T[keyof T]> {
  const result: AnyObject = {}
  for (const [key, value] of Object.entries(obj)) {
    result[mapper(key, value)] = value
  }
  return result as Record<string, T[keyof T]>
}

/**
 * 反转（字段值作 key）。
 */
export function invert<T extends Record<string, PropertyKey>>(
  obj: T
): Record<T[keyof T] & string, keyof T & string> {
  const result: AnyObject = {}
  for (const [key, value] of Object.entries(obj)) {
    result[String(value)] = key
  }
  return result as Record<T[keyof T] & string, keyof T & string>
}

/**
 * 字段数量。
 */
export function size(obj: AnyObject): number {
  return Object.keys(obj).length
}

/**
 * 是否为空对象。
 */
export function isEmpty(obj: AnyObject): boolean {
  return size(obj) === 0
}

/**
 * 深比较（递归比较引用类型，处理 Date / RegExp / Map / Set / 循环引用）。
 */
export function deepEqual<T>(a: T, b: T): boolean {
  const seen = new WeakSet<{ a: any; b: any }>()

  function equal(x: any, y: any): boolean {
    if (x === y) return true
    if (x == null || y == null) return x === y
    if (typeof x !== typeof y) return false

    if (x instanceof Date && y instanceof Date) {
      return x.getTime() === y.getTime()
    }
    if (x instanceof RegExp && y instanceof RegExp) {
      return x.source === y.source && x.flags === y.flags
    }
    if (x instanceof Map && y instanceof Map) {
      if (x.size !== y.size) return false
      for (const [k, v] of x) {
        if (!y.has(k) || !equal(v, y.get(k))) return false
      }
      return true
    }
    if (x instanceof Set && y instanceof Set) {
      if (x.size !== y.size) return false
      for (const v of x) {
        let found = false
        for (const w of y) {
          if (equal(v, w)) {
            found = true
            break
          }
        }
        if (!found) return false
      }
      return true
    }
    if (Array.isArray(x) && Array.isArray(y)) {
      if (x.length !== y.length) return false
      return x.every((v, i) => equal(v, y[i]))
    }
    if (typeof x === 'object') {
      if (seen.has({ a: x, b: y })) return true
      seen.add({ a: x, b: y })
      const keys = Object.keys(x)
      if (keys.length !== Object.keys(y).length) return false
      return keys.every((k) => equal(x[k], y[k]))
    }
    return false
  }

  return equal(a, b)
}

/**
 * 浅比较（仅比较一层，引用相等 / 基本类型相等）。
 */
export function shallowEqual<T>(a: T, b: T): boolean {
  if (a === b) return true
  if (a == null || b == null) return false
  if (typeof a !== 'object' || typeof b !== 'object') return false
  const keysA = Object.keys(a)
  const keysB = Object.keys(b)
  if (keysA.length !== keysB.length) return false
  return keysA.every((k) => (a as any)[k] === (b as any)[k])
}
