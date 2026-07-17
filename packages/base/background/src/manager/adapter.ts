/**
 * 与主题 store 桥接的契约
 *
 * DESIGN.md §十 主题联动约束。
 *
 * adapter 负责把主题 store 的变化转为 controller 调用：
 *   - currentRef.visual 变化 → controller.setByVisual(visual)
 *   - mode 变化 → 构造 EnvironmentSignal 推 controller.setEnv(env)
 */

import type {
  BusinessState,
  EnvironmentSignal,
  ThemeColorSlot,
  Visual,
} from '../core'
import type { Unsubscribe } from './controller'

/**
 * 主题 store 的最小依赖契约（duck typing）
 *
 * adapter 不强依赖具体主题实现，只要 store 暴露以下字段即可桥接。
 * 与 octo-vue/theme 的 store 对齐，但允许外部主题系统对接。
 */
export interface ThemeStoreLike {
  /** 当前视觉 */
  readonly currentVisual: Visual | '*' | undefined
  /** 当前模式（亮 / 暗） */
  readonly mode: 'light' | 'dark' | string
  /**
   * 主题色槽位（adapter 推 controller 后，
   * 渲染层会从该对象读取主题色变量注入到背景 vars）
   */
  readonly themeColors?: Partial<Record<ThemeColorSlot, string>>
  /** 业务状态（adapter 可订阅此字段推到 controller） */
  readonly businessState?: BusinessState
}

/**
 * bridge 构造选项
 */
export interface BackgroundBridgeOptions {
  /**
   * 是否监听 visual 变化（默认 true）
   */
  watchVisual?: boolean

  /**
   * 是否监听 mode 变化并构造 env（默认 true）
   */
  watchMode?: boolean

  /**
   * 是否监听业务状态（默认 true）
   * 关闭后 controller 不会接收外部状态推送
   */
  watchState?: boolean

  /**
   * 自定义 EnvironmentSignal 构造器
   * 默认实现：darkMode = mode === 'dark'、reducedMotion 来自 matchMedia、viewport 来自 innerWidth/Height、dpr 来自 devicePixelRatio
   */
  buildEnv?: (store: ThemeStoreLike) => EnvironmentSignal
}

/**
 * adapter 接口
 */
export interface BackgroundAdapter {
  /**
   * 绑定到 store
   *
   * 启动时调用一次，绑定成功后立即按 store 当前状态触发一次 controller 同步。
   * 返回 unsubscribe，重复调用安全。
   */
  bind(store: ThemeStoreLike, options?: BackgroundBridgeOptions): Unsubscribe

  /**
   * 解绑并释放资源
   */
  dispose(): void
}