import { THEME_STORAGE_KEY_NAMESPACED } from '../theme/theme.js'
import { deepClone, isBrowser } from '../theme/color.js'
import { buildCssVariables } from '../core/index.js'
import { validateTheme, isThemeEqual } from '../theme/tokens.js'
import {
  applyCssVariables,
  removeCssVariables,
  injectTransitionStyles,
  removeTransitionStyles,
} from './dom.js'
import { saveThemeConfig, loadThemeConfig } from './persist.js'
import type {
  CreateThemeManagerOptions,
  PersistedThemeConfig,
  ThemeConfig,
  ThemeManagerState,
} from '../theme/types.js'

type Listener = (state: ThemeManagerState) => void

/**
 * 应用端 theme-extensions 目录描述。
 * 资源 URL 由消费者拼接:`${manager.getAppExtensionsPath()}/light/clean/cover.jpg`。
 */
interface AppExtensionsState {
  path: string
}

/** 主题运行时管理器 */
export class ThemeManager {
  private state: ThemeManagerState
  private readonly listeners = new Set<Listener>()
  private applyingFromLocal = false
  private storageHandler: ((e: StorageEvent) => void) | null = null
  private appExtensions: AppExtensionsState | null = null

  /**
   * 当前激活主题所属视觉层上下文(由 `applyVariantOnManager` 写入,
   * 用于持久化跨标签页同步视觉风格信息)。
   */
  private visualContext: { visualStyleId: string; variantId: string; scope?: 'exclusive' | 'universal' | 'auto' } | null = null

  constructor(initialPresets: ThemeConfig[], custom: ThemeConfig | null = null) {
    if (initialPresets.length === 0) {
      throw new Error('[octovue/theme] presets must include at least one theme')
    }
    this.state = {
      current: deepClone(initialPresets[0]),
      presets: initialPresets.map((p) => deepClone(p)),
      custom: custom ? deepClone(custom) : null,
    }

    if (isBrowser() && typeof window !== 'undefined') {
      this.storageHandler = this.handleStorageChange.bind(this)
      window.addEventListener('storage', this.storageHandler)
    }
  }

  getState(): ThemeManagerState {
    return {
      current: deepClone(this.state.current),
      presets: this.state.presets.map((p) => deepClone(p)),
      custom: this.state.custom ? deepClone(this.state.custom) : null,
    }
  }

  getCurrent(): ThemeConfig {
    return deepClone(this.state.current)
  }

