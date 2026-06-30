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

/**
 * 自动持久化 Pinia store 到 localStorage。
 * 使用方式:pinia.use(persistPlugin)
 *
 * 行为:
 * 1. 启动时,任何带 persistKey 的 store 从 localStorage 回填
 * 2. 状态变更时,自动写入 localStorage
 * 3. 反序列化失败静默忽略,等同空状态
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
    } = {},
  } = options

  const fullKey = `${keyPrefix}${persistKey}`

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
  ctx.store.$subscribe(
    (mutation, state) => {
      try {
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
    },
    { detached: true }
  )
}
