/**
 * engine-core/platform/preload — 预加载策略占位 (0.0.2)
 *
 * 实际加载逻辑由 adapter 模块的 loadAdapter() 实现;
 * 本文件仅定义行为契约,eager/lazy/on-demand 三种策略的标签。
 */
import type { PreloadEntry } from './types.js'

export type PreloadMode = 'eager' | 'lazy' | 'on-demand'

/** 注册预加载条目(占位,不真正加载) */
export function registerPreload(entry: PreloadEntry): void {
  // 由 init 模块调用 adapter._loader 处理
  void entry
}

/** 触发预加载(由 init 调用,具体行为由 strategy 决定) */
export async function preloadAdapters(
  _strategy: PreloadMode,
): Promise<void> {
  // 占位:实际加载由 init/adapters/gsap-adapter.ts 接管
}
