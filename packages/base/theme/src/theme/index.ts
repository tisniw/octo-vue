// theme 域桶入口 (平铺后)

export type * from './types.js'
export type { ThemeAppExtensions, MigrationResult } from './types.js'

// 颜色工具 + 错误 (原 utils.ts + contrast.ts + error.ts → color.ts)
export {
  isHexColor,
  hexToRgb,
  rgbToHex,
  clamp,
  isBrowser,
  deepClone,
  contrastRatio,
  alphaOver,
  relativeLuminance,
} from './color.js'
export { ThemeError, type ThemeErrorKind } from './color.js'

// 主题核心 (原 constants.ts + serialize.ts + assemble/ → theme.ts)
export {
  THEME_STORAGE_KEY,
  THEME_STORAGE_KEY_NAMESPACED,
  VS_UNIVERSAL_ACTIVE_KEY,
  VS_AUTO_ENABLED_KEY,
  VS_UNIVERSAL_ACTIVE_KEY_NAMESPACED,
  VS_AUTO_ENABLED_KEY_NAMESPACED,
  LEGACY_KEYS,
  VISUAL_STYLE_PREFIX,
  RESERVED_BUILTIN_THEME_NAMES,
  encodeBoolFlag,
  decodeBoolFlag,
} from './theme.js'
export {
  generateColorScale,
  generateFunctionalScale,
  generateBackgroundScale,
  buildTheme,
  deriveTheme,
  cloneTheme,
} from './theme.js'
// CSS 变量生成 (迁移自 theme.ts, 入口在 core/)
export {
  buildCssVariables,
  cssVariablesToString,
  generateCssVariables,
  countThemeCssVariables,
  MAX_CSS_VARIABLES,
} from '../core/index.js'

// Token + 校验 + 元信息 (原 tokens.ts + validate.ts + metas.ts → tokens.ts)
export {
  THEME_CSS_PREFIX,
  COLOR_PREFIX,
  BACKGROUND_PREFIX,
  FUNCTIONAL_SEMANTICS,
  FUNCTIONAL_LEVELS,
  FUNCTIONAL_LEVEL_LABELS,
  getFunctionalVar,
  getBackgroundVar,
  DEFAULT_RADIUS_TOKENS,
  DEFAULT_FONT_SIZE_TOKENS,
  DEFAULT_FONT_WEIGHT_TOKENS,
  DEFAULT_LEADING_TOKENS,
  DEFAULT_FONT_FAMILY_TOKENS,
  DEFAULT_SHADOW_TOKENS,
  DEFAULT_Z_INDEX_TOKENS,
  DEFAULT_NON_COLOR_TOKENS,
  DEFAULT_TRANSITION,
  getLayoutCssVariables,
  getTypographyCssVariables,
  getEffectCssVariables,
  getBaseCssVariables,
} from './tokens.js'
export { validateTheme, isThemeEqual } from './tokens.js'
export { getThemeMeta } from './tokens.js'

// 视觉层
export {
  registerVisualStyle,
  resolveVisualStyle,
  listVisualStyles,
  listVariants,
  resolveVariant,
  getSharedStyleVar,
  registerBuiltinVisualStyles,
  buildVisualStyleCssVariables,
  ALL_AUTO_VARIANTS,
  startAutoStrategy,
} from './visual-style/index.js'

export type { AutoStrategy, AutoStrategyName } from './visual-style/index.js'

// runtime API（manager + DOM + 持久化 + 视觉层应用入口）
export {
  applyVariantOnManager,
  ThemeManager,
  createThemeManager,
  getSharedThemeManager,
  setSharedThemeManager,
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
} from '../runtime/index.js'

// preset aggregation
export {
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
} from './presets.js'

// registry
export {
  builtinThemes,
  registerBuiltinTheme,
  registerBuiltinThemePackage,
  resolveBuiltinTheme,
  listBuiltinThemes,
  listBuiltinThemeMetas,
  applyBuiltin,
} from './registry.js'
