/**
 * interactive 分类预设桶
 *
 * DESIGN.md §14.3，P2 阶段交付。
 *
 * 计划包含 8 个预设，每个独立目录：
 *   - cursor-glow/    → 'interactive-cursor-glow'    通用
 *   - cursor-trail/   → 'interactive-cursor-trail'   通用
 *   - parallax/       → 'interactive-parallax'       visuals: ['natural','dim']
 *   - tilt/           → 'interactive-tilt'           通用
 *   - drag-tilt/      → 'interactive-drag-tilt'      visuals: ['tech','cyber']
 *   - click-ripple/   → 'interactive-click-ripple'   通用
 *   - gyro-tilt/      → 'interactive-gyro-tilt'      通用（移动端陀螺仪）
 *   - focus-ring/     → 'interactive-focus-ring'     通用（a11y）
 *
 * 通用背景 6 个，专属背景 2 个（parallax / drag-tilt）。
 *
 * 当前阶段：仅占位 barrel。
 */

export type {} from '../../core'