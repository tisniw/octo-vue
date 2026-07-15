import type {
  BackgroundSlot,
  CssVariables,
  SharedStyleTokens,
  ThemeConfig,
} from '../theme/types.js'
import {
  BACKGROUND_PREFIX,
  COLOR_PREFIX,
  DEFAULT_NON_COLOR_TOKENS,
  FUNCTIONAL_LEVELS,
  FUNCTIONAL_SEMANTICS,
  getBaseCssVariables,
} from '../theme/tokens.js'
import { isHexColor } from '../theme/color.js'
import { generateFunctionalScale, VISUAL_STYLE_PREFIX } from '../theme/theme.js'

/** 背景色 slot (5 档) */
const BACKGROUND_SLOTS: readonly BackgroundSlot[] = [
  'primary',
  'secondary',
  'tertiary',
  'quaternary',
  'quinary',
]

/** 视觉层 --ov-vs-* 变量数量 */
const VISUAL_STYLE_CSS_COUNT = 9

/**
 * 弱引用 cache: 同一 ThemeConfig 对象在 GC 后自动失效。
 * 避免 ThemeManager.apply 流程中两次 buildCssVariables 重复计算。
 */
const cssVariablesCache = new WeakMap<ThemeConfig, CssVariables>()

/**
 * 将 VisualStyle.sharedStyles 转成 `--ov-vs-*` CSS 变量对象。
 *
 * 输出 9 个变量:
 * - `--ov-vs-border`            (solid/dashed/double/calligraphic)
 * - `--ov-vs-radius`            (none/subtle/round/calligraphic)
 * - `--ov-vs-font-family`       (sans/serif/kai/fangsong/mono)
 * - `--ov-vs-shadow`            (flat/soft/ink/glow)
 * - `--ov-vs-decoration`        (none/seal/border/minimal)
 * - `--ov-vs-motion-easing`     (CSS easing 字符串)
 * - `--ov-vs-motion-duration-fast/base/slow`  (CSS 时长字符串)
 */
export function buildVisualStyleCssVariables(
  shared: SharedStyleTokens,
): Record<string, string> {
  return {
    [`${VISUAL_STYLE_PREFIX}-border`]: shared.border,
    [`${VISUAL_STYLE_PREFIX}-radius`]: shared.radius,
    [`${VISUAL_STYLE_PREFIX}-font-family`]: shared.fontFamily,
    [`${VISUAL_STYLE_PREFIX}-shadow`]: shared.shadow,
    [`${VISUAL_STYLE_PREFIX}-decoration`]: shared.decoration,
    [`${VISUAL_STYLE_PREFIX}-motion-easing`]: shared.motion.easing,
    [`${VISUAL_STYLE_PREFIX}-motion-duration-fast`]: shared.motion.duration.fast,
    [`${VISUAL_STYLE_PREFIX}-motion-duration-base`]: shared.motion.duration.base,
    [`${VISUAL_STYLE_PREFIX}-motion-duration-slow`]: shared.motion.duration.slow,
  }
}

/** ThemeConfig → CSS 变量对象 (key → hex/value) */
export function buildCssVariables(
  config: ThemeConfig,
  vs?: SharedStyleTokens | null,
): CssVariables {
  if (!vs) {
    const cached = cssVariablesCache.get(config)
    if (cached) return cached
  }

  const vars: Record<string, string> = {}

  // 功能色:逐 semantic 守卫
  if (config.tokens) {
    for (const semantic of FUNCTIONAL_SEMANTICS) {
      const base = config.tokens[semantic]
      if (!isHexColor(base)) continue
      const scale = generateFunctionalScale(base)
      FUNCTIONAL_LEVELS.forEach((level, i) => {
        const name = `${COLOR_PREFIX}-${semantic}-${level}`
        vars[name] = scale[i]
      })
    }
  }

  // 背景色:逐 slot 守卫
  if (config.bgTokens) {
    for (const slot of BACKGROUND_SLOTS) {
      const base = config.bgTokens[slot]
      if (!isHexColor(base)) continue
      const name = `${BACKGROUND_PREFIX}-${slot}`
      vars[name] = base
    }
  }

  Object.assign(vars, getBaseCssVariables())
  Object.assign(vars, collectNonColorOverrides(config))

  if (vs) {
    Object.assign(vars, buildVisualStyleCssVariables(vs))
  }

  const frozen = Object.freeze(vars) as CssVariables
  if (!vs) {
    cssVariablesCache.set(config, frozen)
  }
  return frozen
}

