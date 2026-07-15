// @octovue/theme 桶入口

// === 顶层全局类型 re-export ===
export type * from './theme/types.js'

// === theme 域 ===
export {
  ThemeError,
  type ThemeErrorKind,
  THEME_STORAGE_KEY,
  THEME_STORAGE_KEY_NAMESPACED,
  THEME_CSS_PREFIX,
  COLOR_PREFIX,
  BACKGROUND_PREFIX,
  VISUAL_STYLE_PREFIX,
  RESERVED_BUILTIN_THEME_NAMES,
  FUNCTIONAL_LEVEL_LABELS,
  DEFAULT_TRANSITION,
  DEFAULT_NON_COLOR_TOKENS,
  isHexColor,
  hexToRgb,
  rgbToHex,
  clamp,
  isBrowser,
  deepClone,
  encodeBoolFlag,
  decodeBoolFlag,
  LEGACY_KEYS,
  VS_UNIVERSAL_ACTIVE_KEY,
  VS_AUTO_ENABLED_KEY,
  VS_UNIVERSAL_ACTIVE_KEY_NAMESPACED,
  VS_AUTO_ENABLED_KEY_NAMESPACED,
  // generateColorScale
  generateColorScale,
  generateFunctionalScale,
  generateBackgroundScale,
  // contrast (WCAG)
  contrastRatio,
  alphaOver,
  relativeLuminance,
  // assemble
  buildTheme,
  deriveTheme,
  cloneTheme,
  // serialize
  buildCssVariables,
  cssVariablesToString,
  generateCssVariables,
  countThemeCssVariables,
  MAX_CSS_VARIABLES,
  // validate
  validateTheme,
  isThemeEqual,
  // background / functional / token
  getBackgroundVar,
  FUNCTIONAL_SEMANTICS,
  FUNCTIONAL_LEVELS,
  getFunctionalVar,
  getLayoutCssVariables,
  getTypographyCssVariables,
  getEffectCssVariables,
  getBaseCssVariables,
  // visual-style
  registerVisualStyle,
  resolveVisualStyle,
  listVisualStyles,
  listVariants,
  resolveVariant,
  getSharedStyleVar,
  registerBuiltinVisualStyles,
  buildVisualStyleCssVariables,
  // auto 策略（day-night / season / combined）
  ALL_AUTO_VARIANTS,
  startAutoStrategy,
  // preset aggregation
  lightPreset,
  porcelainPreset,
  darkPreset,
  midnightPreset,
  inkPreset,
  morningMistPreset,
  mintPreset,
  islandPreset,
  skyPreset,
  softPreset,
  pinkPreset,
  orangePreset,
  bluePreset,
  purplePreset,
  greenPreset,
  songRhymePreset,
  techGeekPreset,
  dataGridPreset,
  phantomPreset,
  hologramPreset,
  starfieldPreset,
  dawnPreset,
  allBuiltinThemePresets,
  backgroundPresetsInfo,
  getThemeMeta,
  // builtin registry
  builtinThemes,
  registerBuiltinTheme,
  registerBuiltinThemePackage,
  resolveBuiltinTheme,
  listBuiltinThemes,
  listBuiltinThemeMetas,
  applyBuiltin,
} from './theme/index.js'

export type { AutoStrategyName } from './theme/visual-style/index.js'

// === runtime ===
export {
  applyCssVariables,
  removeCssVariables,
  injectTransitionStyles,
  removeTransitionStyles,
  saveThemeConfig,
  loadThemeConfig,
  clearThemeConfig,
  safeRun,
  isUniversalActiveEnabled,
  setUniversalActiveEnabled,
  isAutoEnabled,
  setAutoEnabled,
  migrateLegacyVisualStyleKeys,
  applyVariantOnManager,
  ThemeManager,
  createThemeManager,
  getSharedThemeManager,
  setSharedThemeManager,
} from './runtime/index.js'


import { registerBuiltinVisualStyles } from './theme/visual-style/builtin.js'
import './theme/registry.js'
registerBuiltinVisualStyles()
