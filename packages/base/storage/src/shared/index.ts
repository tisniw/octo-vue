/**
 * @octovue/storage/shared 入口。
 * 暴露 framework-agnostic 共享契约 — 不依赖 pinia / vue,
 * 供上层 framework-agnostic 包(如 @octovue/theme)使用。
 */
export * from './types'
export * from './error'
export * from './serializer'
