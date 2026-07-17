/**
 * @octovue/background · core 子模块入口
 *
 * 仅导出类型契约与常量，不导出任何运行时代码。
 * 使用方请通过 `import type { ... }` 导入类型，保证 tree-shaking。
 */

// 类型契约（DESIGN.md §四 §五 §九 §十）
export type {
  BackgroundCategory,
  Visual,
  BusinessState,
  BackgroundCost,
  ViewportSize,
  EnvironmentSignal,
  BackgroundLayer,
  BackgroundRenderer,
  StateDriver,
  ResponsiveHook,
  VisibilityRule,
  BackgroundSpec,
  BaseBackground,
} from './types'

// 合约常量（DESIGN.md §五 §九 §十二）
export {
  BG_CSS_VAR_PREFIX,
  BG_ZINDEX_VAR,
  BG_ZINDEX_DEFAULT,
  BG_LAYER_CLASS,
  THEME_COLOR_SLOTS,
  STATE_VAR_PREFIX,
} from './contract'

export type { ThemeColorSlot } from './contract'