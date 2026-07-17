/**
 * intensive-interactive 分类预设桶
 *
 * DESIGN.md §14.7，P4 阶段交付。
 *
 * 计划包含 4 个 GPU / Shader 高性能响应预设，每个独立目录：
 *   - mouse-particles/     → 'intensive-interactive-mouse-particles'    visuals: ['tech','cyber','future']
 *   - shader-reaction/     → 'intensive-interactive-shader-reaction'    visuals: ['tech','cyber']
 *   - fluid-simulation/    → 'intensive-interactive-fluid-simulation'   visuals: ['tech','future']
 *   - cursor-distortion/   → 'intensive-interactive-cursor-distortion'  visuals: ['cyber','future']
 *
 * 高性能响应的 4 个预设都属于专属背景，需通过 visuals 字段限定可见性。
 *
 * 当前阶段：仅占位 barrel。
 */

export type {} from '../../core'