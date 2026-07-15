/**
 * 视觉风格注册表保留字 — 与 `RESERVED_BUILTIN_THEME_NAMES`(theme name 维度)互不干扰。
 *
 * 设计依据:
 * - `light` / `dark` 是 VisualStyleId 的合法值(`registerBuiltinVisualStyles` 注册的 6 套之一),
 *   因此视觉层注册表**不应**将这两个视为保留字。
 * - `builtin` / `custom` 是 `ThemeSource` 类别标识符,允许作 VisualStyleId 但语义混淆,
 *   因此保留以防止命名冲突。
 *
 * 与 theme 维度保留字的区别(`constants.ts:52`):
 * - theme 维度保留字:`light` / `dark` / `builtin` / `custom` — 防止第三方用 `name: 'light'` 注册 theme
 * - 视觉层维度保留字:仅 `builtin` / `custom` — 防止与 ThemeSource 字段语义冲突
 */
export const RESERVED_VISUAL_STYLE_IDS: readonly string[] = ['builtin', 'custom']

import { ThemeError } from '../color.js'
import type { VisualStyleConfig, VisualStyleId } from '../types.js'

/** 视觉风格注册表 (内部导出供 resolve.ts 使用) */
export const registry = new Map<VisualStyleId, VisualStyleConfig>()

/**
 * 注册视觉风格。
 *
 * 双重身份保护: `light` / `dark` 在 builtinThemes 与 builtinVisualStyles
 * 两套表里都是保留字,第三方包既不能通过 registerBuiltinTheme({ theme: { name: 'light' } })
 * 也不能通过 registerVisualStyle({ id: 'light' }) 注册。
 *
 * 注:VisualStyle 注册表的保留字 **不包含** 'light' / 'dark',因为这两个恰好是
 * 6 套内置 VisualStyle 的合法 id(`registerBuiltinVisualStyles` 注册)。VisualStyle 表
 * 只阻止 `builtin` / `custom`(与 ThemeSource 类别标识符冲突)。
 */
export function registerVisualStyle(vs: VisualStyleConfig): void {
  if (RESERVED_VISUAL_STYLE_IDS.includes(vs.id)) {
    throw new ThemeError(
      `[octovue/theme] visual style '${vs.id}' is reserved`,
      { kind: 'reserved-name', module: 'visual-style' },
    )
  }
  registry.set(vs.id, vs)
}