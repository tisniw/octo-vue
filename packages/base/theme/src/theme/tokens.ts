/**
 * 主题 Token 整合定义 (一站式 token 定义入口)
 *
 * 内容包含:
 *  - CSS 变量命名空间前缀 (THEME_CSS_PREFIX = --o / COLOR_PREFIX = --o / BACKGROUND_PREFIX = --ob)
 *    · 功能色输出: --o-${semantic}-${level}          (例:--o-primary-1)
 *    · 背景色输出: --ob-${slot}                       (例:--ob-primary)
 *  - 颜色 token 维度 (functional + background): semantics / levels / slots / fallbacks / getVar
 *    · 背景色不再按 tone 展开, 每个 slot 对应唯一一个 CSS 变量
 *  - 非颜色 token 默认值 (size / radius / spacing / fontSize / fontWeight / leading / fontFamily / shadow / alpha / zIndex)
 *  - 非颜色 token → CSS 变量生成函数 (getLayoutCssVariables / getTypographyCssVariables / getEffectCssVariables / getBaseCssVariables)
 *  - 默认动效配置 (DEFAULT_TRANSITION)
 */
import type {
  BackgroundSlot,
  BackgroundTokens,
  FunctionalLevel,
  FunctionalSemantic,
  Presentation,
  ThemeConfig,
  ThemeMeta,
  ThemeTokens,
  ThemeTransition,
  ValidationResult,
} from './types.js'
import { isHexColor, deepClone } from './color.js'

// ============================================================================
// 1. CSS 变量命名空间前缀
// ============================================================================
// 主题层命名空间分两个域:
//   - 功能色域 (--o):     ${COLOR_PREFIX}-${semantic}-${level}    例:--o-primary-1
//   - 背景色域 (--ob):    ${BACKGROUND_PREFIX}-${slot}            例:--ob-primary
// 其它静态非颜色 token 保留 ${THEME_CSS_PREFIX}-${group}-${key} 形式 (--o-size-1 等)。

/** 主题层 CSS 变量总前缀 */
export const THEME_CSS_PREFIX = '--o'

/** 功能色域前缀 (直接复用 THEME_CSS_PREFIX,使结果形如 `--o-primary-1`) */
export const COLOR_PREFIX = THEME_CSS_PREFIX

/** 背景色域前缀 (与功能色域区分,独立命名空间,结果形如 `--ob-primary`) */
export const BACKGROUND_PREFIX = '--ob'

// ============================================================================
// 2. 颜色 token — 功能色 (functional)
// ============================================================================

/** 功能色语义 (7 档) */
export const FUNCTIONAL_SEMANTICS: readonly FunctionalSemantic[] = [
  'primary',
  'success',
  'error',
  'warning',
  'info',
  'emphasis',
  'default',
]

