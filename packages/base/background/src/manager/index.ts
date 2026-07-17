/**
 * @octovue/background · manager 子模块入口
 *
 * 仅导出接口契约与类型，不导出任何运行时代码。
 * P0+ 阶段会逐步补充具体实现，并在同名路径下提供运行时 API。
 *
 * 子模块构成（DESIGN.md §六 §七 §八 §十 §十一）：
 *   - registry：注册表（自动扫描 + 显式注册 + 可见性过滤）
 *   - recommend：视觉推荐表（与目录结构分离）
 *   - controller：控制器（三层优先级 + 订阅）
 *   - adapter：与主题 store 桥接
 */

export type {
  VisibilityList,
  BackgroundRegistry,
} from './registry'

export type {
  VisualRecommendEntry,
  MediaRecommendEntry,
  VisualBackgroundRecommend,
  MediaBackgroundSuggest,
  RecommendTables,
} from './recommend'

export type {
  BackgroundSource,
  SelectionLayer,
  CurrentBackgroundSnapshot,
  ControllerOptions,
  Unsubscribe,
  BackgroundController,
} from './controller'

export type {
  ThemeStoreLike,
  BackgroundBridgeOptions,
  BackgroundAdapter,
} from './adapter'