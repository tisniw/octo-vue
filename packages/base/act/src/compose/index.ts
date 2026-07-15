/**
 * compose 模块桶入口 (0.0.5 §6 + §7)
 *
 * 公开 API:
 * - 类型 11: ComposeTarget / Runnable / Compose / ComposeEventType / ComposeOptions /
 *            StaggerConfig / ScrollDrivenOptions / ScrollDrivenAxis /
 *            ScrollBoundary / ScrollBoundaryResolved
 * - 函数 4:  sequence / parallel / stagger / scrollDriven
 * - 辅助 3:  isTweenOrTimeline / isCallTarget / isFnTarget
 */
export type {
  ComposeTarget,
  Runnable,
  Compose,
  ComposeEventType,
  ComposeOptions,
  StaggerConfig,
  ScrollDrivenOptions,
  ScrollDrivenAxis,
  ScrollBoundary,
  ScrollBoundaryResolved,
} from './types.js'

export { isTweenOrTimeline, isCallTarget, isFnTarget } from './types.js'

export { sequence } from './sequence.js'
export { parallel } from './parallel.js'
export { stagger } from './stagger.js'
export { scrollDriven } from './scrollDriven.js'