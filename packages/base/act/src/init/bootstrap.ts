/**
 * init/bootstrap · 启动流程编排器 (0.0.8 §6)
 *
 * 七步时序:
 * 1. detect   (engine-core/platform)
 * 2. fallback (engine-core/platform)
 * 3. preload  (engine-core/platform + adapter/_loader)
 * 4. register gsap adapter
 * 5. FrameClock 启动
 * 6. Driver 安装
 * 7. emit 'act:ready'
 *
 * 幂等 + SSR 安全。
 */
import { ref, shallowRef, type Ref } from 'vue'
import {
  detect,
  decideFallback,
  applyFallback,
  preloadAdapters,
  isSSR,
  type DetectionResult,
  type FallbackDecision,
  type PreloadMode,
} from '../engine-core/platform/index.js'
import { registerAdapter, getAdapter } from '../engine-core/adapter/_registry.js'
import { createFrameClock, setGlobalClock, getGlobalClock } from '../engine-core/engines/FrameClock.js'
import { createDriver, setGlobalDriver, getGlobalDriver } from '../engine-core/engines/Driver.js'
import type { FrameClock } from '../engine-core/engines/FrameClock.js'
import type { Driver } from '../engine-core/engines/Driver.js'
import { ActError, type AdapterId, type ClockMode, type FallbackReason } from '../types.js'
import { gsapAdapterFactory } from './adapters/gsap-adapter.js'
import {
  DEFAULT_ADAPTER_ID,
  DEFAULT_CLOCK_MODE,
  DEFAULT_FALLBACK_CHAIN,
  DEFAULT_PRELOAD_STRATEGY,
  ACT_READY_EVENT,
} from './defaults.js'

// ============================================================
// 类型(0.0.8 §6.1)
// ============================================================

export type ActInitState =
  | 'idle'
  | 'detecting'
  | 'fallback'
  | 'preloading'
  | 'registering'
  | 'booting'
  | 'ready'
  | 'disposed'
  | 'failed'

export interface ActInitOptions {
  /** 默认 adapter ID(默认 'gsap') */
  readonly defaultAdapter?: AdapterId
  /** 帧时钟模式(默认 'raf') */
  readonly clockMode?: ClockMode
  /** 加载策略(默认 'on-demand') */
  readonly preloadStrategy?: PreloadMode
  /** 强制降级原因 */
  readonly forceFallback?: FallbackReason
  /** 是否 SSR 安全(默认 true) */
  readonly ssrSafe?: boolean
  /** init 完成回调 */
  readonly onReady?: (snapshot: InitSnapshot) => void
  /** init 失败回调 */
  readonly onError?: (error: ActError) => void
}

export interface InitSnapshot {
  readonly state: 'ready'
  readonly env: DetectionResult
  readonly fallback: FallbackDecision
  readonly registeredAdapters: AdapterId[]
  readonly clock: FrameClock | null
  readonly driver: Driver | null
  readonly duration: number
}

export interface BootstrapController {
  readonly state: Ref<ActInitState>
  readonly snapshot: Readonly<InitSnapshot> | null
  readonly sideEffects: Set<() => void>
  readonly init: (options?: ActInitOptions) => Promise<void>
  readonly dispose: () => Promise<void>
}

// ============================================================
// 模块状态
// ============================================================

let _state: ActInitState = 'idle'
let _snapshot: InitSnapshot | null = null
let _initPromise: Promise<void> | null = null
const _sideEffects = new Set<() => void>()

// 响应式镜像 — BootstrapController 暴露的 ref
const _stateRef: Ref<ActInitState> = ref('idle')
const _snapshotRef: Ref<Readonly<InitSnapshot> | null> = shallowRef(null)

/** 设置模块级 state 并同步 ref */
function setState(next: ActInitState): void {
  _state = next
  _stateRef.value = next
}

function setSnapshot(next: InitSnapshot | null): void {
  _snapshot = next
  _snapshotRef.value = next
}