/** 功能色阶 (10 档) */
export const FUNCTIONAL_LEVELS: readonly FunctionalLevel[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

/** 功能色阶场景语义 */
export const FUNCTIONAL_LEVEL_LABELS: Record<FunctionalLevel, string> = {
  1: 'bg-soft',
  2: 'bg',
  3: 'bg-strong',
  4: 'border',
  5: 'text-soft',
  6: 'text',
  7: 'text-strong',
  8: 'accent-soft',
  9: 'accent',
  10: 'accent-strong',
}

/** 功能色变量名构造 (返回如 `--o-primary-1`) */
export function getFunctionalVar(semantic: FunctionalSemantic, level: FunctionalLevel): string {
  return `${COLOR_PREFIX}-${semantic}-${level}`
}

/** 7 语义功能色基色 (作为 createTheme / buildTheme 内置默认 baseTokens 的来源)
 *  此处不再以 fallback 形式暴露给公共 API;调用 buildTheme 时 baseTokens 必须显式给出完整 7 个语义。
 *  保留该常量仅供内置主题 preset (light / dark / 等) 引用,集中管理默认值。
 *  类型显式约束为 ThemeTokens,避免在 buildTheme 中被推断为不完整对象。
 */
export const FALLBACK_THEME_TOKENS: ThemeTokens = {
  primary: '#4F46E5',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  emphasis: '#8B5CF6',
  default: '#6B7280',
}

// ============================================================================
// 3. 颜色 token — 背景色 (background)
// ============================================================================
// 注:背景色不再做 tone 色阶展开,每个 slot 仅对应一个 CSS 变量 (--ob-${slot})。
//   BackgroundSlot 类型仍在 types.ts 公开导出 (供消费者约束入参),
//   BackgroundTone 类型作为废弃导出保留 (公共 API 向后兼容,但不再生成变量)。

/** 背景色变量名构造 (返回如 `--ob-primary`) */
export function getBackgroundVar(slot: BackgroundSlot): string {
  return `${BACKGROUND_PREFIX}-${slot}`
}

/** 5 slot 背景色基色 (light 主题默认值; dark 主题需在 buildTheme 中显式传入完整 baseBgTokens)
 *  类型显式约束为 BackgroundTokens,避免在 buildTheme 中被推断为不完整对象。
 */
export const FALLBACK_BACKGROUND_TOKENS: BackgroundTokens = {
  primary: '#FFFFFF',
  secondary: '#FAFAFA',
  tertiary: '#F3F4F6',
  quaternary: '#E5E7EB',
  quinary: '#D1D5DB',
}

// ============================================================================
// 4. 非颜色 token 默认值
// ============================================================================

/** 尺寸 token 默认值 (0..32) */
const SIZE_TOKENS: Record<string, string> = (() => {
  const entries: Record<string, string> = {}
  for (let i = 0; i <= 32; i++) {
    entries[String(i)] = i === 0 ? '0px' : `${i * 0.25}rem`
  }
  return entries
})()

/** 圆角 token 默认值 */
export const DEFAULT_RADIUS_TOKENS: Presentation['radius'] = {
  none: '0px',
  xs: '0.125rem',
  sm: '0.25rem',
  base: '0.375rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  '2xl': '1.5rem',
  '3xl': '2rem',
  full: '9999px',
}

/** 间距 token 默认值 (0..24) */
const SPACING_TOKENS: Record<string, string> = (() => {
  const entries: Record<string, string> = {}
  for (let i = 0; i <= 24; i++) {
    entries[String(i)] = i === 0 ? '0px' : `${i * 0.25}rem`
  }
  return entries
})()

/** 字号 token 默认值 (10 档) */
export const DEFAULT_FONT_SIZE_TOKENS: Presentation['fontSize'] = {
  xxs: '0.625rem',
  xs: '0.75rem',
  sm: '0.875rem',
  base: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
  '3xl': '1.875rem',
  '4xl': '2.25rem',
  '5xl': '3rem',
}

/** 字重 token 默认值 */
export const DEFAULT_FONT_WEIGHT_TOKENS: Presentation['fontWeight'] = {
  thin: '100',
  extralight: '200',
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
}

/** 行高 token 默认值 */
export const DEFAULT_LEADING_TOKENS: Presentation['leading'] = {
  none: '1',
  tight: '1.25',
  snug: '1.375',
  normal: '1.5',
  relaxed: '1.625',
  loose: '2',
}

/** 字体族 token 默认值 */
export const DEFAULT_FONT_FAMILY_TOKENS: Presentation['fontFamily'] = {
  sans: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
}

/** 阴影 token 默认值 */
export const DEFAULT_SHADOW_TOKENS: Presentation['shadow'] = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
}

/** 透明度 token 默认值 (0..100, step 5) */
const ALPHA_TOKENS: Record<string, string> = (() => {
  const entries: Record<string, string> = {}
  for (let i = 0; i <= 100; i += 5) {
    entries[String(i)] = String(i / 100)
  }
  return entries
})()

/** Z-index token 默认值 */
export const DEFAULT_Z_INDEX_TOKENS: Presentation['zIndex'] = {
  dropdown: '1000',
  sticky: '1100',
  fixed: '1200',
  modal: '1300',
  popover: '1400',
  tooltip: '1500',
}

/** 完整默认非颜色 token */
export const DEFAULT_NON_COLOR_TOKENS: Required<Presentation> = {
  size: SIZE_TOKENS,
  radius: DEFAULT_RADIUS_TOKENS,
  spacing: SPACING_TOKENS,
  fontSize: DEFAULT_FONT_SIZE_TOKENS,
  fontWeight: DEFAULT_FONT_WEIGHT_TOKENS,
  leading: DEFAULT_LEADING_TOKENS,
  fontFamily: DEFAULT_FONT_FAMILY_TOKENS,
  shadow: DEFAULT_SHADOW_TOKENS,
  alpha: ALPHA_TOKENS,
  zIndex: DEFAULT_Z_INDEX_TOKENS,
}

// ============================================================================
// 5. 默认动效配置 (不序列化为 CSS 变量, 由 ThemeManager 消费)
// ============================================================================

/** 默认动效配置 */
export const DEFAULT_TRANSITION: ThemeTransition = {
  duration: {
    fast: '100ms',
    base: '200ms',
    slow: '300ms',
  },
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  enabled: true,
}

// ============================================================================
// 6. 非颜色 token → CSS 变量生成
// ============================================================================

/** token 名称前缀化映射 */
function prefixedMap(group: string, map: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(map).map(([k, v]) => [`${THEME_CSS_PREFIX}-${group}-${k}`, v]),
  )
}

