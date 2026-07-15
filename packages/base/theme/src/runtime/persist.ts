import { localStorageAdapter } from '@octovue/storage/db'
import { StorageError } from '@octovue/storage/shared'
import type { StorageAdapter } from '@octovue/storage/db'
import {
  THEME_STORAGE_KEY,
  VS_UNIVERSAL_ACTIVE_KEY,
  VS_AUTO_ENABLED_KEY,
  encodeBoolFlag,
  decodeBoolFlag,
} from '../theme/theme.js'
import { isBrowser } from '../theme/color.js'
import type { PersistedThemeConfig } from '../theme/types.js'

/** 静默包装: 捕获 StorageError 走 console 警告 */
export function safeRun(op: () => void, label: string): void {
  try {
    op()
  } catch (err) {
    if (err instanceof StorageError) {
      console.warn(`[octovue/theme] ${label} failed [${err.kind}]:`, err.message, err.cause)
    } else {
      console.warn(`[octovue/theme] ${label} failed:`, err)
    }
  }
}

/** 获取当前环境可用的 storage 适配器 (SSR 守卫) */
export function getStorageOrNull(adapter: StorageAdapter): StorageAdapter | null {
  if (!isBrowser()) return null
  return adapter
}

/** 写入持久化主题配置 */
export function saveThemeConfig(payload: PersistedThemeConfig): void {
  const storage = getStorageOrNull(localStorageAdapter)
  if (!storage) return
  safeRun(
    () => storage.set(THEME_STORAGE_KEY, payload as unknown as Record<string, unknown>),
    'saveThemeConfig',
  )
}

/** 读取持久化主题配置 */
export function loadThemeConfig(): PersistedThemeConfig | null {
  const storage = getStorageOrNull(localStorageAdapter)
  if (!storage) return null
  try {
    const parsed = storage.get<PersistedThemeConfig>(THEME_STORAGE_KEY) as PersistedThemeConfig | undefined
    if (!parsed) return null
    if (parsed.version !== 1) return null
    return parsed
  } catch {
    return null
  }
}

/** 清除持久化主题配置 */
export function clearThemeConfig(): void {
  const storage = getStorageOrNull(localStorageAdapter)
  if (!storage) return
  safeRun(() => storage.remove(THEME_STORAGE_KEY), 'clearThemeConfig')
}

/** 读取 universal-active 子键 (缺省 true) */
export function isUniversalActiveEnabled(): boolean {
  const storage = getStorageOrNull(localStorageAdapter)
  if (!storage) return true
  try {
    const v = storage.get<unknown>(VS_UNIVERSAL_ACTIVE_KEY)
    return decodeBoolFlag(v, true)
  } catch {
    return true
  }
}

/** 写入 universal-active 子键 */
export function setUniversalActiveEnabled(value: boolean): void {
  const storage = getStorageOrNull(localStorageAdapter)
  if (!storage) return
  safeRun(
    () => storage.set(VS_UNIVERSAL_ACTIVE_KEY, encodeBoolFlag(value)),
    'setUniversalActiveEnabled',
  )
}

/** 读取 auto-enabled 子键 (缺省 false) */
export function isAutoEnabled(): boolean {
  const storage = getStorageOrNull(localStorageAdapter)
  if (!storage) return false
  try {
    const v = storage.get<unknown>(VS_AUTO_ENABLED_KEY)
    return decodeBoolFlag(v, false)
  } catch {
    return false
  }
}

/** 写入 auto-enabled 子键 */
export function setAutoEnabled(value: boolean): void {
  const storage = getStorageOrNull(localStorageAdapter)
  if (!storage) return
  safeRun(
    () => storage.set(VS_AUTO_ENABLED_KEY, encodeBoolFlag(value)),
    'setAutoEnabled',
  )
}

/** Internal: 直接读 raw 值 (仅供 migrate 使用) */
export function rawGet(key: string): unknown {
  const storage = getStorageOrNull(localStorageAdapter)
  if (!storage) return undefined
  try {
    return storage.get(key) as unknown
  } catch {
    return undefined
  }
}

/** Internal: 直接 remove (仅供 migrate 使用) */
export function rawRemove(key: string): void {
  const storage = getStorageOrNull(localStorageAdapter)
  if (!storage) return
  safeRun(() => storage.remove(key), `rawRemove(${key})`)
}

/** Internal: 列举所有 namespace 内的 keys */
export function rawKeys(): string[] {
  const storage = getStorageOrNull(localStorageAdapter)
  if (!storage) return []
  try {
    return storage.keys() as string[]
  } catch {
    return []
  }
}
