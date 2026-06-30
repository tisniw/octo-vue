export type Platform = 'ios' | 'android' | 'macos' | 'windows' | 'linux' | 'unknown'
export type BrowserName = 'chrome' | 'safari' | 'firefox' | 'edge' | 'ie' | 'opera' | 'unknown'

export interface UAParsed {
  browser: BrowserName
  browserVersion: number | undefined
  os: Platform
  osVersion: string | undefined
  device: 'mobile' | 'tablet' | 'desktop'
  raw: string
}

function getUA(): string {
  if (typeof navigator === 'undefined') return ''
  return navigator.userAgent.toLowerCase()
}

/** 当前运行平台 */
export function getPlatform(): Platform {
  const ua = getUA()
  if (/iphone|ipad|ipod/.test(ua)) return 'ios'
  if (/android/.test(ua)) return 'android'
  if (/macintosh|mac os/.test(ua)) return 'macos'
  if (/windows nt/.test(ua)) return 'windows'
  if (/linux/.test(ua)) return 'linux'
  return 'unknown'
}

/** 是否移动端（基于 UA） */
export function isMobile(): boolean {
  return /iphone|ipad|ipod|android.*mobile|windows phone/.test(getUA())
}

/** 是否桌面端 */
export function isDesktop(): boolean {
  return !isMobile() && !isTablet()
}

/** 是否平板 */
export function isTablet(): boolean {
  const ua = getUA()
  return /ipad/.test(ua) || (/android/.test(ua) && !/mobile/.test(ua))
}

/** 当前浏览器 */
export function getBrowser(): BrowserName {
  const ua = getUA()
  if (/edg/.test(ua)) return 'edge'
  if (/opr|opera/.test(ua)) return 'opera'
  if (/chrome/.test(ua) && !/edg/.test(ua)) return 'chrome'
  if (/safari/.test(ua) && !/chrome/.test(ua)) return 'safari'
  if (/firefox/.test(ua)) return 'firefox'
  if (/trident|msie/.test(ua)) return 'ie'
  return 'unknown'
}

/** 浏览器版本 */
export function getBrowserVersion(): number | undefined {
  const ua = getUA()
  const browser = getBrowser()
  const patterns: Record<BrowserName, RegExp> = {
    chrome: /chrome\/(\d+(\.\d+)?)/,
    safari: /version\/(\d+(\.\d+)?)/,
    firefox: /firefox\/(\d+(\.\d+)?)/,
    edge: /edg\/(\d+(\.\d+)?)/,
    opera: /(?:opera|opr)\/(\d+(\.\d+)?)/,
    ie: /(?:msie |rv:)(\d+(\.\d+)?)/,
    unknown: /(?:)/,
  }
  const match = ua.match(patterns[browser])
  return match ? Number.parseFloat(match[1]) : undefined
}

/** 是否微信内置浏览器 */
export function isWechat(): boolean {
  return /micromessenger/.test(getUA())
}

/** 是否企业微信 */
export function isWecom(): boolean {
  return /wxwork/.test(getUA())
}

/** 是否钉钉 */
export function isDingtalk(): boolean {
  return /dingtalk/.test(getUA())
}

/** 是否小程序 WebView（微信 / 钉钉 / 支付宝等） */
export function isMiniProgramWebView(): boolean {
  const ua = getUA()
  return (
    /miniprogram/.test(ua) ||
    /micromessenger/.test(ua) ||
    /dingtalk/.test(ua) ||
    /alipay/.test(ua)
  )
}

function getWindow(): Window | undefined {
  return typeof window !== 'undefined' ? window : undefined
}

/** 屏幕宽度（px） */
export function getScreenWidth(): number {
  return getWindow()?.screen.width ?? 0
}

/** 屏幕高度 */
export function getScreenHeight(): number {
  return getWindow()?.screen.height ?? 0
}

/** 视口宽度 */
export function getViewportWidth(): number {
  return getWindow()?.innerWidth ?? 0
}

/** 视口高度 */
export function getViewportHeight(): number {
  return getWindow()?.innerHeight ?? 0
}

/** 设备像素比（DPR） */
export function getDevicePixelRatio(): number {
  return getWindow()?.devicePixelRatio ?? 1
}

