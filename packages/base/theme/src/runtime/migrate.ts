import {
  THEME_STORAGE_KEY,
  LEGACY_KEYS,
  VS_UNIVERSAL_ACTIVE_KEY,
} from '../theme/theme.js'
import type { MigrationResult } from '../theme/types.js'
import { isBrowser } from '../theme/color.js'
import {
  loadThemeConfig,
  saveThemeConfig,
  rawGet,
  rawKeys,
  rawRemove,
  isUniversalActiveEnabled,
  setUniversalActiveEnabled,
} from './persist.js'

interface MigrateOptions {
  /** 迁移完成后是否删除旧 key (缺省 true) */
  readonly clearAfter?: boolean
}

interface LegacySnapshot {
  readonly sourceVisualStyleId?: string
  readonly sourceVariantId?: string
  readonly sourceScope?: 'exclusive' | 'universal' | 'auto'
  readonly sourceMode?: string
  readonly sourceThemeName?: string
  readonly sourceThemeConfigJson?: string
  readonly legacyKeys: readonly string[]
}

/**
 * 读取旧版 (5 个 key) 的 localStorage 数据并合并入 PersistedThemeConfig 主键。
 *
 * 旧 key 列表 (持久化键与 vs 子键):
 *   - octovue-theme-config
 *   - octovue-vs:current
 *   - octovue-vs:{vsId}:variant
 *   - octovue-vs:{vsId}:mode
 *   - octovue-vs:universal-active
 *
 * 行为:
 *   - 读取上述 key 中存在的项
 *   - 合并到新的 octovue-theme 主键,补 visualStyleId / variantId / scope 字段
 *   - 默认 clearAfter: true, 迁移完成后删除旧 key
 *   - SSR 环境直接返回 migrated: false
 */
export function migrateLegacyVisualStyleKeys(options: MigrateOptions = {}): MigrationResult {
  if (!isBrowser()) {
    return {
      migrated: false,
      details: { legacyKeysFound: [], clearedKeys: [] },
    }
  }

  const clearedKeys: string[] = []
  const snapshot = collectLegacySnapshot(clearedKeys)
  const legacyKeysFound = snapshot.legacyKeys

  const persisted = loadThemeConfig()
  const baseCurrentName = persisted?.currentName
  const baseSource = persisted?.source ?? 'builtin'
  const baseCustom = persisted?.custom ?? null

  const currentName = snapshot.sourceThemeName ?? baseCurrentName
  if (!currentName) {
    // 没有可迁移的来源数据,直接返回
    if (options.clearAfter !== false) finalizeClear(Array.from(legacyKeysFound), clearedKeys)
    return {
      migrated: legacyKeysFound.length > 0,
      details: {
        legacyKeysFound,
        clearedKeys: options.clearAfter !== false ? Array.from(clearedKeys) : [],
      },
    }
  }

  const payload = {
    version: 1 as const,
    currentName,
    source: baseSource,
    custom: baseCustom,
    appliedAt: Date.now(),
    ...(snapshot.sourceVisualStyleId ? { visualStyleId: snapshot.sourceVisualStyleId } : {}),
    ...(snapshot.sourceVariantId ? { variantId: snapshot.sourceVariantId } : {}),
    ...(snapshot.sourceScope ? { scope: snapshot.sourceScope } : {}),
  }

  saveThemeConfig(payload)

  // 子键 universal-active: 同步合并
  // (原 key 已合并到主键,但文档仍把 universal-active 视作独立子键)
  // 此处仅在主键已含 visualStyleId/variantId/scope 时同步设置子键
  if (snapshot.sourceVisualStyleId && snapshot.sourceVariantId) {
    setUniversalActiveEnabled(isUniversalActiveEnabled())
  }

  if (options.clearAfter !== false) {
    finalizeClear(Array.from(legacyKeysFound), clearedKeys)
  }

  return {
    migrated: true,
    details: {
      legacyKeysFound,
      ...(snapshot.sourceVisualStyleId ? { sourceVisualStyleId: snapshot.sourceVisualStyleId } : {}),
      ...(snapshot.sourceVariantId ? { sourceVariantId: snapshot.sourceVariantId } : {}),
      ...(snapshot.sourceScope ? { sourceScope: snapshot.sourceScope } : {}),
      clearedKeys: options.clearAfter !== false ? Array.from(clearedKeys) : [],
    },
  }
}