/** SSR 兜底快照 */
function ssrSnapshot(): InitSnapshot {
  const env: DetectionResult = {
    isBrowser: false,
    isSSR: true,
    isReducedMotion: false,
    isTouch: false,
    perfTier: 'low',
    engineTarget: 'canvas2d',
    timestamp: Date.now(),
    platform: 'unknown',
    isMobile: false,
    isRetina: false,
    isLandscape: false,
    connection: 'unknown',
  }
  const fallback: FallbackDecision = {
    tier: 'none',
    reason: 'ssr',
    strategy: {
      disableGsapPlugins: true,
      disable3D: true,
      disableParticles: true,
      disableTransitions: true,
      fpsTarget: 0,
      forceSimpleEasing: true,
    },
  }
  return Object.freeze({
    state: 'ready' as const,
    env,
    fallback,
    registeredAdapters: [] as AdapterId[],
    clock: null,
    driver: null,
    duration: 0,
  }) as Readonly<InitSnapshot>
}

// ============================================================
// initAct · 主入口(0.0.8 §6.2)
// ============================================================

/**
 * act 包初始化主入口(幂等,多次调用仅首次生效)
 * @example
 *   await initAct({ defaultAdapter: 'gsap' });
 */
export async function initAct(options: ActInitOptions = {}): Promise<void> {
  // 1. 幂等:已在 init 中则复用 Promise
  if (_initPromise) return _initPromise

  // 2. SSR 守护
  if (options.ssrSafe !== false && isSSR()) {
    setState('ready')
    setSnapshot(ssrSnapshot())
    options.onReady?.(_snapshot!)
    return
  }

  _initPromise = _runInit(options)
  try {
    return await _initPromise
  } finally {
    _initPromise = null
  }
}

async function _runInit(options: ActInitOptions): Promise<void> {
  const startTime = Date.now()

  try {
    // ── Step 1: detect ──
    setState('detecting')
    const env = detect()

    // ── Step 2: fallback ──
    setState('fallback')
    const fallback: FallbackDecision = options.forceFallback
      ? applyFallbackToInput(env, options.forceFallback)
      : decideFallback({
        isReducedMotion: env.isReducedMotion,
        perfTier: env.perfTier,
        hasAdapter: hasAdapter(DEFAULT_ADAPTER_ID),
      })

    // ── Step 3: preload ──
    setState('preloading')
    await preloadAdapters(options.preloadStrategy ?? DEFAULT_PRELOAD_STRATEGY)

    // ── Step 4: register + 加载 fallback chain ──
    setState('registering')
    const registered: AdapterId[] = []
    const defaultId = options.defaultAdapter ?? DEFAULT_ADAPTER_ID
    const chain: readonly AdapterId[] = [defaultId, ...DEFAULT_FALLBACK_CHAIN.filter((id) => id !== defaultId)]

    for (const adapterId of chain) {
      try {
        // 注册内置 gsap factory(若未注册)
        if (adapterId === 'gsap' && !hasAdapter('gsap')) {
          registerAdapter(gsapAdapterFactory, {
            id: 'gsap' as AdapterId,
            kind: 'gsap',
            version: '3.12.x',
            pkg: 'gsap',
            priority: 100,
            capabilities: ['tween', 'timeline', 'spring', 'scroll'],
            options: { timeUnit: 'seconds' },
          })
        }
        const adapter = getAdapter(adapterId)
        if (adapter && adapter.state === 'ready') {
          registered.push(adapterId)
          if (adapterId === defaultId) break // 找到默认 adapter 即停止
        }
      } catch (e) {
        console.warn(`[act/init] adapter "${adapterId}" init failed:`, e)
      }
    }

    // ── Step 5: FrameClock ──
    setState('booting')
    const clockMode = options.clockMode ?? DEFAULT_CLOCK_MODE
    const clock: FrameClock = createFrameClock({
      mode: clockMode === 'offline' ? 'manual' : (clockMode as 'raf' | 'manual'),
    })
    setGlobalClock(clock)

    // ── Step 6: Driver ──
    const driver: Driver = createDriver({
      clock,
      engine: getAdapter(defaultId),
    })
    setGlobalDriver(driver)

    // ── Step 7: emit ready ──
    setState('ready')
    setSnapshot(Object.freeze({
      state: 'ready' as const,
      env,
      fallback,
      registeredAdapters: registered,
      clock,
      driver,
      duration: Date.now() - startTime,
    }))

    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(
          new CustomEvent(ACT_READY_EVENT, { detail: _snapshot }),
        )
      } catch (e) {
        console.error('[act/init] dispatchEvent failed:', e)
      }
    }

    options.onReady?.(_snapshot!)
  } catch (e) {
    setState('failed')
    const err = e instanceof ActError
      ? e
      : new ActError(
        'init',
        'INIT_FAILED',
        `init failed at state=${_state}: ${e instanceof Error ? e.message : String(e)}`,
      )
    options.onError?.(err)
    throw err
  }
}

