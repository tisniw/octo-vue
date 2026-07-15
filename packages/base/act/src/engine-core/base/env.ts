/**
 * engine-core/base/env — 环境检测封装 (0.0.1 §7)
 *
 * 委托给 engine-core/platform/detect,带缓存与便捷访问
 */
import type { EnvSnapshot } from './types.js'
import { detect, refreshDetection } from '../platform/index.js'

let cached: EnvSnapshot | null = null

/** 获取环境快照(首次调用执行 detect,之后返回缓存) */
export function getEnv(): EnvSnapshot {
  if (cached) return cached
  const r = detect()
  cached = {
    isBrowser: r.isBrowser,
    isSSR: r.isSSR,
    isReducedMotion: r.isReducedMotion,
    isTouch: r.isTouch,
    perfTier: r.perfTier,
    engineTarget: r.engineTarget,
    timestamp: r.timestamp,
    platform: r.platform,
    isMobile: r.isMobile,
    isRetina: r.isRetina,
    isLandscape: r.isLandscape,
    connection: r.connection,
  }
  return cached
}

/** 强制刷新(用于测试 / prefers-reduced-motion 变化) */
export function refreshEnv(): EnvSnapshot {
  cached = null
  refreshDetection()
  return getEnv()
}

/** 是否浏览器 */
export function isBrowser(): boolean {
  return getEnv().isBrowser
}

/** 是否 reduced-motion */
export function isReducedMotion(): boolean {
  return getEnv().isReducedMotion
}

/** 是否触屏 */
export function isTouchDevice(): boolean {
  return getEnv().isTouch
}
