/**
 * 视觉推荐映射表
 *
 * DESIGN.md §八 视觉推荐映射。
 *
 * 与目录结构分离（recommend.ts 独立维护），便于新增视觉时只改一张表，
 * 不动 preset 目录结构。
 */

import type { Visual } from '../core'

/**
 * 单个视觉的推荐配置
 *
 * - primary：主题变化时自动应用的背景（推荐表的「主选」）
 * - alternates：UI 切换器中的备选项
 */
export interface VisualRecommendEntry {
  /** 主推荐背景 id，必须在 registry 中存在且对当前 visual 可见 */
  primary: string
  /** 备选背景 id 列表，按推荐优先级排序 */
  alternates: readonly string[]
}

/**
 * 媒体与语音推荐（独立于视觉推荐链，见 §8.2）
 */
export interface MediaRecommendEntry {
  primary: string
  alternates: readonly string[]
}

/**
 * 视觉 → 推荐背景映射表
 *
 * 覆盖 DESIGN.md §8.1 给定的 9 个视觉。
 * 后续新增视觉时需在此扩展，并保证 primary/alternates 都对该 visual 可见。
 */
export type VisualBackgroundRecommend = {
  [V in Visual]: VisualRecommendEntry
}

/**
 * 媒体推荐表（单一入口，不分视觉，见 §8.2）
 */
export interface MediaBackgroundSuggest {
  primary: string
  alternates: readonly string[]
}

/**
 * 完整推荐表
 *
 * 应用层读取顺序：
 *   1. 用户 override（最高）
 *   2. visualBackgroundRecommend[visual].primary
 *   3. mediaBackgroundSuggest.primary（媒体视觉特殊）
 *   4. 兜底 `'static-gradient'`
 */
export interface RecommendTables {
  visual: VisualBackgroundRecommend
  media: MediaBackgroundSuggest
}