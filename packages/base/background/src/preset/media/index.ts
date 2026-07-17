/**
 * media 分类预设桶
 *
 * DESIGN.md §14.4，P3 阶段交付。
 *
 * 计划包含 3 个预设，每个独立目录：
 *   - image/      → 'media-image'      通用
 *   - video/      → 'media-video'      通用
 *   - lottie/     → 'media-lottie'     通用（依赖 assets/js/lottie.min.js）
 *
 * 媒体背景不纳入视觉自动推荐链，由独立的 mediaBackgroundSuggest 维护（§8.2）。
 *
 * 当前阶段：仅占位 barrel。
 */

export type {} from '../../core'