/** 是否横屏 */
export function isLandscape(): boolean {
  return getViewportWidth() > getViewportHeight()
}

/** 是否竖屏 */
export function isPortrait(): boolean {
  return !isLandscape()
}

/** 是否 Retina 屏 */
export function isRetina(): boolean {
  return getDevicePixelRatio() > 1
}

/** 是否支持触摸 */
export function isTouchSupported(): boolean {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

/** 是否支持 WebSocket */
export function isWebSocketSupported(): boolean {
  return typeof WebSocket !== 'undefined'
}

/** 是否支持 SSE（EventSource） */
export function isEventSourceSupported(): boolean {
  return typeof EventSource !== 'undefined'
}

/** 是否支持 ServiceWorker */
export function isServiceWorkerSupported(): boolean {
  return 'serviceWorker' in navigator
}

/** 是否支持 WebAssembly */
export function isWasmSupported(): boolean {
  return typeof WebAssembly !== 'undefined'
}

/** 是否支持 IntersectionObserver */
export function isIntersectionObserverSupported(): boolean {
  return typeof IntersectionObserver !== 'undefined'
}

/** 是否支持 ResizeObserver */
export function isResizeObserverSupported(): boolean {
  return typeof ResizeObserver !== 'undefined'
}

/** 是否支持 localStorage */
export function isLocalStorageSupported(): boolean {
  try {
    const key = '__octovue_ls_test__'
    localStorage.setItem(key, '1')
    localStorage.removeItem(key)
    return true
  } catch {
    return false
  }
}

/** 是否支持 sessionStorage */
export function isSessionStorageSupported(): boolean {
  try {
    const key = '__octovue_ss_test__'
    sessionStorage.setItem(key, '1')
    sessionStorage.removeItem(key)
    return true
  } catch {
    return false
  }
}

/** 是否支持 indexedDB */
export function isIndexedDBSupported(): boolean {
  return typeof indexedDB !== 'undefined'
}

/** 是否支持 Web Crypto */
export function isWebCryptoSupported(): boolean {
  return typeof crypto !== 'undefined' && !!crypto.subtle
}

/** 是否支持 BroadcastChannel */
export function isBroadcastChannelSupported(): boolean {
  return typeof BroadcastChannel !== 'undefined'
}

/** 是否支持 Clipboard API */
export function isClipboardSupported(): boolean {
  return typeof navigator !== 'undefined' && 'clipboard' in navigator
}

/** 网络连接类型（'wifi' / 'cellular' / 'ethernet' / 'unknown'） */
export function getConnectionType(): string {
  const conn = (navigator as any).connection
  if (!conn) return 'unknown'
  return conn.type || conn.effectiveType || 'unknown'
}

/** 是否在线（navigator.onLine） */
export function isOnline(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true
}

/** 是否弱网（基于 navigator.connection.effectiveType） */
export function isSlowNetwork(): boolean {
  const conn = (navigator as any).connection
  if (!conn || !conn.effectiveType) return false
  return ['2g', 'slow-2g'].includes(conn.effectiveType)
}

/** 解析 User-Agent 字符串 */
export function parseUA(ua?: string): UAParsed {
  const raw = ua ?? (typeof navigator !== 'undefined' ? navigator.userAgent : '')
  const lower = raw.toLowerCase()
  const platform = getPlatform()
  const browser = getBrowser()
  const version = getBrowserVersion()
  const device: UAParsed['device'] = isTablet()
    ? 'tablet'
    : isMobile()
      ? 'mobile'
      : 'desktop'

  let osVersion: string | undefined
  const osPatterns: Record<Platform, RegExp> = {
    ios: /os (\d+[._]\d+(?:[._]\d+)?)/,
    android: /android (\d+(?:\.\d+)+)/,
    macos: /mac os x (\d+[._]\d+(?:[._]\d+)?)/,
    windows: /windows nt (\d+\.\d+)/,
    linux: /linux/,
    unknown: /(?:)/,
  }
  const match = lower.match(osPatterns[platform])
  osVersion = match?.[1]?.replace(/_/g, '.')

  return {
    browser,
    browserVersion: version,
    os: platform,
    osVersion,
    device,
    raw,
  }
}
