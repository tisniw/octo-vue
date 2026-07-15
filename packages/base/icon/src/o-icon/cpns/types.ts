/**
 * OIcon 组件类型定义
 *
 * 设计原则:
 * - 类型即文档,字段命名贴近 SVG / Iconify / FontAwesome 等业界惯例
 * - 渲染类型可选 'svg' | 'font' | 'emoji' | 'image',由运行时推断
 * - 库(library)是图标分组的载体,允许应用端运行时注册自定义库
 */

/** 渲染类型 */
export type IconLibraryType = 'svg' | 'font' | 'emoji' | 'image'

/**
 * 命名尺寸(预设 5 档,对应 SCSS 中的 .o-icon--{size} 修饰类)
 *
 * 注意:同时支持 number 类型,运行时通过 inline width/height 渲染(不走 class)
 */
export type IconSize = 'tiny' | 'small' | 'medium' | 'large' | 'huge' | number

/** 翻转方向 */
export type IconFlip = 'horizontal' | 'vertical' | 'both'

/**
 * 单个图标库的完整配置
 *
 * - type === 'svg' 时,icons 字典是 name → svg string 的同步映射
 * - type === 'font' 时,prefix 是必须的(如 'fa-' / 'mdi-'),css 是可选的 CDN URL
 * - resolver 允许异步返回 SVG 字符串(用于 Iconify 远程加载或本地按需读取)
 */
export interface IconLibraryConfig {
  /** 库类型 */
  type: IconLibraryType
  /** 字体图标前缀(font 类型必填,如 'fa-' / 'mdi-') */
  prefix?: string
  /** 同步图标字典(name → 原始 SVG 字符串) */
  icons?: Record<string, string>
  /** 字体图标对应的 CSS URL(font 类型可选,会在 register 时自动加载) */
  css?: string
  /** CSS 是否需要 crossOrigin(默认 false) */
  crossOrigin?: boolean
  /**
   * 异步 resolver
   * - name → string: 同步路径(返回 SVG 内容,典型场景是 Iconify 远程加载)
   * - name → Promise<string>: 异步路径(典型场景是按需 fetch)
   */
  resolver?: (name: string) => string | Promise<string>
}

/**
 * IconRegistry:按库名管理的配置集合
 *
 * 内部以 Map<string, IconLibraryConfig> 实现,对外暴露 string-keyed object 形态
 * 通过 registerIconLibrary / getIconLibrary / hasIconLibrary 操作
 */
export interface IconRegistry {
  [libraryName: string]: IconLibraryConfig
}

/**
 * OIcon 组件 props
 *
 * 默认值由组件内 withDefaults 声明,详见 index.vue
 */
export interface IconProps {
  /**
   * 图标标识
   * - 渲染 SVG/字体图标时:图标名(会按 library 查表)
   * - 渲染 Emoji 时:emoji 字符串本身(如 '😀')
   * - 渲染 Image 时:URL(http(s)/data:/相对路径)
   * - 也可直接传原始 <svg>...</svg> 字符串,会被当作 SVG 处理
   */
  name?: string
  /**
   * 使用的图标库
   * 默认 'static-base'(对应 src/assets/static/base)
   */
  library?: string
  /**
   * 尺寸:5 档命名值 或 数字(像素)
   * 默认 'medium'
   */
  size?: IconSize
  /** 显式颜色,会通过 inline color 应用 */
  color?: string
  /** 是否旋转动画 */
  spin?: boolean
  /**
   * 顺时针旋转角度(deg)
   * 与 flip 的 transform 通过不同元素分别承载,互不冲突
   */
  rotate?: number
  /** 翻转方向 */
  flip?: IconFlip
  /**
   * 强制指定渲染类型
   * 不指定时由组件根据 name 自动推断
   */
  type?: IconLibraryType
  /** 禁用态:加 .o-icon--disabled + aria-disabled="true" */
  disabled?: boolean
  /**
   * 无障碍模式
   * - true(默认):aria-hidden="true",屏幕阅读器忽略
   * - false:role="img" + aria-label,作为有语义内容朗读
   */
  decorative?: boolean
  /** 显式无障碍标签,未传时回退到 name */
  ariaLabel?: string
}

/**
 * coreIcons 暴露给组件内部的核心 API
 *
 * 由 cpns/index.ts 实现,组件通过它完成:
 * - preload: 预加载所有自动扫描的 SVG 库
 * - scan: 重扫(注册自定义库后调用)
 * - getIcon / getLibrary / hasIcon / hasLibrary: 查询
 */
export interface CoreIcons {
  /** 预加载所有自动扫描库(幂等,可重复调用) */
  preload(): Promise<void>
  /** 手动重扫(注册新库后调用) */
  scan(): void
  /**
   * 获取图标内容(同步路径)
   * - 优先从 registry.icons 字典同步拿
   * - 找不到返回 null(由组件决定是否走 resolver 异步路径)
   */
  getIcon(libraryName: string, iconName: string): string | null
  /**
   * 获取图标库配置
   * 返回 undefined 表示未注册
   */
  getLibrary(libraryName: string): IconLibraryConfig | undefined
  /** 列出所有已注册的库名 */
  getAvailableLibraries(): string[]
  /** 检查库是否注册 */
  hasLibrary(libraryName: string): boolean
  /**
   * 检查具体图标是否在库中
   * 同步路径,只查 icons 字典;resolver 异步路径不纳入判断
   */
  hasIcon(libraryName: string, iconName: string): boolean
}