import { RESERVED_BUILTIN_THEME_NAMES } from './theme.js'
import { ThemeError } from './color.js'
import { getThemeMeta } from './tokens.js'
import { resolveVariant } from './visual-style/resolve.js'
import {
  lightPreset,
} from './presets.js'
import type {
  BuiltinThemeEntry,
  BuiltinThemePackage,
  RegisterBuiltinThemeOptions,
  ThemeConfig,
  ThemeMeta,
} from './types.js'

/** 内置主题注册表 (动态累积) */
export const builtinThemes: BuiltinThemeEntry[] = []

function ensureNotReserved(name: string): void {
  if (RESERVED_BUILTIN_THEME_NAMES.includes(name)) {
    throw new ThemeError(
      `[octovue/theme] builtin theme '${name}' is reserved`,
      { kind: 'reserved-name', module: 'preset-builtin' },
    )
  }
}

function ensureNotDuplicate(name: string): void {
  if (builtinThemes.some((entry) => entry.id === name)) {
    throw new ThemeError(
      `[octovue/theme] builtin theme '${name}' already registered`,
      { kind: 'duplicate-registration', module: 'preset-builtin' },
    )
  }
}

/** 注册单个内置主题 */
export function registerBuiltinTheme(options: RegisterBuiltinThemeOptions): void {
  const theme: ThemeConfig = { ...options.theme, source: 'builtin' }
  ensureNotReserved(theme.name)

  // 保留字抛错;非保留 builtin 重复允许后注册覆盖先注册
  // (保留字已被 ensureNotReserved 抛错,这里只处理非保留重复)
  const existingIdx = builtinThemes.findIndex((entry) => entry.id === theme.name)
  if (existingIdx >= 0) {
    builtinThemes.splice(existingIdx, 1)
  }

  const meta: ThemeMeta | undefined = options.meta
    ? {
        id: theme.name,
        label: options.meta.label ?? theme.label,
        mode: options.meta.mode ?? theme.mode,
        source: 'builtin',
        preview: options.meta.preview ?? theme.bgTokens.primary,
      }
    : undefined

  builtinThemes.push({
    id: theme.name,
    config: theme,
    meta: meta
      ? { label: meta.label, description: undefined, preview: meta.preview }
      : { label: theme.label, description: undefined, preview: theme.bgTokens.primary },
    ...(options.priority !== undefined ? { priority: options.priority } : {}),
  })
}

/**
 * 批量注册内置主题包。
 *
 * 关键行为:对保留 builtin(如 themes 中包含 light / dark) **跳过而非失败**,
 * 保证包内主题与基线主题的兼容性;对重复 builtin (非保留) 后注册覆盖先注册。
 */
export function registerBuiltinThemePackage(pkg: BuiltinThemePackage): void {
  for (const theme of pkg.themes) {
    try {
      const meta = pkg.meta?.[theme.name]
      registerBuiltinTheme({ theme, meta, priority: pkg.priority })
    } catch (err) {
      if (
        err instanceof ThemeError &&
        (err.kind === 'reserved-name' || err.kind === 'duplicate-registration')
      ) {
        // 跳过保留 builtin (与基线 light / dark 兼容)
        continue
      }
      throw err
    }
  }
}

/**
 * 按 id 解析已注册的内置主题。
 *
 * - id = 'light' / 'dark': 走 VisualStyle 子变体路径,转发到 light.exclusive.clean
 *   / dark.exclusive.midnight;若 VisualStyle 未注册则降级返回 null
 * - 其它 id: 直接查 builtinThemes 表
 */
export function resolveBuiltinTheme(id: string): ThemeConfig | null {
  if (id === 'light' || id === 'dark') {
    const variantId = id === 'light' ? 'clean' : 'midnight'
    const variant = resolveVariant(id, variantId, 'exclusive')
    return variant ? variant.themeConfig : null
  }
  const entry = builtinThemes.find((t) => t.id === id)
  return entry ? entry.config : null
}

/**
 * 列出全部已注册内置主题 (按 priority 降序,无 priority 视为 0)。
 * 不同 priority 之间按 priority 降序;同 priority 间按注册顺序保持稳定。
 */
export function listBuiltinThemes(): BuiltinThemeEntry[] {
  return builtinThemes
    .slice()
    .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))
}

/** 列出全部内置主题 meta (按 priority 降序) */
export function listBuiltinThemeMetas(): ThemeMeta[] {
  return listBuiltinThemes().map((entry) =>
    getThemeMeta({
      name: entry.id,
      label: entry.meta?.label ?? entry.config.label,
      mode: entry.config.mode,
      tokens: entry.config.tokens,
      bgTokens: entry.config.bgTokens,
    } as ThemeConfig),
  )
}

/**
 * 内置主题保护切换:仅 'light' / 'dark'。
 *
 * 非 builtin 抛错;VisualStyle 未注册时抛错。
 */
export function applyBuiltin(manager: { apply(theme: ThemeConfig): void }, id: 'light' | 'dark'): void {
  const builtin = resolveBuiltinTheme(id)
  if (!builtin || builtin.source !== 'builtin') {
    throw new ThemeError(`[octovue/theme] ${id} is not a builtin theme`, {
      kind: 'not-found',
      module: 'preset-builtin',
    })
  }
  manager.apply(builtin)
}

/**
 * 包初始化时注册基线扁平 builtin 主题。
 *
 * - `light` / `dark` 不再以扁平 builtin 主题名出现,改走 VisualStyle 子变体路径
 * - `white` / `black` 保留为通用变体
 *
 * builtinThemes 注册顺序由 0.0.7+ 视觉层重构: 仅 light 保留为 builtin flat theme 名。
 * 旧的 white / black 通用变体已迁入 universalVariants(本版本移除)。
 */
void lightPreset
