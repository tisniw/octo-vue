/**
 * engine-core/platform 桶入口 (0.0.2)
 *
 * 公开 API:
 * - 类型 5: DetectionResult / PerfSample / FallbackDecision / PreloadEntry / SSRSafeOptions
 * - 函数 5: detect / refreshDetection / prefersReducedMotion / decideFallback / applyFallback / measureFps / markFrame / samplePerf / isSSR / isBrowserAvailable / safeBrowser / ssrGuard / preloadAdapters / registerPreload
 * (其中 detect / refreshDetection / prefersReducedMotion 是 0.0.2 主要函数;其余为 SSR 安全工具/性能测量/降级辅助/预加载约定)
 */
export type {
  DetectionResult,
  PerfSample,
  FallbackDecision,
  PreloadEntry,
  SSRSafeOptions,
  ConnectionType,
} from './types.js'
export { SSR_DEFAULT_DETECTION_RESULT } from './detect.js'
export { isSSR, isBrowserAvailable, safeBrowser, ssrGuard } from './ssr.js'
export {
  detect,
  refreshDetection,
  prefersReducedMotion,
} from './detect.js'
export { measureFps, markFrame, samplePerf } from './perf.js'
export { decideFallback, applyFallback } from './fallback.js'
export { preloadAdapters, registerPreload } from './preload.js'
export type { PreloadMode } from './preload.js'
