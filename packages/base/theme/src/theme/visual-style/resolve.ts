import { VISUAL_STYLE_PREFIX } from '../theme.js'
import type {
  AutoVariant,
  ResolvedVisualStyle,
  SharedStyleTokens,
  ThemeVariant,
  VisualStyleConfig,
  VisualStyleId,
} from '../types.js'
import { registry } from './register.js'

/**
 * 按 id 解析 VisualStyle。
 *
 * - id 不存在 → 回退到 'light'
 * - 默认变体选取:
 *   1. 若 defaultVariantScope = 'exclusive' (默认) → 取 exclusiveVariants[0]
 *   2. 若 defaultVariantScope = 'universal' → 取 universalVariants[0]
 *   3. exclusive 取空 → 回退到 universalVariants[0]
 *   4. currentScope 反映**实际所属子集**(exclusive / universal)
 */
export function resolveVisualStyle(id: VisualStyleId): ResolvedVisualStyle | null {
  const vs = registry.get(id) ?? registry.get('light')
  if (!vs) return null

  const preferredScope: 'exclusive' | 'universal' = vs.defaultVariantScope ?? 'exclusive'
  const exclusiveV = vs.exclusiveVariants[0]
  const universalV = vs.universalVariants[0]

  let variant: ThemeVariant | undefined
  let actualScope: 'exclusive' | 'universal' | 'auto'
  if (preferredScope === 'universal') {
    variant = universalV
    actualScope = 'universal'
  } else if (exclusiveV) {
    variant = exclusiveV
    actualScope = 'exclusive'
  } else if (universalV) {
    variant = universalV
    actualScope = 'universal'
  } else {
    variant = undefined
    actualScope = 'exclusive'
  }

  return {
    ...vs,
    currentVariantId: variant?.id ?? '',
    currentScope: actualScope,
    currentMode: variant?.preferredMode ?? '',
  }
}

/** 列出全部已注册的视觉风格 */
export function listVisualStyles(): VisualStyleConfig[] {
  return Array.from(registry.values())
}

/** 列出某视觉风格下的变体 (按 scope) */
export function listVariants(
  vsId: VisualStyleId,
  scope?: 'exclusive' | 'universal' | 'auto',
): { exclusive: ThemeVariant[]; universal: ThemeVariant[]; auto: AutoVariant[] } {
  const vs = registry.get(vsId)
  const empty: { exclusive: ThemeVariant[]; universal: ThemeVariant[]; auto: AutoVariant[] } = {
    exclusive: [],
    universal: [],
    auto: [],
  }
  if (!vs) return empty

  if (!scope) return { exclusive: vs.exclusiveVariants, universal: vs.universalVariants, auto: vs.autoVariants ?? [] }
  if (scope === 'exclusive') return { exclusive: vs.exclusiveVariants, universal: [], auto: [] }
  if (scope === 'universal') return { exclusive: [], universal: vs.universalVariants, auto: [] }
  return { exclusive: [], universal: [], auto: vs.autoVariants ?? [] }
}

/** 在风格内按 id 解析变体 */
export function resolveVariant(
  vsId: VisualStyleId,
  variantId: string,
  scope?: 'exclusive' | 'universal',
): ThemeVariant | null {
  const vs = registry.get(vsId)
  if (!vs) return null
  if (scope === 'exclusive') {
    return vs.exclusiveVariants.find((v: ThemeVariant) => v.id === variantId) ?? null
  }
  if (scope === 'universal') {
    return vs.universalVariants.find((v: ThemeVariant) => v.id === variantId) ?? null
  }
  return (
    vs.exclusiveVariants.find((v: ThemeVariant) => v.id === variantId) ??
    vs.universalVariants.find((v: ThemeVariant) => v.id === variantId) ??
    null
  )
}

/** 查询共享样式变量名 (返回 `--ov-vs-<name>`) */
export function getSharedStyleVar(name: keyof SharedStyleTokens | string): string {
  return `${VISUAL_STYLE_PREFIX}-${name}`
}
