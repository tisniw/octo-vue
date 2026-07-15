/**
 * init 模块桶入口 (0.0.8 §11)
 *
 * 公开 API:
 * - 类型 5: ActInitState / ActInitOptions / InitSnapshot / BootstrapController
 * - 函数 6: initAct / disposeAct / isActReady / getInitSnapshot / createBootstrapController / gsapAdapterFactory
 * - 常量 7: DEFAULT_ADAPTER_ID / DEFAULT_CLOCK_MODE / DEFAULT_PRELOAD_STRATEGY /
 *           DEFAULT_FALLBACK_CHAIN / DEFAULT_LOAD_TIMEOUT / DEFAULT_LOAD_RETRIES /
 *           ACT_READY_EVENT / ACT_DISPOSE_EVENT
 * - 元数据: GSAP_ADAPTER_CONFIG
 */
export type {
  ActInitState,
  ActInitOptions,
  InitSnapshot,
  BootstrapController,
} from './bootstrap.js'

export {
  initAct,
  disposeAct,
  isActReady,
  getInitSnapshot,
  createBootstrapController,
} from './bootstrap.js'

// DEFAULT_ADAPTER_ID 已在 engine-core/engines 导出,init 模块不再重复
export {
  DEFAULT_CLOCK_MODE,
  DEFAULT_PRELOAD_STRATEGY,
  DEFAULT_FALLBACK_CHAIN,
  DEFAULT_LOAD_TIMEOUT,
  DEFAULT_LOAD_RETRIES,
  ACT_READY_EVENT,
  ACT_DISPOSE_EVENT,
  DEFAULT_CLOCK_OPTIONS,
  DEFAULT_DRIVER_OPTIONS,
} from './defaults.js'

export {
  gsapAdapterFactory,
  GSAP_ADAPTER_CONFIG,
} from './adapters/gsap-adapter.js'