function collectNonColorOverrides(config: ThemeConfig): Record<string, string> {
  const result: Record<string, string> = {}
  const groups: Array<[keyof ThemeConfig, string]> = [
    ['size', 'size'],
    ['radius', 'radius'],
    ['spacing', 'spacing'],
    ['fontSize', 'font-size'],
    ['fontWeight', 'font-weight'],
    ['leading', 'leading'],
    ['fontFamily', 'font-family'],
    ['shadow', 'shadow'],
    ['alpha', 'alpha'],
    ['zIndex', 'z-index'],
  ]
  for (const [field, group] of groups) {
    const map = config[field]
    if (map && typeof map === 'object') {
      for (const [k, v] of Object.entries(map)) {
        result[`${COLOR_PREFIX}-${group}-${k}`] = v
      }
    }
  }
  return result
}

/** 将 CSS 变量对象转为 `:root { ... }` 字符串 */
export function cssVariablesToString(vars: CssVariables): string {
  const lines = Object.entries(vars).map(([key, value]) => `  ${key}: ${value};`)
  return `:root {\n${lines.join('\n')}\n}\n`
}

/** (重载 1) 入参为变量对象 */
export function generateCssVariables(vars: CssVariables): string
/** (重载 2) 入参为 ThemeConfig */
export function generateCssVariables(config: ThemeConfig): string
export function generateCssVariables(input: CssVariables | ThemeConfig): string {
  if ('tokens' in input && 'bgTokens' in input) {
    return cssVariablesToString(buildCssVariables(input as ThemeConfig))
  }
  return cssVariablesToString(input as CssVariables)
}

/** 统计 ThemeConfig 输出的 CSS 变量总数 */
export function countThemeCssVariables(
  config: ThemeConfig,
  vs?: SharedStyleTokens | null,
): number {
  return Object.keys(buildCssVariables(config, vs)).length
}

/** 主题层命名空间上限 (70 颜色 + 5 背景 + 127 非颜色 = 202;不含视觉层 --ov-vs-*) */
export const MAX_CSS_VARIABLES: number =
  FUNCTIONAL_SEMANTICS.length * FUNCTIONAL_LEVELS.length +
  BACKGROUND_SLOTS.length +
  Object.keys(DEFAULT_NON_COLOR_TOKENS.size).length +
  Object.keys(DEFAULT_NON_COLOR_TOKENS.radius).length +
  Object.keys(DEFAULT_NON_COLOR_TOKENS.spacing).length +
  Object.keys(DEFAULT_NON_COLOR_TOKENS.fontSize).length +
  Object.keys(DEFAULT_NON_COLOR_TOKENS.fontWeight).length +
  Object.keys(DEFAULT_NON_COLOR_TOKENS.leading).length +
  Object.keys(DEFAULT_NON_COLOR_TOKENS.fontFamily).length +
  Object.keys(DEFAULT_NON_COLOR_TOKENS.shadow).length +
  Object.keys(DEFAULT_NON_COLOR_TOKENS.alpha).length +
  Object.keys(DEFAULT_NON_COLOR_TOKENS.zIndex).length

/** 视觉层 --ov-vs-* 变量数量 (与 MAX_CSS_VARIABLES 独立) */
export const VISUAL_STYLE_MAX_CSS_VARIABLES: number = VISUAL_STYLE_CSS_COUNT
