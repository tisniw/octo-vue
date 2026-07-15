import { resolveVariant } from '../theme/visual-style/resolve.js'
import { registry } from '../theme/visual-style/register.js'
import { buildVisualStyleCssVariables } from '../core/index.js'
import { applyCssVariables } from './dom.js'
import { isBrowser } from '../theme/color.js'
import type { ThemeVariant } from '../theme/types.js'

/** ThemeManager 的 duck-typed 形状(避免反向依赖 manager 模块) */
interface ManagerLike {
  apply(theme: ThemeVariant['themeConfig'] | string): void
  _setVisualContext(ctx: { visualStyleId: string; variantId: string; scope?: 'exclusive' | 'universal' | 'auto' } | null): void
}

/**
 * 视觉层入口: 把指定 VisualStyle 下的指定 variant 应用到 manager。
 *
 * 这是 "层 0 视觉层 → 层 4 运行时" 的协作入口。
 * 不放在 ThemeManager 类里以避免 manager 反向依赖 visual-style 模块。
 *
 * 行为:
 *   1. 写入 visualContext 到 manager(供持久化携带视觉风格信息)
 *   2. 解析 variant,manager.apply(variant.themeConfig) → 应用主题层 token
 *   3. 取出 vs.sharedStyles → buildVisualStyleCssVariables → 应用视觉层 --ov-vs-* 变量
 *   4. SSR 环境跳过 DOM 写入(isBrowser 守卫)
 */
export function applyVariantOnManager(
  manager: ManagerLike,
  vsId: string,
  variantId: string,
  scope?: 'exclusive' | 'universal',
): void {
  const variant = resolveVariant(vsId, variantId, scope)
  if (!variant) {
    console.warn(`[octovue/theme] applyByVariant: '${vsId}/${variantId}' not found`)
    return
  }

  // 写入 visualStyle 上下文(供持久化)
  manager._setVisualContext({ visualStyleId: vsId, variantId, ...(scope ? { scope } : {}) })
  manager.apply(variant.themeConfig)

  if (!isBrowser()) return
  const vs = registry.get(vsId)
  if (vs) {
    applyCssVariables(buildVisualStyleCssVariables(vs.sharedStyles))
  }
}