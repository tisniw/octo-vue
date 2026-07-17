/**
 * 主题系统与背景系统的合约常量
 *
 * 集中维护两套系统的「硬约定」：
 *   - CSS 变量前缀（§五 vars 字段以 `--bg-` 开头）
 *   - zIndex 体系（§十二 背景层 z-index 取 `--zIndex-background`）
 *   - 主题色槽位常量（§十 主题联动约束）
 *
 * 仅常量与字面量类型，零运行时副作用。
 */

/** CSS 变量前缀：所有由背景注入的变量都必须以此前缀开头 */
export const BG_CSS_VAR_PREFIX = '--bg-' as const

/** 背景层 z-index 取值（与主题 style.ts 对齐） */
export const BG_ZINDEX_VAR = '--zIndex-background' as const

/** 背景层默认 z-index（兜底） */
export const BG_ZINDEX_DEFAULT = 0 as const

/** 背景层根类名前缀（createLayer 会输出 `bg-layer bg-{category}`） */
export const BG_LAYER_CLASS = 'bg-layer' as const

/**
 * 主题色槽位（与 theme 包对接）
 *
 * 背景层在生成 CSS 变量时，会引用这些主题色变量。
 * 具体路径由主题 store 在运行时注入（例如 `--theme-color-primary`）。
 *
 * 注：本合约只声明「哪些槽位会被背景消费」，具体值由主题层提供。
 */
export const THEME_COLOR_SLOTS = [
  'primary',
  'secondary',
  'accent',
  'background',
  'surface',
  'text',
  'border',
] as const

export type ThemeColorSlot = (typeof THEME_COLOR_SLOTS)[number]

/**
 * 业务状态 → 主题变量前缀
 *
 * 状态驱动背景可在 vars 里引用 `${STATE_VAR_PREFIX}.${state}`。
 * 例如：`--bg-state-color: var(--state-success)`。
 */
export const STATE_VAR_PREFIX = '--state' as const