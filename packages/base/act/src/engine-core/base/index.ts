/**
 * engine-core/base 桶入口 (0.0.1)
 *
 * 公开 API (5 类型 + 8 函数):
 * - 类型 5: InterpolationFn / Keyframe / KeyframesConfig / Scheduler / SpringSpec / EnvSnapshot / FrameListener
 * - 函数 8: interpolate / interpolateNumber / interpolateColor / interpolateUnit / interpolateString / keyframes / createScheduler / scheduleTick / springFrame / getEnv / refreshEnv / isBrowser / isReducedMotion / isTouchDevice
 */
export type {
  InterpolationFn,
  Interpolatable,
  Keyframe,
  KeyframesConfig,
  SchedulerMode,
  SchedulerOptions,
  Scheduler,
  FrameListener,
  SpringSpec,
  SpringFrameResult,
  EnvSnapshot,
} from './types.js'

export {
  interpolate,
  interpolateNumber,
  interpolateColor,
  interpolateUnit,
  interpolateString,
} from './interpolation.js'

export { keyframes, sortKeyframes } from './keyframes.js'

export { createScheduler, scheduleTick } from './scheduler.js'

export { springFrame } from './springs.js'

export {
  getEnv,
  refreshEnv,
  isBrowser,
  isReducedMotion,
  isTouchDevice,
} from './env.js'
