/**
 * engine-core/engines 桶入口 (0.0.4 §8)
 *
 * 公开 API:
 * - 类型 10: FrameListener / FrameClockOptions / FrameClock / DriverOptions / Driver /
 *           SpringTarget / SpringDriverOptions / SpringDriver /
 *           ScrollOptions / ScrollProgress / ScrollDriver /
 *           VelocityTrackerOptions / VelocityTracker
 * - 函数 5:  createFrameClock / getGlobalClock / setGlobalClock /
 *            createDriver / getGlobalDriver / setGlobalDriver /
 *            createSpringDriver /
 *            createScrollDriver /
 *            createVelocityTracker
 * (含 DEFAULT_ADAPTER_ID)
 */

export type { FrameListener, FrameClockOptions, FrameClock } from './FrameClock.js'
export type { DriverOptions, Driver } from './Driver.js'
export type { SpringTarget, SpringDriverOptions, SpringDriver } from './SpringDriver.js'
export type { ScrollOptions, ScrollProgress, ScrollDriver } from './ScrollDriver.js'
export type { VelocityTrackerOptions, VelocityTracker } from './VelocityTracker.js'

export { createFrameClock, getGlobalClock, setGlobalClock } from './FrameClock.js'

export { DEFAULT_ADAPTER_ID, createDriver, getGlobalDriver, setGlobalDriver } from './Driver.js'

export { createSpringDriver } from './SpringDriver.js'

export { createScrollDriver } from './ScrollDriver.js'

export { createVelocityTracker } from './VelocityTracker.js'
