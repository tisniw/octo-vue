/**
 * engine-core/platform/ssr — SSR 检测与安全包装 (0.0.2 + 0.0.0 §7.3)
 */

/** 检测当前是否处于 SSR 环境 */
export function isSSR(): boolean {
  return typeof window === 'undefined' || typeof document === 'undefined'
}

/** 检测浏览器是否可用 (主线程) */
export function isBrowserAvailable(): boolean {
  return !isSSR()
}

/**
 * SSR 安全包装:浏览器端执行 browser() 函数,SSR 端执行 ssr() fallback
 */
export function safeBrowser<T>(options: {
  browser: () => T | Promise<T>
  ssr?: () => T
}): T | Promise<T> {
  if (isSSR()) {
    return (options.ssr ?? (() => undefined as unknown as T))()
  }
  return options.browser()
}

/** SSR 守卫下的 guard */
export function ssrGuard<T>(value: T, fallback: T): T {
  return isSSR() ? fallback : value
}
