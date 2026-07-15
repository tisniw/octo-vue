/**
 * act 包级品牌类型与枚举 (0.0.0 §3)
 *
 * 只定义 act 包独有的品牌 / 枚举 / 错误基类。
 * 通用工具类型 (Loose / Nullable / Optional / AnyFn / Unsubscribe)
 * 从 `@octovue/utils` 导入,不在此包内重复定义。
 */

// ============================================================
// 品牌类型 (3.1)
// ============================================================

declare const ActBrandSymbol: unique symbol

/** act 品牌类型 — 用于避免外部类型与 act 内部类型混淆 */
export type ActBrand<T> = T & { readonly [ActBrandSymbol]: 'octovue/act' }

/** 时间线 ID (品牌化) */
export type TimelineId = ActBrand<string>

/** Tween ID (品牌化) */
export type TweenId = ActBrand<string>

/** Adapter ID (品牌化) */
export type AdapterId = ActBrand<string>

/** 弹簧规范版本 (品牌化) */
export type SpringSpecVersion = ActBrand<`v${number}`>

// ============================================================
// 枚举类型 (3.2)
// ============================================================

/** act 包支持的引擎模式 (注意:adapter.kind 还有 'custom',Adapter 私有) */
export type ActMode = 'gsap' | 'motion' | 'css' | 'native'

/** 帧时钟模式 */
export type ClockMode = 'raf' | 'manual' | 'offline'

/** 滚动方向 */
export type ScrollDirection = 'up' | 'down' | 'left' | 'right'

/** 适配器加载状态 */
export type AdapterState = 'pending' | 'loading' | 'ready' | 'failed' | 'disposed'

/** 偏好降级原因 */
export type FallbackReason =
  | 'prefers-reduced-motion' // 用户系统级偏好
  | 'no-supported-adapter' // 未找到可用 adapter
  | 'adapter-load-failed' // adapter 加载失败
  | 'low-end-device' // 检测到低端设备
  | 'ssr' // SSR 环境
  | 'manual' // 用户手动降级

/** 性能分档 */
export type PerfTier = 'low' | 'mid' | 'high'

/** 引擎目标 */
export type EngineTarget = 'webgl2' | 'webgl1' | 'canvas2d' | 'none'

/** 加载策略 */
export type PreloadStrategy = 'eager' | 'lazy' | 'on-demand'

// ============================================================
// 版本常量 (3.3)
// ============================================================

export const ACT_VERSION = '0.1.0' as const
export const ACT_MIN_VUE_VERSION = '3.4.0' as const
export const ACT_MIN_REACT_VERSION = '18.0.0' as const

// ============================================================
// 错误基类 (3.4)
// ============================================================

/** act 包所有错误的基类 */
export class ActError extends Error {
  readonly code: string
  readonly module: string

  constructor(module: string, code: string, message: string) {
    super(`[octovue/act:${module}] ${code} — ${message}`)
    this.name = 'ActError'
    this.code = code
    this.module = module
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

/** adapter 加载失败专用 */
export class AdapterLoadError extends ActError {
  readonly cause?: unknown

  constructor(adapterId: string, cause?: unknown) {
    super('adapter', 'ADAPTER_LOAD_FAILED', `Failed to load adapter: ${adapterId}`)
    this.cause = cause
  }
}

/** 平台降级专用 */
export class PlatformFallbackError extends ActError {
  constructor(reason: FallbackReason, message: string) {
    super('platform', 'PLATFORM_FALLBACK', `${reason}: ${message}`)
  }
}
