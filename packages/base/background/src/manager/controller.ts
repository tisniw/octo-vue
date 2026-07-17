/**
 * 背景控制器接口契约
 *
 * DESIGN.md §六 控制器接口。
 *
 * 控制器是背景层对外的统一入口，承载三层优先级：
 *   1. userOverride（用户手动设置）
 *   2. themeRecommend（视觉推荐）
 *   3. 全局默认（兜底）
 */

import type {
  BackgroundSpec,
  BusinessState,
  EnvironmentSignal,
  Visual,
} from '../core'
import type { BackgroundRegistry } from './registry'
import type { RecommendTables } from './recommend'

/**
 * 应用来源
 *
 * 用于日志 / 调试，以及 setByVisual 时区分是「用户触发」还是「主题触发」。
 */
export type BackgroundSource =
  | 'user'
  | 'visual'
  | 'state'
  | 'env'
  | 'default'
  | 'broadcast'

/**
 * 三层优先级语义（DESIGN.md §6.1）
 */
export type SelectionLayer = 'userOverride' | 'themeRecommend' | 'default'

/**
 * 当前应用的背景快照
 *
 * 用于调试 / UI 状态展示，以及订阅 current 变化的 payload。
 */
export interface CurrentBackgroundSnapshot {
  /** 当前生效的 spec（可能为 null：未应用任何背景） */
  spec: BackgroundSpec | null
  /** 当前生效的 spec id */
  id: string | null
  /** 当前来源层 */
  source: SelectionLayer
  /** 最近一次设置的来源 */
  appliedBy: BackgroundSource
  /** 当前关联的视觉（'*' 表示通用） */
  visual: Visual | '*'
}

/**
 * 控制器构造选项
 */
export interface ControllerOptions {
  /** 注册表实例 */
  registry: BackgroundRegistry
  /** 推荐表（含视觉推荐 + 媒体推荐） */
  recommend: RecommendTables
  /** 当前 visual（初始值），后续可通过 setByVisual 更新 */
  initialVisual?: Visual | '*'
  /** 兜底 id（当推荐表的 primary 不可见时使用） */
  fallbackId?: string
}

/**
 * controller 当前快照订阅
 *
 * 卸载时调 unsubscribe，重复调用安全（幂等）。
 */
export type Unsubscribe = () => void

/**
 * 背景控制器接口
 *
 * 核心约定（DESIGN.md §6.3）：
 *   - 视觉推荐变化时刷新主题推荐，用户未锁定则跟随
 *   - 手动设置 id 时校验可见性，跨视觉不可选则拒绝
 *   - 重置 userOverride 时回退到视觉推荐
 *   - 应用有效 id 时按 `userOverride ?? themeRecommend ?? 'static-gradient'` 解析
 */
export interface BackgroundController {
  /**
   * 按 id 手动设置（用户 override）
   * 必须在当前视觉可见性范围内，否则拒绝并返回 false。
   */
  set(id: string): boolean

  /**
   * 按视觉自动推荐（清除 userOverride）
   * 用于主题切换时自动应用视觉推荐。
   */
  setByVisual(visual: Visual | '*'): boolean

  /**
   * 推业务状态（仅当背景包含 stateDriver 时生效）
   * 未消费的状态静默忽略。
   */
  setState(state: BusinessState): void

  /**
   * 推环境信号（仅当背景包含 responsiveHook 时生效）
   */
  setEnv(env: EnvironmentSignal): void

  /**
   * 清除当前背景（卸载 layer、不变更视觉推荐）
   */
  clear(): void

  /**
   * 列出当前视觉可见的全部背景 id（用于 UI 切换器）
   */
  listAvailable(visual?: Visual | '*'): readonly string[]

  /**
   * 当前应用的背景快照
   */
  current(): CurrentBackgroundSnapshot

  /**
   * 订阅 current 变化
   */
  subscribe(listener: (snapshot: CurrentBackgroundSnapshot) => void): Unsubscribe

  /**
   * 重置 userOverride（回退到视觉推荐）
   */
  resetUserOverride(): void

  /**
   * 销毁：清订阅、清状态、释放资源
   */
  dispose(): void
}