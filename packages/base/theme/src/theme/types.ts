/** 2D 颜色分量 (0-255) */
export interface Rgb {
  readonly r: number
  readonly g: number
  readonly b: number
}

/** HSV 颜色空间 (h: 0-360, s/v: 0-100) */
export interface Hsv {
  readonly h: number
  readonly s: number
  readonly v: number
}

/** 背景色 slot */
export type BackgroundSlot =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'quaternary'
  | 'quinary'

/** 背景色 tone (1=disabled, 2=default, 3=hover-from, 4=hover, 5=active) */
export type BackgroundTone = 1 | 2 | 3 | 4 | 5

/** 功能色语义 */
export type FunctionalSemantic =
  | 'primary'
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'emphasis'
  | 'default'

/** 功能色阶 (1..10) */
export type FunctionalLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10

/** 主题模式 */
export type ThemeMode = 'light' | 'dark'

/** 主题来源标识 */
export type ThemeSource = 'builtin' | 'custom'

/** 视觉风格 ID */
export type VisualStyleId =
  | 'light'
  | 'dark'
  | 'ancient'
  | 'tech'
  | 'cyber'
  | 'future'
  | (string & {})

/** 视觉风格子模式 (仅 ancient 启用) */
export type VisualMode = 'pine-mist' | 'pine-night' | (string & {})

/** 共享样式 token (作用于 --ov-vs-*) */
export interface SharedStyleTokens {
  readonly border: 'solid' | 'dashed' | 'double' | 'calligraphic'
  readonly radius: 'none' | 'subtle' | 'round' | 'calligraphic'
  readonly fontFamily: 'sans' | 'serif' | 'kai' | 'fangsong' | 'mono'
  readonly motion: {
    readonly easing: string
    readonly duration: {
      readonly fast: string
      readonly base: string
      readonly slow: string
    }
  }
  readonly shadow: 'flat' | 'soft' | 'ink' | 'glow'
  readonly decoration: 'none' | 'seal' | 'border' | 'minimal'
}

/** 7 语义功能基色 */
export interface ThemeTokens {
  readonly primary: string
  readonly success: string
  readonly error: string
  readonly warning: string
  readonly info: string
  readonly emphasis: string
  readonly default: string
}

/** 5 slot 背景基色 */
export interface BackgroundTokens {
  readonly primary: string
  readonly secondary: string
  readonly tertiary: string
  readonly quaternary: string
  readonly quinary: string
}

/** 非颜色 token 集合 */
export interface Presentation {
  readonly size?: Record<string, string>
  readonly radius?: Record<string, string>
  readonly spacing?: Record<string, string>
  readonly fontSize?: Record<string, string>
  readonly fontWeight?: Record<string, string>
  readonly leading?: Record<string, string>
  readonly fontFamily?: Record<string, string>
  readonly shadow?: Record<string, string>
  readonly alpha?: Record<string, string>
  readonly zIndex?: Record<string, string>
}

/** 动效配置对象 (不序列化为 CSS 变量) */
export interface ThemeTransition {
  readonly duration: {
    readonly fast: string
    readonly base: string
    readonly slow: string
  }
  readonly easing: string
  readonly enabled: boolean
}

/** CSS 变量对象 */
export type CssVariables = Readonly<Record<string, string>>

/** 完整主题配置 */
export interface ThemeConfig extends Presentation {
  readonly name: string
  readonly label: string
  readonly mode: ThemeMode
  readonly source?: ThemeSource
  readonly tokens: ThemeTokens
  readonly bgTokens: BackgroundTokens
  readonly transition?: ThemeTransition
}

/** 构建主题输入 */
export interface BuildThemeInput extends Partial<Presentation> {
  readonly name: string
  readonly label: string
  readonly mode: ThemeMode
  readonly baseTokens?: ThemeTokens
  readonly baseBgTokens?: BackgroundTokens
  readonly transition?: Partial<ThemeTransition>
}

