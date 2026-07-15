/**
 * engine-core/platform/fallback — 降级策略 (0.0.2)
 */
import type { FallbackDecision } from './types.js'
import type { FallbackReason, PerfTier } from '../../types.js'

interface DecideInput {
  readonly isReducedMotion: boolean
  readonly perfTier: PerfTier
  readonly hasAdapter: boolean
  readonly forceFallback?: FallbackReason
}

/**
 * 根据环境与原因,决定降级档位 (0.0.2 §3 决策)
 * - reduced-motion → 'reduced'
 * - low 设备 + 无大 adapter → 'reduced'
 * - ssr → 'none'
 * - 其他 → 'full'
 */
export function decideFallback(input: DecideInput): FallbackDecision {
  const reason: FallbackReason =
    input.forceFallback ??
    (input.isReducedMotion
      ? 'prefers-reduced-motion'
      : input.perfTier === 'low' && !input.hasAdapter
        ? 'low-end-device'
        : 'manual')

  let tier: FallbackDecision['tier']
  if (input.forceFallback === 'ssr') tier = 'none'
  else if (input.isReducedMotion) tier = 'reduced'
  else if (input.perfTier === 'low') tier = 'reduced'
  else tier = 'full'

  const isFull = tier === 'full'
  const isReduced = tier === 'reduced'
  // tier 当前不取 'minimal'(未触发分支),但保留类型完整性表达
  const isMinimal = tier === ('minimal' as typeof tier)
  const disable3D = isReduced || isMinimal
  const fpsTarget = isFull ? 60 : isReduced ? 30 : 24

  return {
    tier,
    reason,
    strategy: {
      disableGsapPlugins: !isFull,
      disable3D,
      disableParticles: disable3D,
      disableTransitions: tier === 'none',
      fpsTarget,
      forceSimpleEasing: disable3D,
    },
  }
}

/**
 * 根据决策关闭 adapter / 插件
 * (实际关闭由 init 流程根据 decision 决定调用哪些 adapter)
 */
export function applyFallback(decision: FallbackDecision): void {
  // 占位:本版本暂不主动 disable adapter (由 init 流程处理)
  void decision
}