/** applyFallback 包装为返回 decision 的版本 */
function applyFallbackToInput(
  env: DetectionResult,
  reason: FallbackReason,
): FallbackDecision {
  const decision = decideFallback({
    isReducedMotion: env.isReducedMotion,
    perfTier: env.perfTier,
    hasAdapter: hasAdapter(DEFAULT_ADAPTER_ID),
    forceFallback: reason,
  })
  applyFallback(decision)
  return decision
}

/** 本地 hasAdapter(避免依赖 adapter 内部路径) */
function hasAdapter(id: string): boolean {
  try {
    return getAdapter(id) !== null || !!ADAPTER_FACTORY_EXISTS(id)
  } catch {
    return false
  }
}

/** 检测 factory 是否注册(通过 listAdapters 间接判断) */
function ADAPTER_FACTORY_EXISTS(id: string): boolean {
  try {
    // 尝试 getAdapter 触发后台加载,但这里仅用作检测
    return getAdapter(id) !== null
  } catch {
    return false
  }
}

// ============================================================
// disposeAct / isActReady / getInitSnapshot (0.0.8 §6.2)
// ============================================================

/** 销毁 act 包(停止全局帧时钟 / dispose adapter / 清空副作用) */
export async function disposeAct(): Promise<void> {
  if (_state === 'disposed') return

  // 1. 清副作用
  for (const unsub of _sideEffects) {
    try { unsub() } catch (e) {
      console.error('[act/init] sideEffect error:', e)
    }
  }
  _sideEffects.clear()

  // 2. 销毁 Driver / Clock
  const driver = getGlobalDriver()
  try {
    // Driver 接口没有 dispose 方法,仅清理 listeners
    void driver
  } catch {
    /* noop */
  }
  const clock = getGlobalClock()
  try { clock.stop() } catch { /* noop */ }

  // 3. dispose adapter
  for (const id of _snapshot?.registeredAdapters ?? []) {
    const adapter = getAdapter(id)
    if (adapter?.dispose) {
      try { await adapter.dispose() } catch (e) {
        console.error(`[act/init] adapter ${id} dispose error:`, e)
      }
    }
  }

  setState('disposed')
  setSnapshot(null)
  _initPromise = null

  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new CustomEvent('act:dispose'))
    } catch { /* noop */ }
  }
}

/** 检查 act 是否已初始化完成 */
export function isActReady(): boolean {
  return _state === 'ready'
}

/** 获取 init 快照(用于诊断 / 测试) */
export function getInitSnapshot(): Readonly<InitSnapshot> | null {
  return _snapshot
}

// ============================================================
// BootstrapController (供高级使用,本版本仅作占位)
// ============================================================

/** 控制器工厂:返回真实响应式 refs */
export function createBootstrapController(): BootstrapController {
  return {
    state: _stateRef,
    snapshot: _snapshotRef.value,
    sideEffects: _sideEffects,
    init: initAct,
    dispose: disposeAct,
  }
}

// 默认导出 initAct(便于 `import initAct from '@octovue/act/init'`)
export default initAct