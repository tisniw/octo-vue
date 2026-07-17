/**
 * animated 分类预设桶
 *
 * DESIGN.md §14.2，P1 阶段交付 + P2 阶段补状态驱动子集。
 *
 * 计划包含 15 个预设，每个独立目录：
 *
 * 常规动效 12 个（P1）：
 *   - mesh-flow/        → 'animated-mesh-flow'         visuals: ['tech','cyber','future']
 *   - gradient-shift/   → 'animated-gradient-shift'    通用
 *   - aurora/           → 'animated-aurora'            visuals: ['natural','future','dim']
 *   - waves/            → 'animated-waves'             visuals: ['natural','dim']
 *   - ink-flow/         → 'animated-ink-flow'          visuals: ['traditional']
 *   - stars/            → 'animated-stars'             visuals: ['dim','future']
 *   - particles/        → 'animated-particles'         通用
 *   - glitch/           → 'animated-glitch'            visuals: ['cyber']
 *   - neon-pulse/       → 'animated-neon-pulse'        visuals: ['cyber']
 *   - scan-lines/       → 'animated-scan-lines'        visuals: ['tech','cyber']
 *   - fog/              → 'animated-fog'               visuals: ['natural','dim']
 *   - sparkle/          → 'animated-sparkle'           通用
 *
 * 状态驱动 3 个（P2 叠加在 animated 下）：
 *   - error-pulse/      → 'animated-error-pulse'       通用（stateDriver: error/warning）
 *   - success-glow/     → 'animated-success-glow'      通用（stateDriver: success）
 *   - loading-shimmer/  → 'animated-loading-shimmer'   通用（stateDriver: loading）
 *
 * 当前阶段：仅占位 barrel。
 */

export type {} from '../../core'