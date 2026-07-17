import type { PiniaPluginContext } from 'pinia'
import type { StoreOptions } from './types'

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    value !== null &&
    typeof value === 'object' &&
    Object.prototype.toString.call(value) === '[object Object]'
  )
}

function pick<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = obj[key]
    }
  }
  return result
}

// 简易防抖,返回 debounced 函数 + cancel 方法,避免定时器泄露
function debounce<A extends any[]>(
  fn: (...args: A) => void,
  ms: number
): { invoke: (...args: A) => void; cancel: () => void } {
  let timer: ReturnType<typeof setTimeout> | null = null
  let lastArgs: A | null = null

  return {
    invoke(...args: A) {
      lastArgs = args
      if (timer !== null) clearTimeout(timer)
      timer = setTimeout(() => {
        timer = null
        if (lastArgs) {
          const a = lastArgs
          lastArgs = null
          fn(...a)
        }
      }, ms)
    },
    cancel() {
      if (timer !== null) {
        clearTimeout(timer)
        timer = null
      }
      lastArgs = null
    },
  }
}

/** 自动持久化 Pinia store 到 localStorage。pinia.use(persistPlugin)
 *
 * 行为:
 * 1. 启动时,任何带 persistKey 的 store 从 localStorage 回填
 * 2. 状态变更时自动写入 localStorage
 * 3. 反序列化失败静默忽略,等同空状态
 * 4. debounceMs > 0 时合并多次写入,避免主线程阻塞
 */
export function persistPlugin(ctx: PiniaPluginContext): void {
  const options = ctx.options as StoreOptions<string, any, any, any>

  // 仅接管带 persistKey 的 store
  if (!options.persistKey) return

  // SSR 环境不存在 localStorage,直接跳过
  if (typeof localStorage === 'undefined') return

  const {
    persistKey,
    persist: {
      paths,
      serializer = {
        serialize: JSON.stringify,
        deserialize: JSON.parse,
      },
      keyPrefix = 'octovue:store:',
      debounceMs = 0,
    } = {},
  } = options

  const fullKey = `${keyPrefix}${persistKey}`

  // 实际写盘逻辑,抽出来便于同步与防抖复用
  const flush = (): void => {
    try {
      const state = ctx.store.$state as Record<string, any>
      const dataToSave = paths && paths.length > 0 ? pick(state, paths) : state
      localStorage.setItem(fullKey, serializer.serialize(dataToSave))
    } catch (err) {
      // QuotaExceededError:业务方监听处理
      if (err instanceof Error && err.name === 'QuotaExceededError') {
        console.warn(
          `[octovue/storage] Failed to persist store "${persistKey}": quota exceeded`
        )
      }
    }
  }

  // 1. 启动时回填
  try {
    const raw = localStorage.getItem(fullKey)
    if (raw !== null) {
      const data = serializer.deserialize(raw)
      if (isPlainObject(data)) {
        if (paths && paths.length > 0) {
          // paths 模式:仅 patch 指定字段
          ctx.store.$patch(pick(data, paths) as any)
        } else {
          // 全量替换
          ctx.store.$patch(data as any)
        }
      }
    }
  } catch {
    // 反序列化失败:静默忽略,等同空状态
  }

  // 2. 状态变更时写入
  // debounceMs > 0 走防抖,否则直接同步写入
  if (debounceMs > 0) {
    const d = debounce(flush, debounceMs)
    ctx.store.$subscribe(() => d.invoke(), { detached: true })
  } else {
    ctx.store.$subscribe(() => flush(), { detached: true })
  }
}