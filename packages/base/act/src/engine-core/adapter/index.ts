/**
 * engine-core/adapter 桶入口 (0.0.3 §6)
 *
 * 对外 API:
 * - 类型(11): Adapter / AdapterConfig / AdapterCapability / AdapterFactory /
 *             AdapterSummary / RegisterOptions / DefineAdapterPartial /
 *             LoaderOptions / LoaderResult / LoadAdapterOptions / LoadProgressEvent
 * - 函数(9):  registerAdapter / unregisterAdapter(隐式 via Unsubscribe) /
 *             getAdapter / hasAdapter / listAdapters / listAdapterIds /
 *             defineAdapter / loadAdapter / loadAdapters / onAdapterLoadProgress
 *
 * 不对外导出:_adapter / _loader
 */

// 类型
export type {
  Adapter,
  AdapterCapability,
  AdapterConfig,
  AdapterFactory,
  AdapterSummary,
  RegisterOptions,
  DefineAdapterPartial,
  LoadAdapterOptions,
  LoadProgressEvent,
  LoaderOptions,
  LoaderResult,
} from './_adapter.js'

// 函数 — Registry (0.0.3 §5)
export {
  registerAdapter,
  getAdapter,
  hasAdapter,
  listAdapters,
  listAdapterIds,
  defineAdapter,
} from './_registry.js'

// 函数 — Public Loader (0.0.9 §10)
export { loadAdapter, loadAdapters, onAdapterLoadProgress } from './_public.js'

// 占位类型(Stage 5/6 替换) — 不再导出避免污染公共 API