/** 静态布局类非颜色 token (size / radius / spacing) */
export function getLayoutCssVariables(): Record<string, string> {
  const d = DEFAULT_NON_COLOR_TOKENS
  return {
    ...prefixedMap('size', d.size),
    ...prefixedMap('radius', d.radius),
    ...prefixedMap('spacing', d.spacing),
  }
}

/** 静态排版类非颜色 token (font-size / font-weight / leading / font-family) */
export function getTypographyCssVariables(): Record<string, string> {
  const d = DEFAULT_NON_COLOR_TOKENS
  return {
    ...prefixedMap('font-size', d.fontSize),
    ...prefixedMap('font-weight', d.fontWeight),
    ...prefixedMap('leading', d.leading),
    ...prefixedMap('font-family', d.fontFamily),
  }
}

/** 静态效果类非颜色 token (shadow / alpha / z-index) */
export function getEffectCssVariables(): Record<string, string> {
  const d = DEFAULT_NON_COLOR_TOKENS
  return {
    ...prefixedMap('shadow', d.shadow),
    ...prefixedMap('alpha', d.alpha),
    ...prefixedMap('z-index', d.zIndex),
  }
}

/** 完整基础 CSS 变量集 (layout + typography + effect) */
export function getBaseCssVariables(): Record<string, string> {
  return {
    ...getLayoutCssVariables(),
    ...getTypographyCssVariables(),
    ...getEffectCssVariables(),
  }
}

// ============================================================================
// 7. 校验 (原 validate.ts)
// ============================================================================

const REQUIRED_SEMANTICS: ReadonlyArray<keyof ThemeTokens> = [
  'primary',
  'success',
  'error',
  'warning',
  'info',
  'emphasis',
  'default',
]

const REQUIRED_SLOTS: ReadonlyArray<keyof BackgroundTokens> = [
  'primary',
  'secondary',
  'tertiary',
  'quaternary',
  'quinary',
]

/** 静态校验 ThemeConfig */
export function validateTheme(theme: unknown): ValidationResult {
  const errors: string[] = []

  if (!theme || typeof theme !== 'object') {
    return { valid: false, ok: false, errors: ['Theme must be an object'] }
  }
  const t = theme as Partial<ThemeConfig> & Record<string, unknown>

  if (typeof t.name !== 'string' || t.name.length === 0) {
    errors.push('theme.name is required (non-empty string)')
  }
  if (typeof t.label !== 'string' || t.label.length === 0) {
    errors.push('theme.label is required (non-empty string)')
  }
  if (t.mode !== 'light' && t.mode !== 'dark') {
    errors.push('theme.mode must be "light" or "dark"')
  }
  if (!t.tokens || typeof t.tokens !== 'object') {
    errors.push('theme.tokens is required (object)')
  } else {
    for (const sem of REQUIRED_SEMANTICS) {
      const value = (t.tokens as ThemeTokens)[sem]
      if (!isHexColor(value)) {
        errors.push(`theme.tokens.${sem} must be a valid hex color`)
      }
    }
  }
  if (!t.bgTokens || typeof t.bgTokens !== 'object') {
    errors.push('theme.bgTokens is required (object)')
  } else {
    for (const slot of REQUIRED_SLOTS) {
      const value = (t.bgTokens as BackgroundTokens)[slot]
      if (!isHexColor(value)) {
        errors.push(`theme.bgTokens.${slot} must be a valid hex color`)
      }
    }
  }

  const valid = errors.length === 0
  return { valid, ok: valid, errors }
}

const SEMANTICS: ReadonlyArray<keyof ThemeTokens> = [
  'primary',
  'success',
  'error',
  'warning',
  'info',
  'emphasis',
  'default',
]
const SLOTS: ReadonlyArray<keyof BackgroundTokens> = [
  'primary',
  'secondary',
  'tertiary',
  'quaternary',
  'quinary',
]

/** 浅/深比较两个主题 */
export function isThemeEqual(a: ThemeConfig, b: ThemeConfig, deep: boolean = false): boolean {
  if (a === b) return true
  if (a.name !== b.name) return false
  if (a.mode !== b.mode) return false

  for (const sem of SEMANTICS) {
    if (a.tokens[sem] !== b.tokens[sem]) return false
  }
  for (const slot of SLOTS) {
    if (a.bgTokens[slot] !== b.bgTokens[slot]) return false
  }

  if (deep) {
    return JSON.stringify(deepClone(a)) === JSON.stringify(deepClone(b))
  }
  return true
}

// ============================================================================
// 8. 元信息 (原 metas.ts)
// ============================================================================

/** 根据 ThemeConfig 派生 ThemeMeta */
export function getThemeMeta(theme: ThemeConfig): ThemeMeta {
  return {
    id: theme.name,
    label: theme.label,
    mode: theme.mode,
    source: theme.source ?? 'custom',
    preview: theme.bgTokens.primary,
  }
}