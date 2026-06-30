import type { Runtime } from '../../shared/types.js'

/** 是否在浏览器环境（基于 typeof window / document） */
export function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined'
}

/** 是否在 Node 环境（基于 typeof process / process.versions.node） */
export function isNode(): boolean {
  return (
    typeof process !== 'undefined' &&
    !!process.versions?.node
  )
}

/** 是否在 SSR 环境（浏览器 + Node 都有，但服务端渲染上下文） */
export function isSSR(): boolean {
  return typeof window === 'undefined' && isNode()
}

/** 是否在 Web Worker 环境 */
export function isWebWorker(): boolean {
  return (
    typeof importScripts === 'function' &&
    typeof self !== 'undefined'
  )
}

/** 是否在测试环境（基于 import.meta.vitest / NODE_ENV === 'test'） */
export function isTest(): boolean {
  try {
    return (
      (import.meta as any).vitest !== undefined ||
      process.env.NODE_ENV === 'test'
    )
  } catch {
    return false
  }
}

/** 综合运行环境 */
export function getRuntime(): Runtime {
  if (isBrowser()) return 'browser'
  if (isSSR()) return 'ssr'
  if (isWebWorker()) return 'webworker'
  if (isNode()) return 'node'
  if (isTest()) return 'test'
  return 'browser'
}

/** 是否为开发模式（基于 process.env.NODE_ENV） */
export function isDev(): boolean {
  try {
    return process.env.NODE_ENV === 'development'
  } catch {
    return false
  }
}

/** 是否为生产模式 */
export function isProd(): boolean {
  try {
    return process.env.NODE_ENV === 'production'
  } catch {
    return false
  }
}

/** 当前模式 */
export function getMode(): 'development' | 'production' | 'test' {
  try {
    const env = process.env.NODE_ENV
    if (env === 'development') return 'development'
    if (env === 'production') return 'production'
    if (env === 'test') return 'test'
  } catch {
    // ignore
  }
  return 'production'
}

function randomBase36(length: number): string {
  let result = ''
  for (let i = 0; i < length; i++) {
    result += Math.floor(Math.random() * 36).toString(36)
  }
  return result
}

/** 生成唯一 ID（基于时间戳 + 随机数，默认 8 位随机部分） */
export function generateId(length = 8, prefix = ''): string {
  return `${prefix}${Date.now().toString(36)}${randomBase36(length)}`
}

/** 安全 JSON 解析（失败返回 fallback） */
export function safeJsonParse<T = unknown>(
  text: string,
  fallback?: T
): T | undefined {
  try {
    return JSON.parse(text) as T
  } catch {
    return fallback
  }
}

/** 安全 JSON 字符串化（失败返回 fallback） */
export function safeJsonStringify(
  value: unknown,
  fallback?: string
): string | undefined {
  try {
    return JSON.stringify(value)
  } catch {
    return fallback
  }
}

/** 是否为字符串 */
export function isString(value: unknown): value is string {
  return typeof value === 'string'
}

/** 是否为数字（排除 NaN） */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value)
}

/** 是否为布尔 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean'
}

/** 是否为 null */
export function isNull(value: unknown): value is null {
  return value === null
}

/** 是否为 undefined */
export function isUndefined(value: unknown): value is undefined {
  return value === undefined
}

/** 是否为 null 或 undefined */
export function isNil(value: unknown): value is null | undefined {
  return value == null
}

/** 是否为 Symbol */
export function isSymbol(value: unknown): value is symbol {
  return typeof value === 'symbol'
}

/** 是否为数组（包含 readonly 数组） */
export function isArray<T = unknown>(value: unknown): value is T[] {
  return Array.isArray(value)
}

/** 是否为对象（排除 null，包含函数） */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

/** 是否为纯对象（Object / 字面量，排除 class 实例 / 函数 / null） */
export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Object.prototype.toString.call(value) === '[object Object]'
}

/** 是否为函数 */
export function isFunction(value: unknown): value is (...args: any[]) => any {
  return typeof value === 'function'
}

/** 是否为 Date 实例（排除无效日期） */
export function isDate(value: unknown): value is Date {
  return value instanceof Date && !Number.isNaN(value.getTime())
}

/** 是否为 RegExp 实例 */
export function isRegExp(value: unknown): value is RegExp {
  return value instanceof RegExp
}

/** 是否为 Promise（含 PromiseLike） */
export function isPromise<T = unknown>(value: unknown): value is PromiseLike<T> {
  return (
    value !== null &&
    (typeof value === 'object' || typeof value === 'function') &&
    typeof (value as any).then === 'function'
  )
}

/** 是否为 Map 实例 */
export function isMap<K = unknown, V = unknown>(value: unknown): value is Map<K, V> {
  return value instanceof Map
}

/** 是否为 Set 实例 */
export function isSet<T = unknown>(value: unknown): value is Set<T> {
  return value instanceof Set
}

/** 是否为 Element 节点（基于 Node.ELEMENT_NODE） */
export function isElement(value: unknown): value is Element {
  return value instanceof Element
}

/** 是否为空：对象零字段 / 数组零长度 / 字符串空 / null / undefined / Map / Set 零大小 */
export function isEmpty(value: unknown): boolean {
  if (value == null) return true
  if (typeof value === 'string') return value === ''
  if (Array.isArray(value)) return value.length === 0
  if (value instanceof Map || value instanceof Set) return value.size === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}
