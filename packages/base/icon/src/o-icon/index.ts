/**
 * OIcon 组件入口
 *
 * 设计原则:
 * - 默认导出组件,命名导出 API
 * - 类型与运行时 API 分两组,方便 tree-shaking
 * - 与参考项目保持完全一致的导出形状,迁移零成本
 */
export { default as OIcon } from './o-icon.vue'

// 类型导出(纯类型,运行时零开销)
export type {
  IconProps,
  IconLibraryConfig,
  IconLibraryType,
  IconSize,
  IconFlip,
  IconRegistry,
  CoreIcons,
} from './cpns/types'

// 运行时 API
export {
  coreIcons,
  registerIconLibrary,
  getIconLibrary,
  hasIconLibrary,
  getIconContent,
  hasIconInLibrary,
} from './cpns'