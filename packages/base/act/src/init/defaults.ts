/**
 * init/defaults · 默认配置常量 (0.0.8 §7)
 */
import type { AdapterId, ClockMode } from '../types.js'

/** 默认 adapter(act 包内置 gsap) */
export const DEFAULT_ADAPTER_ID: AdapterId = 'gsap' as AdapterId

/** 默认帧时钟模式 */
export const DEFAULT_CLOCK_MODE: ClockMode = 'raf'

/** 默认加载策略 */
export const DEFAULT_PRELOAD_STRATEGY: 'eager' | 'lazy' | 'on-demand' = 'on-demand'

/** 默认降级链(从最强到最弱) */
export const DEFAULT_FALLBACK_CHAIN: AdapterId[] = [
  'gsap' as AdapterId,
  'css' as AdapterId,
  'native' as AdapterId,
]

/** 默认超时 (ms) */
export const DEFAULT_LOAD_TIMEOUT = 5000

/** 默认重试次数 */
export const DEFAULT_LOAD_RETRIES = 2

/** act:ready 事件名 */
export const ACT_READY_EVENT = 'act:ready'

/** act:dispose 事件名 */
export const ACT_DISPOSE_EVENT = 'act:dispose'

/** 默认 driver / clock 选项 */
export const DEFAULT_CLOCK_OPTIONS = {
  mode: 'raf' as const,
  maxDelta: 100,
}

export const DEFAULT_DRIVER_OPTIONS = {
  ssrSafe: true,
}