/** 主题元信息 */
export interface ThemeMeta {
  readonly id: string
  readonly label: string
  readonly mode: ThemeMode
  readonly source: ThemeSource
  readonly preview: string
}

/** 变体定义 (位于某个 VisualStyle 内部) */
export interface ThemeVariant {
  readonly id: string
  readonly label: string
  readonly themeConfig: ThemeConfig
  readonly preferredMode?: VisualMode
}

/** 自动贴换变体占位 */
export interface AutoVariant extends ThemeVariant {
  readonly triggerHint: string
}

/** 视觉风格配置 */
export interface VisualStyleConfig {
  readonly id: VisualStyleId
  readonly name: string
  readonly description?: string
  readonly sharedStyles: SharedStyleTokens
  readonly exclusiveVariants: ThemeVariant[]
  readonly universalVariants: ThemeVariant[]
  readonly autoVariants?: AutoVariant[]
  readonly defaultVariantScope?: 'exclusive' | 'universal'
}

/** 解析后的视觉风格状态 */
export interface ResolvedVisualStyle extends VisualStyleConfig {
  readonly currentVariantId: string
  readonly currentScope: 'exclusive' | 'universal' | 'auto'
  readonly currentMode: VisualMode
}

/** 校验结果 */
export interface ValidationResult {
  readonly valid: boolean
  readonly errors: readonly string[]
  /** @deprecated use `valid` instead */
  readonly ok?: boolean
}

/** 主题管理器状态 */
export interface ThemeManagerState {
  readonly current: ThemeConfig
  readonly presets: ThemeConfig[]
  readonly custom: ThemeConfig | null
}

/** 持久化主题配置 */
export interface PersistedThemeConfig {
  readonly version: 1
  readonly currentName: string
  readonly source: ThemeSource
  readonly custom: ThemeConfig | null
  readonly appliedAt: number
  readonly visualStyleId?: VisualStyleId
  readonly variantId?: string
  readonly scope?: 'exclusive' | 'universal' | 'auto'
}

/** 创建 ThemeManager 选项 */
export interface CreateThemeManagerOptions {
  readonly presets: ThemeConfig[]
  readonly custom?: ThemeConfig | null
  readonly autoLoad?: boolean
  readonly defaultName?: string
}

/** 内置主题条目 */
export interface BuiltinThemeEntry {
  readonly id: string
  readonly config: ThemeConfig
  readonly meta?: {
    readonly label: string
    readonly description?: string
    readonly preview?: string
  }
  /** 排序优先级(数字越大越优先;同优先级后注册覆盖先注册);不传视为 0 */
  readonly priority?: number
}

/** 注册内置主题选项 */
export interface RegisterBuiltinThemeOptions {
  readonly theme: ThemeConfig
  readonly meta?: Partial<ThemeMeta>
  readonly priority?: number
}

/** 内置主题包 */
export interface BuiltinThemePackage {
  readonly name: string
  readonly version: string
  readonly themes: ThemeConfig[]
  readonly meta?: Record<string, Partial<ThemeMeta>>
  readonly priority?: number
}

/** 背景色卡预览信息 */
export interface BackgroundPresetInfo {
  readonly name: string
  readonly label: string
  readonly mode: ThemeMode
  readonly source: ThemeSource
  readonly preview: string
  readonly palette: readonly string[]
}

/** 应用端主题扩展目录描述 */
export interface ThemeAppExtensions {
  readonly path: string
}

/** 迁移结果 (migrateLegacyVisualStyleKeys) */
export interface MigrationResult {
  readonly migrated: boolean
  readonly details: {
    readonly legacyKeysFound: readonly string[]
    readonly sourceVisualStyleId?: string
    readonly sourceVariantId?: string
    readonly sourceScope?: 'exclusive' | 'universal' | 'auto'
    readonly clearedKeys: readonly string[]
  }
}
