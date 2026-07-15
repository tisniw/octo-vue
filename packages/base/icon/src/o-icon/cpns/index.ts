/**
 * 图标注册中心
 *
 * 核心职责:
 * 1. 启动时通过 Vite 的 import.meta.glob 自动扫描 src/assets 下所有 SVG
 *    - 按目录维度(dimension)生成图标库名,如:
 *      src/assets/static/base/foo.svg → 库 'static-base',图标名 'foo'
 *      src/assets/dynamic/bar/baz.svg → 库 'dynamic-bar',图标名 'baz'
 *      src/assets/animated/qux.svg → 库 'animated',图标名 'qux'
 * 2. 规范化 SVG:移除根 svg 的 xmlns/width/height,把硬编码颜色替换为 currentColor
 * 3. 注册 SVG 库到 registry,并允许应用端运行时注册自定义库(font/emoji/image)
 * 4. 暴露 coreIcons API 给组件使用(preload/scan/getIcon/...)
 *
 * 设计原则:
 * - 启动零依赖:registry 用 Map,所有方法都是同步的;resolver 才是异步
 * - 自动扫描一次完成,不重复 IO;手动注册的新库需要调用 scan() 才纳入自动加载
 * - 注册即"信任":不验证 name 合法性,但 prefix/font/css 等字段由调用方负责
 */

import type { CoreIcons, IconLibraryConfig } from './types'
/// <reference types="vite/client" />