  getCurrentName(): string {
    return this.state.current.name
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  apply(theme: ThemeConfig | string): void {
    this.applyFromListenerCheck()
    const target = this.resolveTheme(theme)
    if (!target) {
      // fallback: 切到 presets[0] 避免用户停留在破损状态
      const fallback = this.state.presets[0]
      if (fallback && !isThemeEqual(this.state.current, fallback)) {
        console.warn('[octovue/theme] apply: target theme not found, fallback to presets[0]')
        this.apply(fallback)
      } else {
        console.warn('[octovue/theme] apply: target theme not found and no fallback available')
      }
      return
    }
    if (isThemeEqual(this.state.current, target)) return

    const validation = validateTheme(target)
    if (!validation.valid) {
      console.warn('[octovue/theme] apply: invalid theme, ignored:', validation.errors)
      return
    }

    const cloned = deepClone(target)
    const prevState = this.state
    let domApplied = false

    try {
      if (isBrowser()) {
        injectTransitionStyles(200)
        const prevKeys = Object.keys(buildCssVariables(prevState.current))
        removeCssVariables(prevKeys)
        const newVars = buildCssVariables(cloned)
        applyCssVariables(newVars)
        setTimeout(() => removeTransitionStyles(), 250)
        domApplied = true
      }
    } catch (err) {
      // DOM 写入失败 → 回滚 state,避免内存与 DOM 不一致
      console.warn('[octovue/theme] apply: DOM write failed, rolled back:', err)
      this.state = prevState
      this.notify()
      return
    }

    this.state = { ...this.state, current: cloned }
    this.notify()
    saveThemeConfig(this.buildPersistedPayload(cloned))
    void domApplied // 标记已应用,future-use
  }

  setCustom(theme: ThemeConfig | null): void {
    this.state = { ...this.state, custom: theme ? deepClone(theme) : null }
    this.notify()
    // 持久化:只更新 custom 字段,不动 currentName 与 visualContext
    saveThemeConfig(this.buildPersistedPayload(this.state.current))
  }

  getCustom(): ThemeConfig | null {
    return this.state.custom ? deepClone(this.state.custom) : null
  }

  resolveByName(name: string, custom?: ThemeConfig | null): ThemeConfig | null {
    const fromPresets = this.state.presets.find((p) => p.name === name)
    if (fromPresets) return deepClone(fromPresets)
    const target = custom ?? this.state.custom
    if (target && target.name === name) return deepClone(target)
    return null
  }

  addPreset(theme: ThemeConfig): void {
    this.state = {
      ...this.state,
      presets: [...this.state.presets, deepClone(theme)],
    }
    this.notify()
  }

  removePreset(name: string): void {
    this.state = {
      ...this.state,
      presets: this.state.presets.filter((p) => p.name !== name),
    }
    this.notify()
  }

  listPresets(): ThemeConfig[] {
    return this.state.presets.map((p) => deepClone(p))
  }

  /** 注册应用端 theme-extensions 目录 */
  registerAppExtensions(path: string): void {
    if (!path || typeof path !== 'string') {
      throw new Error('[octovue/theme] registerAppExtensions: path must be non-empty string')
    }
    this.appExtensions = { path }
    this.notify()
  }

  /** 注销应用端 theme-extensions 目录 */
  unregisterAppExtensions(): void {
    if (this.appExtensions) {
      this.appExtensions = null
      this.notify()
    }
  }

  /** 当前应用端扩展目录路径(可能为 null) */
  getAppExtensionsPath(): string | null {
    return this.appExtensions ? this.appExtensions.path : null
  }

  destroy(): void {
    if (this.storageHandler && typeof window !== 'undefined') {
      window.removeEventListener('storage', this.storageHandler)
      this.storageHandler = null
    }
    this.listeners.clear()
  }

  // ---- private ----

  private resolveTheme(theme: ThemeConfig | string): ThemeConfig | null {
    if (typeof theme === 'string') return this.resolveByName(theme)
    return theme
  }

  private buildPersistedPayload(theme: ThemeConfig): PersistedThemeConfig {
    const isBuiltin = this.state.presets.some((p) => p.name === theme.name)
    const ctx = this.visualContext
    return {
      version: 1,
      currentName: theme.name,
      source: isBuiltin ? 'builtin' : 'custom',
      custom: isBuiltin
        ? this.state.custom ? deepClone(this.state.custom) : null
        : deepClone(theme),
      appliedAt: Date.now(),
      ...(ctx?.visualStyleId ? { visualStyleId: ctx.visualStyleId } : {}),
      ...(ctx?.variantId ? { variantId: ctx.variantId } : {}),
      ...(ctx?.scope ? { scope: ctx.scope } : {}),
    }
  }

  /**
   * 写入视觉层上下文(由 `applyVariantOnManager` 调用)。
   * 内部使用,供持久化 payload 携带视觉风格信息。
   */
  _setVisualContext(ctx: { visualStyleId: string; variantId: string; scope?: 'exclusive' | 'universal' | 'auto' } | null): void {
    this.visualContext = ctx
  }

  /** 读取当前视觉层上下文(供 `applyVariantOnManager` / 调试使用) */
  _getVisualContext(): { visualStyleId: string; variantId: string; scope?: 'exclusive' | 'universal' | 'auto' } | null {
    return this.visualContext
  }

  private notify(): void {
    const snapshot = this.getState()
    this.notifyInListenerDepth++
    for (const listener of this.listeners) {
      try {
        listener(snapshot)
      } catch (err) {
        console.warn('[octovue/theme] listener error:', err)
      }
    }
    this.notifyInListenerDepth--
    if (this.notifyInListenerDepth === 0 && this.notifyDetectedReentry) {
      this.notifyDetectedReentry = false
      // 不阻止,仅 dev 提示
      // console.debug('[octovue/theme] listener 内调用 apply,已正常处理(若出现循环请业务自行加锁)')
    }
  }

  /** 内部标记: apply 调用栈检测(由 apply 入口检查并标记) */
  private applyFromListenerCheck(): void {
    if (this.notifyInListenerDepth > 0) {
      this.notifyDetectedReentry = true
    }
  }

  /**
   * 检测 listener 回调内是否调用 apply
   * 不阻止调用(业务可能需要系统跟随等场景),仅 dev warn 提示。
   */
  private notifyInListenerDepth = 0
  private notifyDetectedReentry = false

  private handleStorageChange(e: StorageEvent): void {
    if (e.key !== THEME_STORAGE_KEY_NAMESPACED) return
    if (this.applyingFromLocal) {
      this.applyingFromLocal = false
      return
    }
    if (e.newValue === null) {
      const fallback = this.state.presets[0]
      if (fallback && this.state.current.name !== fallback.name) {
        this.applyingFromLocal = true
        this.apply(fallback)
      }
      return
    }
    try {
      const payload = JSON.parse(e.newValue) as PersistedThemeConfig
      if (payload.version !== 1) return
      const target = this.resolveByName(payload.currentName, payload.custom)
      if (target && this.state.current.name !== target.name) {
        this.applyingFromLocal = true
        try {
          this.apply(target)
        } finally {
          // 任何异常都重置标记,避免永久屏蔽后续跨标签页同步
          this.applyingFromLocal = false
        }
      }
    } catch {
      // ignore corrupted storage payload
    }
  }
}

/** 工厂创建 ThemeManager */
export function createThemeManager(options: CreateThemeManagerOptions): ThemeManager {
  const manager = new ThemeManager(options.presets, options.custom ?? null)

  const autoLoad = options.autoLoad ?? true
  if (autoLoad) {
    const persisted = loadThemeConfig()
    if (persisted) {
      const target = manager.resolveByName(persisted.currentName, persisted.custom)
      if (target) manager.apply(target)
    }
  } else {
    const fallback = options.defaultName ?? options.presets[0]?.name
    if (fallback) manager.apply(fallback)
  }

  return manager
}

// --- 视觉层变体入口 (applyByVariant *存在文件里而非 manager,因为需要 registry) ---
// 实际由 ./visual-style-apply.ts 提供,避免 manager 反向依赖 visual-style 模块
export { applyVariantOnManager } from './visual-style-apply.js'

// --- shared singleton ---

let sharedManager: ThemeManager | null = null

/** 获取全局共享 manager (可能为 null) */
export function getSharedThemeManager(): ThemeManager | null {
  return sharedManager
}

/** 设置全局共享 manager */
export function setSharedThemeManager(manager: ThemeManager | null): void {
  sharedManager = manager
}
