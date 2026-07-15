/**
 * engine-core/platform 类型 (0.0.2 + 0.0.9 扩展)
 */
import type { EngineTarget, FallbackReason, PerfTier } from '../../types.js'

/** 网络连接类型 */
export type ConnectionType =
  | 'slow-2g'
  | '2g'
  | '3g'
  | '4g'
  | '5g'
  | 'unknown'
  | 'offline'

/**
 * 设备检测结果 (0.0.2 基础 + 0.0.9 扩展 5 字段)
 *
 * 基础 7 字段 (0.0.2 §3.5):
 * - isBrowser / isSSR / isTouch / isReducedMotion / perfTier / engineTarget / timestamp
 *
 * 扩展 5 字段 (0.0.9 §1.3.6):
 * - platform / isMobile / isRetina / isLandscape / connection
 */
export interface DetectionResult {
  readonly isBrowser: boolean
  readonly isSSR: boolean
  readonly isReducedMotion: boolean
  readonly isTouch: boolean
  readonly perfTier: PerfTier
  readonly engineTarget: EngineTarget
  readonly timestamp: number

  // 0.0.9 扩展字段 — 复用 @octovue/utils/runtime/browser
  readonly platform: 'web' | 'wechat' | 'dingtalk' | 'work-wechat' | 'weapp' | 'unknown'
  readonly isMobile: boolean
  readonly isRetina: boolean
  readonly isLandscape: boolean
  readonly connection: ConnectionType
}

/** 性能采样 */
export interface PerfSample {
  readonly time: number
  readonly fps: number
  readonly frameMs: number
}

/** 降级决策 */
export interface FallbackDecision {
  readonly tier: 'full' | 'reduced' | 'minimal' | 'none'
  readonly reason: FallbackReason
  readonly strategy: {
    readonly disableGsapPlugins: boolean
    readonly disable3D: boolean
    readonly disableParticles: boolean
    readonly disableTransitions: boolean
    readonly fpsTarget: number
    readonly forceSimpleEasing: boolean
  }
}

/** 预加载条目 */
export interface PreloadEntry {
  readonly id: string
  readonly kind: string
  readonly size?: number
  readonly priority: number
  readonly loaded: boolean
}

/** SSR 安全包装配置 */
export interface SSRSafeOptions<T> {
  readonly browser: () => T | Promise<T>
  readonly ssr?: () => T
}