// -----------------------------------------------------------------------------
// 启动时扫描 src/assets 下所有 SVG(原始字符串)
// glob 路径:从 cpns/index.ts 回到 src/assets
// -----------------------------------------------------------------------------
const svgModules = import.meta.glob('../../assets/**/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

// -----------------------------------------------------------------------------
// 注册表:按库名存放配置
// 同时用一份 Set 记录"已自动扫描过的库",避免重复扫描
// -----------------------------------------------------------------------------
const registry = new Map<string, IconLibraryConfig>()
const autoScannedLibraries = new Set<string>()

// CSS 加载去重:同一 URL 只挂一个 <link>
const loadedCssUrls = new Set<string>()

/**
 * 提取 SVG 的原始文本
 *
 * Vite 的 ?raw query 会把文件内容作为字符串 default 导出
 * 如果未来切到非 Vite 工具链,这里需要按平台适配
 */
function extractRawContent(mod: unknown): string {
  if (typeof mod === 'string') return mod
  if (mod && typeof mod === 'object') {
    const obj = mod as Record<string, unknown>
    if (typeof obj.default === 'string') return obj.default
    if (typeof obj.content === 'string') return obj.content
  }
  return ''
}

/**
 * 规范化 SVG 字符串
 *
 * 处理:
 * - 去掉根 <svg> 的 xmlns 属性(避免在 HTML 里被序列化成 xhtml:ns,影响样式)
 * - 去掉根 <svg> 上显式声明的 width/height(让 1em 缩放生效)
 * - 把 fill="black" / stroke="black" 这类硬编码颜色替换为 currentColor
 * - 保留 <svg> 内子元素的 fill/stroke 属性不动(交给用户控制)
 */
function normalizeSvg(raw: string): string {
  if (!raw) return raw

  let svg = raw.trim()

  // 去掉 xmlns="http://www.w3.org/2000/svg"
  svg = svg.replace(/\s+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/g, '')

  // 去掉根 <svg> 的 width="..." height="..."
  svg = svg.replace(/<svg([^>]*?)\swidth="[^"]*"/i, '<svg$1')
  svg = svg.replace(/<svg([^>]*?)\sheight="[^"]*"/i, '<svg$1')

  // 把根 <svg> 上的硬编码颜色替换为 currentColor
  // 范围限定在根 <svg ...> 标签上,避免误伤子节点
  svg = svg.replace(/(<svg[^>]*?)\sfill="(?!none)[^"]*"/i, '$1 fill="currentColor"')
  svg = svg.replace(/(<svg[^>]*?)\sstroke="(?!none)[^"]*"/i, '$1 stroke="currentColor"')

  return svg
}

/**
 * 从 SVG 文件的绝对路径推断库名
 *
 * 规则:
 * - 取 'assets/' 之后到文件名前的目录段
 * - 目录名按 '-' 拼接,作为库名
 *
 * 示例:
 * - /assets/static/base/foo.svg          → 'static-base',   图标 'foo'
 * - /assets/dynamic/bar/baz.svg          → 'dynamic-bar',   图标 'baz'
 * - /assets/animated/qux.svg             → 'animated',      图标 'qux'
 * - /assets/interaction/widgets/w1.svg   → 'interaction-widgets', 图标 'w1'
 */
function extractLibraryName(filePath: string): { library: string; name: string } | null {
  const normalized = filePath.replace(/\\/g, '/')
  const idx = normalized.lastIndexOf('/assets/')
  if (idx === -1) return null

  const after = normalized.slice(idx + '/assets/'.length)
  const segments = after.split('/')
  if (segments.length < 2) return null

  const fileName = segments[segments.length - 1]
  const name = fileName.replace(/\.svg$/i, '')
  const dirSegments = segments.slice(0, -1)

  if (dirSegments.length === 0) return null

  const library = dirSegments.join('-')
  return { library, name }
}

/**
 * 扫描所有已 glob 出来的 SVG 模块,把它们按库维度写入 registry
 *
 * 调用时机:
 * - 首次调用 preload() 时执行一次
 * - 应用端调用 scan() 时再次执行
 */
function scanAllLibraries(): void {
  for (const [filePath, mod] of Object.entries(svgModules)) {
    const parsed = extractLibraryName(filePath)
    if (!parsed) continue

    const { library, name } = parsed
    autoScannedLibraries.add(library)

    let config = registry.get(library)
    if (!config) {
      config = { type: 'svg', icons: {} }
      registry.set(library, config)
    }

    if (!config.icons) config.icons = {}
    config.icons[name] = normalizeSvg(extractRawContent(mod))
  }
}

// 立即执行一次扫描,这样不需要等待 preload 也能查到自带的库
scanAllLibraries()

// -----------------------------------------------------------------------------
// CSS 加载(font 类型库注册时,如果带 css 字段则自动插入 <link>)
// -----------------------------------------------------------------------------
function loadCssOnce(url: string, crossOrigin: boolean): void {
  if (!url) return
  if (loadedCssUrls.has(url)) return
  if (typeof document === 'undefined') return

  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = url
  if (crossOrigin) link.crossOrigin = 'anonymous'
  document.head.appendChild(link)
  loadedCssUrls.add(url)
}

// -----------------------------------------------------------------------------
// 公共 API
// -----------------------------------------------------------------------------

/**
 * 注册图标库
 *
 * - 同名库会覆盖(应用端可以替换内置库)
 * - font 类型 + css 字段:自动加载 CSS
 * - 自定义库不会触发自动 preload,但 getIconLibrary / hasIconLibrary 立即可用
 */
export function registerIconLibrary(name: string, config: IconLibraryConfig): void {
  registry.set(name, { ...config })

  if (config.type === 'font' && config.css) {
    loadCssOnce(config.css, !!config.crossOrigin)
  }
}

/**
 * 获取图标库配置
 * 未注册时返回 undefined
 */
export function getIconLibrary(name: string): IconLibraryConfig | undefined {
  return registry.get(name)
}

/**
 * 判断库是否已注册
 */
export function hasIconLibrary(name: string): boolean {
  return registry.has(name)
}

/**
 * 同步获取图标 SVG 字符串
 *
 * - 优先从 registry.icons 字典同步返回
 * - 找不到时返回 null(由调用方决定是否走 resolver 异步路径)
 *
 * 注意:本函数不调用 resolver,这是组件层的职责
 */
export function getIconContent(libraryName: string, iconName: string): string | null {
  const library = registry.get(libraryName)
  if (!library?.icons) return null
  return library.icons[iconName] ?? null
}

/**
 * 判断具体图标是否在库的 icons 字典中
 * 同步判断,resolver 异步路径不纳入
 */
export function hasIconInLibrary(libraryName: string, iconName: string): boolean {
  const library = registry.get(libraryName)
  if (!library?.icons) return false
  return Object.prototype.hasOwnProperty.call(library.icons, iconName)
}

// -----------------------------------------------------------------------------
// coreIcons:暴露给组件的精简 API 集合
// -----------------------------------------------------------------------------

let preloadPromise: Promise<void> | null = null

export const coreIcons: CoreIcons = {
  /**
   * 预加载所有自动扫描的图标库
   * 当前实现下扫描是同步完成的,所以 preload 仅返回一个 resolved Promise
   * 保留异步接口是给后续扩展(比如远端图标按需加载)
   */
  async preload(): Promise<void> {
    if (preloadPromise) return preloadPromise
    preloadPromise = Promise.resolve().then(() => {
      scanAllLibraries()
    })
    return preloadPromise
  },

  /**
   * 重扫
   * 应用端在注册了新的图标库后,如果希望纳入"自动扫描"维度,可调用此方法
   * (实际当前实现下,新库直接走 registry,扫描阶段不会重新挂载 glob)
   */
  scan(): void {
    scanAllLibraries()
  },

  getIcon(libraryName, iconName) {
    return getIconContent(libraryName, iconName)
  },

  getLibrary(libraryName) {
    return getIconLibrary(libraryName)
  },

  getAvailableLibraries() {
    return Array.from(registry.keys())
  },

  hasLibrary(libraryName) {
    return hasIconLibrary(libraryName)
  },

  hasIcon(libraryName, iconName) {
    return hasIconInLibrary(libraryName, iconName)
  },
}