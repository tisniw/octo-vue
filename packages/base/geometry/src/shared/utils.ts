/** 将 value 限制在 [min, max] 区间内 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

/** 生成一个本地唯一 id(足够用于运行时缓存 key) */
let _uid = 0
export function uid(prefix = 'geo'): string {
  return `${prefix}-${++_uid}-${Date.now().toString(36)}`
}

/** 类型守卫:是否为有限数字 */
export function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

/** 类型守卫:是否为普通对象 */
export function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null) return false
  const proto = Object.getPrototypeOf(value)
  return proto === Object.prototype || proto === null
}

/** 类型守卫:是否为数组 */
export function isArray<T>(value: unknown): value is T[] {
  return Array.isArray(value)
}

/** 断言两个浮点数在 EPSILON 范围内相等 */
export function near(a: number, b: number, epsilon = 1e-10): boolean {
  return Math.abs(a - b) <= epsilon
}
