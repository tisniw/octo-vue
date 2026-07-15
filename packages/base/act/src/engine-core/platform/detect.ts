/**
 * engine-core/platform/detect — 设备能力检测 (0.0.2 §3.5)
 *
 * SSR 安全:返回 SSR_DEFAULT_DETECTION_RESULT 占位值
 * 浏览器端复用 @octovue/utils/runtime/browser 11 项 API
 */
import type { DetectionResult, ConnectionType } from './types.js'
import { isSSR } from './ssr.js'

/** SSR 默认检测结果 */
export const SSR_DEFAULT_DETECTION_RESULT: DetectionResult = {
  isBrowser: false,
  isSSR: true,
  isReducedMotion: false,
  isTouch: false,
  perfTier: 'low',
  engineTarget: 'canvas2d',
  timestamp: 0,
  platform: 'unknown',
  isMobile: false,
  isRetina: false,
  isLandscape: false,
  connection: 'unknown',
}

let cached: DetectionResult | null = null

/**
 * 执行完整检测并返回 DetectionResult
 * (浏览器端实时检测,SSR 端返回 SSR_DEFAULT_DETECTION_RESULT)
 */
export function detect(): DetectionResult {
  if (cached) return cached
  if (isSSR()) {
    cached = { ...SSR_DEFAULT_DETECTION_RESULT, timestamp: Date.now() }
    return cached
  }

  // 浏览器端:动态 import utils 避免 SSR 引用 window
  // (实际工具在浏览器端可用,但类型由 utils 的 Loose/Typed 提供)
  const w = typeof window !== 'undefined' ? window : null
  const d = typeof document !== 'undefined' ? document : null

  const ua = w?.navigator?.userAgent ?? ''
  const vendor = w?.navigator?.vendor ?? ''
  const standalone = (w?.navigator as { standalone?: boolean } | undefined)?.standalone

  // 平台识别
  let platform: DetectionResult['platform'] = 'unknown'
  if (/MicroMessenger/i.test(ua)) platform = 'wechat'
  else if (/DingTalk/i.test(ua)) platform = 'dingtalk'
  else if (/wxwork/i.test(ua)) platform = 'work-wechat'
  else if (vendor === 'WeChat Mini Program' || standalone !== undefined) platform = 'weapp'
  else if (w !== null) platform = 'web'

  const isTouch = w?.matchMedia?.('(pointer: coarse)')?.matches ?? false
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)
  const isRetina = w?.devicePixelRatio ? w.devicePixelRatio >= 2 : false
  const isLandscape =
    typeof w?.innerWidth === 'number' && typeof w?.innerHeight === 'number'
      ? w.innerWidth > w.innerHeight
      : false

  const conn = (w?.navigator as { connection?: { effectiveType?: string } } | undefined)?.connection
  let connection: ConnectionType = 'unknown'
  if (conn?.effectiveType) {
    connection = conn.effectiveType as ConnectionType
  }

  // prefersReducedMotion
  const isReducedMotion =
    typeof w?.matchMedia === 'function'
      ? w.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false

  // 性能档判定 (粗略:移动 + 低 fps 视作 low)
  const perfTier: DetectionResult['perfTier'] = isMobile ? 'low' : 'mid'

  // engineTarget (粗略:有 webgl2 优先)
  let engineTarget: DetectionResult['engineTarget'] = 'canvas2d'
  if (d?.createElement) {
    try {
      const c = d.createElement('canvas')
      const gl = c.getContext('webgl2')
      if (gl) engineTarget = 'webgl2'
      else {
        const gl1 = c.getContext('webgl')
        if (gl1) engineTarget = 'webgl1'
      }
    } catch {
      // 忽略
    }
  }

  cached = {
    isBrowser: true,
    isSSR: false,
    isReducedMotion,
    isTouch,
    perfTier,
    engineTarget,
    timestamp: Date.now(),
    platform,
    isMobile,
    isRetina,
    isLandscape,
    connection,
  }
  return cached
}

/** 清除缓存(用于测试 / prefers-reduced-motion 变化时) */
export function refreshDetection(): DetectionResult {
  cached = null
  return detect()
}

/** 当前是否 prefer-reduced-motion(便捷访问) */
export function prefersReducedMotion(): boolean {
  return detect().isReducedMotion
}
