/**
 * static 分类预设桶
 *
 * DESIGN.md §14.1，P0 阶段交付。
 *
 * 计划包含 6 个预设，每个独立目录：
 *   - solid/         → spec.id = 'static-solid'        通用
 *   - gradient/      → spec.id = 'static-gradient'     通用
 *   - mesh/          → spec.id = 'static-mesh'         visuals: ['tech','cyber','future']
 *   - grid/          → spec.id = 'static-grid'         visuals: ['tech','cyber']
 *   - dots/          → spec.id = 'static-dots'         通用
 *   - noise/         → spec.id = 'static-noise'        通用
 *
 * 通用背景 4 个（solid / gradient / dots / noise），
 * 专属背景 2 个（mesh / grid）。
 *
 * 当前阶段：仅占位 barrel，实际预设按 P0 阶段填充。
 */

export type {} from '../../core'