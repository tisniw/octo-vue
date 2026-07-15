export type {
  VisualStyleId,
  VisualMode,
  SharedStyleTokens,
  VisualStyleConfig,
  ResolvedVisualStyle,
  ThemeVariant,
  AutoVariant,
} from '../types.js'
export { registerVisualStyle } from './register.js'
export {
  resolveVisualStyle,
  listVisualStyles,
  listVariants,
  resolveVariant,
  getSharedStyleVar,
} from './resolve.js'
export { registerBuiltinVisualStyles } from './builtin.js'
export { buildVisualStyleCssVariables } from '../../core/index.js'
export {
  ALL_AUTO_VARIANTS,
  startAutoStrategy,
} from './auto.js'
export type { AutoStrategy, AutoStrategyName } from '../auto-strategy.js'
