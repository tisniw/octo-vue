/**
 * @octovue/background 包入口
 *
 * 该包对外提供「主题联动的背景层」能力。
 * 当前阶段（P0 之前）仅暴露类型契约与子模块 barrel，不含运行时代码。
 *
 * 模块构成：
 *   - ./core    类型契约与主题槽位常量
 *   - ./manager 注册表 / 控制器 / 适配器 / 推荐表的接口契约
 *   - ./preset  7 大分类桶（占位 barrel，待 P0~P5 阶段填充）
 *
 * 使用示例（仅类型导入）：
 *
 *   import type {
 *     BackgroundSpec,
 *     BackgroundController,
 *   } from '@octovue/background'
 *   import type { Visual } from '@octovue/background/core'
 *
 * 运行时 API（待 P0+ 阶段提供）：
 *
 *   import { createBackgroundController, registerAllPresets } from '@octovue/background'
 */

// =============================================================================
// core 重新导出（类型 + 常量）
// =============================================================================
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
} from './core'

export {
  BG_CSS_VAR_PREFIX,
  BG_ZINDEX_VAR,
  BG_ZINDEX_DEFAULT,
  BG_LAYER_CLASS,
  THEME_COLOR_SLOTS,
  STATE_VAR_PREFIX,
} from './core'

export type { ThemeColorSlot } from './core'

// =============================================================================
// manager 重新导出（接口契约）
// =============================================================================
export type {
  VisibilityList,
  BackgroundRegistry,
} from './manager'

export type {
  VisualRecommendEntry,
  MediaRecommendEntry,
  VisualBackgroundRecommend,
  MediaBackgroundSuggest,
  RecommendTables,
} from './manager'

export type {
  BackgroundSource,
  SelectionLayer,
  CurrentBackgroundSnapshot,
  ControllerOptions,
  Unsubscribe,
  BackgroundController,
} from './manager'

export type {
  ThemeStoreLike,
  BackgroundBridgeOptions,
  BackgroundAdapter,
} from './manager'

// =============================================================================
// preset 重新导出（占位 barrel，P0+ 阶段补运行时）
// =============================================================================
export {} from './preset'