function collectLegacySnapshot(clearedKeys: string[]): LegacySnapshot {
  const legacyKeys: string[] = []
  let themeName: string | undefined
  let themeConfigJson: string | undefined
  let visualStyleId: string | undefined
  let variantId: string | undefined
  let mode: string | undefined
  let scope: 'exclusive' | 'universal' | 'auto' | undefined

  // 1. octovue-theme-config (旧版 PersistedThemeConfig-style payload or 整个 theme config JSON)
  const oldThemeConfig = rawGet(LEGACY_KEYS.THEME_CONFIG)
  if (oldThemeConfig !== undefined && oldThemeConfig !== null) {
    legacyKeys.push(LEGACY_KEYS.THEME_CONFIG)
    if (typeof oldThemeConfig === 'object' && oldThemeConfig !== null) {
      const obj = oldThemeConfig as Record<string, unknown>
      if (typeof obj.currentName === 'string') themeName = obj.currentName
      if (typeof obj.themeName === 'string') themeName = obj.themeName
      if (typeof obj.theme === 'string') themeConfigJson = obj.theme
    } else if (typeof oldThemeConfig === 'string') {
      themeConfigJson = oldThemeConfig
    }
  }

  // 2. octovue-vs:current (旧 VisualStyleId)
  const oldCurrent = rawGet(LEGACY_KEYS.VS_CURRENT)
  if (typeof oldCurrent === 'string' && oldCurrent.length > 0) {
    legacyKeys.push(LEGACY_KEYS.VS_CURRENT)
    visualStyleId = oldCurrent
  }

  // 3. octovue-vs:{vsId}:variant (旧 variantId)
  // 通过遍历所有 keys 找后缀为 :variant 的旧 key
  const allKeys = rawKeys()
  const variantSuffix = LEGACY_KEYS.VS_VARIANT_SUFFIX
  const modeSuffix = LEGACY_KEYS.VS_MODE_SUFFIX
  for (const k of allKeys) {
    if (k.endsWith(variantSuffix) && k.startsWith(LEGACY_KEYS.VS_VARIANT_PREFIX)) {
      const v = rawGet(k)
      if (typeof v === 'string' && v.length > 0) {
        legacyKeys.push(k)
        if (!variantId) variantId = v
        const vsFromKey = k.slice(LEGACY_KEYS.VS_VARIANT_PREFIX.length, -variantSuffix.length)
        if (!visualStyleId) visualStyleId = vsFromKey
      }
    } else if (k.endsWith(modeSuffix) && k.startsWith(LEGACY_KEYS.VS_VARIANT_PREFIX)) {
      const v = rawGet(k)
      if (typeof v === 'string' && v.length > 0) {
        legacyKeys.push(k)
        if (!mode) mode = v
      }
    }
  }

  // 4. scope 推断: 有 variantId → 默认 exclusive;universal-active=false 时 scope=exclusive,否则保持
  if (variantId) {
    const universal = isUniversalActiveEnabled()
    scope = universal ? 'universal' : 'exclusive'
  }
  if (mode) {
    // mode 字段是 VisualMode (e.g. 'pine-mist'),当 scope='auto' 时记录
    scope = 'auto'
  }

  // themeName 推优:visualStyleId + variantId → "vsId/variantId"
  if (visualStyleId && variantId && !themeName) {
    themeName = `${visualStyleId}/${variantId}`
  }

  return {
    ...(visualStyleId ? { sourceVisualStyleId: visualStyleId } : {}),
    ...(variantId ? { sourceVariantId: variantId } : {}),
    ...(scope ? { sourceScope: scope } : {}),
    ...(mode ? { sourceMode: mode } : {}),
    ...(themeName ? { sourceThemeName: themeName } : {}),
    ...(themeConfigJson ? { sourceThemeConfigJson: themeConfigJson } : {}),
    legacyKeys,
  }
}

function finalizeClear(legacyKeys: string[], clearedKeys: string[]): void {
  for (const key of legacyKeys) {
    rawRemove(key)
    clearedKeys.push(key)
  }
  // 同时清掉 universal-active 子键(已合并到主键 context, 但保留独立子键可保留;
  // 此处保守起见不主动清它,以免影响其它模块读它)
  void VS_UNIVERSAL_ACTIVE_KEY
  void THEME_STORAGE_KEY
}
