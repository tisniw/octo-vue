/**
 * 背景系统核心类型契约
 *
 * 该文件只导出 `interface` / `type` 声明，不包含任何运行时代码。
 * 设计目标：
 *   - 与 DESIGN.md §四（分类体系）、§五（背景规格字段）、§九（BaseBackground 抽象类约束）一一对应
 *   - 供 preset / manager / 外部消费者共享类型
 *   - 通过 type-only 导入，运行时零开销
 */

// =============================================================================
// §四 分类体系
// =============================================================================

/**
 * 7 大背景分类
 *
 * - static：静态背景（纯色 / 渐变 / 网格 / 噪点）
 * - animated：动态背景（Canvas / RAF 自循环）
 * - interactive：交互背景（鼠标 / 触控 / 陀螺仪响应）
 * - media：媒体背景（图片 / 视频 / Lottie）
 * - 3d：三维场景背景（WebGL / Three.js）
 * - audio：语音驱动背景（频谱 / 波形）
 * - intensive-interactive：强交互背景（GPU / Shader 高性能响应）
 */
export type BackgroundCategory =
  | 'static'
  | 'animated'
  | 'interactive'
  | 'media'
  | '3d'
  | 'audio'
  | 'intensive-interactive'

/**
 * 视觉 Visual（与主题 preset/visual 对齐）
 *
 * 固定集合，新增视觉需要同步更新：
 *   - 主题 store 的 PresetVisual 类型
 *   - manager/recommend.ts 的视觉推荐表
 */
export type Visual =
  | 'common'
  | 'auto'
  | 'tech'
  | 'cyber'
  | 'future'
  | 'natural'
  | 'traditional'
  | 'bright'
  | 'dim'

/**
 * 业务状态 BusinessState
 *
 * 状态驱动背景（StateDriver）可消费的固定集合。
 * 不在集合内的状态应忽略，不抛错。
 */
export type BusinessState =
  | 'idle'
  | 'loading'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'hover'
  | 'active'
  | 'focus'
  | 'selected'
  | 'disabled'

/**
 * 性能成本等级
 *
 * 切换背景时按 cost 排序作为降级链依据（见 DESIGN.md §13.1）。
 */
export type BackgroundCost = 'low' | 'medium' | 'high'

// =============================================================================
// §五.4 环境信号
// =============================================================================

/**
 * 视口尺寸（单位 px）
 */
export interface ViewportSize {
  width: number
  height: number
}

/**
 * 环境信号
 *
 * 由 adapter 监听 `prefers-reduced-motion` / `theme.mode` / `window.innerWidth` /
 * `window.devicePixelRatio` 计算而来，推送给 background.controller。
 */
export interface EnvironmentSignal {
  /** 是否暗色模式 */
  darkMode: boolean
  /** 用户是否启用 reduce-motion */
  reducedMotion: boolean
  /** 当前视口尺寸 */
  viewport: ViewportSize
  /** 设备像素比 */
  dpr: number
}

// =============================================================================
// §五.2 / §五.3 / §五 渲染器与驱动
// =============================================================================

/**
 * 挂载点
 *
 * BaseBackground.createLayer() 返回值（DOM 元素 / 容器引用）。
 * BackgroundRenderer.mount 接收此引用，把渲染产物挂到 layer 内部。
 */
export interface BackgroundLayer {
  /** 实际 DOM 元素，CSS 已按 §九 规范配置（position:fixed / aria-hidden / 等） */
  element: HTMLElement
  /** 类名形如 `bg-layer bg-{category}` */
  className: string
}

/**
 * 渲染器
 *
 * 背景可自带 renderer，负责 mount / update / unmount / dispose 四阶段生命周期。
 * 没有渲染器的背景仅靠 vars + CSS 表达（典型如纯静态背景）。
 */
export interface BackgroundRenderer {
  /** 挂载到 layer */
  mount(layer: BackgroundLayer): void | Promise<void>
  /** 响应 vars 变化 */
  update(vars: Record<string, string>): void | Promise<void>
  /** 卸载 DOM，保留缓存 */
  unmount(): void
  /** 完全释放（GPU / 缓存 / 第三方库） */
  dispose(): void
}

/**
 * 状态驱动
 *
 * 仅当 spec 包含此字段时，controller.setState() 才会真正调用。
 * 未消费的状态应静默忽略，不抛错。
 */
export interface StateDriver {
  /** 支持的状态集合（用于过滤 + UI 提示） */
  supports: readonly BusinessState[]
  /** 推状态 */
  setState(state: BusinessState): void
}

/**
 * 响应式钩子
 *
 * 在 environment signal 变化时被调用，用于响应视口 / DPR / darkMode / reduce-motion 变化。
 * 例如：
 *   - 暗色模式切换主题色变量
 *   - reduce-motion 自动停掉 RAF 循环
 *   - DPR 变化时重建渲染器（保证像素清晰）
 */
export type ResponsiveHook = (env: EnvironmentSignal) => void

// =============================================================================
// §五 背景规格（BackgroundSpec）
// =============================================================================

/**
 * 可见性规则
 *
 * 语义说明：
 *   - undefined / '*' / []：通用背景，所有视觉可见
 *   - ['tech', 'cyber']：专属背景，仅这些视觉可见
 */
export type VisibilityRule = '*' | readonly Visual[] | undefined

/**
 * 单个背景的完整规格
 *
 * 无代码形式，纯字段约束。每个 preset 入口 default export 一个 BackgroundSpec。
 */
export interface BackgroundSpec {
  /** 唯一标识，建议前缀式 `{category}-{name}`，例如 `static-gradient` / `3d-cosmic` */
  id: string
  /** 7 大分类之一 */
  category: BackgroundCategory
  /** 视觉可见性，缺省 = 通用 */
  visuals?: VisibilityRule
  /** 风格描述标签（如 ['organic', 'light']），供 UI 切换器过滤 */
  tags?: readonly string[]
  /** 性能成本 */
  cost: BackgroundCost
  /**
   * 是否对 prefers-reduced-motion 安全
   * - true：用户启用 reduce-motion 时仍可使用
   * - false（默认）：启用 reduce-motion 时被过滤掉
   */
  motionSafe?: boolean
  /** 注入的 CSS 变量，键以 `--bg-` 开头 */
  vars: Record<string, string>
  /** 渲染器（可选，没有则纯 CSS 表达） */
  render?: BackgroundRenderer
  /** 状态驱动（可选） */
  stateDriver?: StateDriver
  /** 响应式钩子（可选） */
  responsiveHook?: ResponsiveHook
}

// =============================================================================
// §九 BaseBackground 抽象层契约
// =============================================================================

/**
 * BaseBackground 抽象契约
 *
 * 所有具体背景的实现需满足的最小接口。
 * 不强制继承某个类，duck-typing 即可。
 *
 * 约定：
 *   - id / category / cost / vars 由实现保证
 *   - visuals 缺省即通用
 *   - host / createLayer / injectVars 由具体实现或 BaseBackground helper 提供
 */
export interface BaseBackground {
  /** 唯一标识 */
  readonly id: string
  /** 7 大分类 */
  readonly category: BackgroundCategory
  /** 视觉可见性 */
  readonly visuals?: VisibilityRule
  /** 性能成本 */
  readonly cost: BackgroundCost
  /** 是否对 reduce-motion 安全 */
  readonly motionSafe?: boolean
  /** 注入的 CSS 变量（键以 `--bg-` 开头） */
  readonly vars: Record<string, string>
  /** 状态驱动（可选） */
  readonly stateDriver?: StateDriver
  /** 响应式钩子（可选） */
  readonly responsiveHook?: ResponsiveHook
}