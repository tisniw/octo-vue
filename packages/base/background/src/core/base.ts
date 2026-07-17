/**
 * BaseBackground 接口契约
 *
 * 该文件只声明「实现需满足的接口形状」，不提供具体类实现。
 * 任何 preset 入口的 default export 只要满足 BaseBackground 接口即可。
 *
 * 真正的 helper（createLayer / injectVars 等）由后续阶段（P0+）在
 * `core/base-helpers.ts` 提供。
 */

import type { BackgroundLayer, BackgroundRenderer, BackgroundSpec, ResponsiveHook, StateDriver } from './types'

/**
 * BaseBackground 最小契约
 *
 * DESIGN.md §九 的接口化版本。
 *
 * 实现要点：
 *   - id / category / cost / vars 必须提供
 *   - visuals 缺省即通用
 *   - render / stateDriver / responsiveHook 可选
 *
 * 与 BackgroundSpec 的区别：
 *   - BackgroundSpec 是「静态规格」，可被 JSON 序列化
 *   - BaseBackground 是「运行时实例」，可携带方法（mount/update/dispose）
 */
export interface BaseBackground extends BackgroundSpec {
  /**
   * 创建背景层 DOM
   *
   * 输出层必须满足（DESIGN.md §九）：
   *   - position: fixed、inset: 0
   *   - pointer-events: none
   *   - aria-hidden="true"
   *   - z-index: var(--zIndex-background, 0)
   *   - className 包含 `bg-layer bg-{category}`
   */
  createLayer(): BackgroundLayer

  /**
   * 把 vars 注入到目标元素（layer / 主题根节点 / body）
   *
   * 仅注入 vars 中的键，键名以 `--bg-` 开头。
   * 切换背景时先清掉上一份的 vars，避免变量残留。
   */
  injectVars(target: HTMLElement): void

  /**
   * 便捷访问 render；缺省时返回 undefined
   */
  getRenderer(): BackgroundRenderer | undefined

  /**
   * 便捷访问 stateDriver；缺省时返回 undefined
   */
  getStateDriver(): StateDriver | undefined

  /**
   * 便捷访问 responsiveHook；缺省时返回 undefined
   */
  getResponsiveHook(): ResponsiveHook | undefined

  /**
   * 释放资源（dispose）
   *
   * 卸载 layer、调用 renderer.dispose、清空 vars。
   * 多次调用安全（幂等）。
   */
  dispose(): void
}