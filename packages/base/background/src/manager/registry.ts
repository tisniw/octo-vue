/**
 * 背景注册表接口契约
 *
 * DESIGN.md §十一 注册机制。
 *
 * 仅声明接口形状。具体实现（同步 / 异步、Map / WeakMap）由 P0+ 阶段决定。
 */

import type { BackgroundCategory, BackgroundSpec, Visual } from '../core'

/**
 * 可见性过滤结果
 *
 * 给出当前 visual 下可见的全部 spec id 列表（按注册顺序）。
 */
export interface VisibilityList {
  /** 视觉 */
  visual: Visual | '*'
  /** 该视觉下可见的全部 spec id */
  ids: readonly string[]
}

/**
 * 背景注册表
 *
 * 注册职责：
 *   - 自动扫描（preset/index.ts 调用 register 批量注册，见 §11.1）
 *   - 显式注册（运行时动态注入，见 §11.3）
 *   - 可见性过滤（按 visual 过滤，见 §7.3）
 *
 * 唯一性约束：
 *   - 同 id 后注册覆盖先注册（同 Map.set 语义）
 *   - 未导出合法 spec 的文件输出 warn 日志，不阻断其他注册
 */
export interface BackgroundRegistry {
  /** 注册单个背景（覆盖同 id） */
  register(spec: BackgroundSpec): void

  /** 注销指定 id（不存在时静默忽略） */
  unregister(id: string): void

  /** 批量注册（用于自动扫描） */
  registerAll(specs: readonly BackgroundSpec[]): void

  /** 获取 spec（找不到返回 undefined） */
  get(id: string): BackgroundSpec | undefined

  /** 判断 id 是否已注册 */
  has(id: string): boolean

  /** 列出全部 spec（按注册顺序） */
  list(): readonly BackgroundSpec[]

  /** 列出全部 spec id */
  listIds(): readonly string[]

  /**
   * 按视觉过滤可见 spec
   *
   * `visual = '*'` 等同于 list()，返回全部通用与专属背景。
   */
  listForVisual(visual: Visual | '*'): readonly BackgroundSpec[]

  /** 按分类过滤（用于 UI 切换器分组） */
  listForCategory(category: BackgroundCategory): readonly BackgroundSpec[]

  /** 清空注册表（用于测试 / 热重载） */
  clear(): void
}