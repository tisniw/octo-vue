/**
 * engine-core/adapter · Adapter 接口契约 (0.0.3 §3)
 *
 * 直接复用 tween/timeline 模块的真实类型(0.0.5+ 已稳定)。
 *
 * **Adapter 实现者契约**:createTween / createTimeline 必须返回满足
 * TweenHandle / Timeline 接口的对象 — 业务侧与 act 内置 tween/timeline API
 * 完全互通,可直接传入 Timeline.add() / compose / 等。
 */
import type { TweenTarget, TweenOptions, TweenHandle } from '../../tween/types.js'
import type { TimelineOptions, Timeline } from '../../timeline/types.js'

// ============================================================
// 公开类型(直接 re-export 真实类型)
// ============================================================

export type { TweenTarget, TweenOptions, TweenHandle } from '../../tween/types.js'
export type { TimelineOptions, Timeline } from '../../timeline/types.js'

// ============================================================
// Adapter 公开类型
// ============================================================

/** Adapter 能力清单 (10 种 — 0.0.3 + 0.0.9) */
export type AdapterCapability =
  | 'tween'
  | 'timeline'
  | 'spring'
  | 'scroll'
  | 'svg'
  | '3d'
  | 'physics'
  | 'particles'
  | 'morph'
  | 'splitText'

/** Adapter 配置 */
export interface AdapterConfig {
  /** adapter 唯一 ID */
  readonly id: string
  /** 适配引擎类型 */
  readonly kind: 'gsap' | 'motion' | 'css' | 'native' | 'custom'
  /** 适配引擎版本(语义化) */
  readonly version: string
  /** 引擎依赖包名(动态 import 用) */
  readonly pkg?: string
  /** adapter 优先级(同 ID 时高优先级生效) */
  readonly priority?: number
  /** adapter 能力清单 */
  readonly capabilities: readonly AdapterCapability[]
  /** adapter 选项 */
  readonly options?: Record<string, unknown>
}

/** Adapter 接口契约 */
export interface Adapter {
  /** adapter 元数据 */
  readonly config: AdapterConfig
  /** 适配引擎状态 */
  readonly state: 'pending' | 'loading' | 'ready' | 'failed' | 'disposed'
  /** 初始化(加载引擎依赖) */
  init(): Promise<void>
  /** 创建 tween(返回 act 真实 TweenHandle,可直接喂给 Timeline.add / compose) */
  createTween(target: TweenTarget, props: Record<string, unknown>, options?: TweenOptions): TweenHandle
  /** 创建 timeline(返回 act 真实 Timeline) */
  createTimeline(options?: TimelineOptions): Timeline
  /** 销毁 */
  dispose(): Promise<void>
}

/** Adapter 工厂函数 */
export type AdapterFactory = (config: AdapterConfig) => Promise<Adapter>

// ============================================================
// Loader 接口
// ============================================================

/** Loader 加载选项 */
export interface LoaderOptions {
  readonly strategy?: 'eager' | 'lazy' | 'on-demand'
  readonly timeout?: number
  readonly retries?: number
}

/** Loader 加载结果 */
export interface LoaderResult {
  readonly ok: boolean
  readonly adapter?: Adapter
  readonly error?: unknown
  readonly duration: number
}

// ============================================================
// Registry 接口
// ============================================================

/** Registry 注册选项 */
export interface RegisterOptions {
  readonly lazy?: boolean
  readonly override?: boolean
}

/** Adapter 元数据摘要(0.0.9 补全) */
export interface AdapterSummary {
  readonly id: string
  readonly kind: AdapterConfig['kind']
  readonly version: string
  readonly state: Adapter['state']
  readonly capabilities: readonly AdapterCapability[]
  readonly priority: number
  readonly loading: boolean
}

/** defineAdapter 简写 API 配置(0.0.9 补全) */
export interface DefineAdapterPartial {
  readonly version?: string
  readonly pkg?: string
  readonly priority?: number
  readonly capabilities?: readonly AdapterCapability[]
  readonly lazy?: boolean
  readonly override?: boolean
  readonly options?: Record<string, unknown>
}

/** 公开 LoadAdapter 选项(0.0.9 补全 §10) */
export interface LoadAdapterOptions {
  readonly timeout?: number
  readonly retries?: number
  readonly blocking?: boolean
}

/** 加载进度事件(0.0.9 补全 §10.4) */
export type LoadProgressEvent =
  | { readonly type: 'start'; readonly id: string; readonly total: number }
  | { readonly type: 'progress'; readonly id: string; readonly completed: number; readonly total: number }
  | { readonly type: 'complete'; readonly id: string; readonly duration: number }
  | { readonly type: 'error'; readonly id: string; readonly error: unknown }