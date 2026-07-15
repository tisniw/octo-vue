import type { CssVariables } from '../theme/types.js'
import { isBrowser } from '../theme/color.js'

/** 写入 CSS 变量到指定元素 (默认 :root) */
export function applyCssVariables(
  vars: CssVariables,
  target: HTMLElement | null = null,
): void {
  if (!isBrowser()) return
  const el = target ?? document.documentElement
  for (const [key, value] of Object.entries(vars)) {
    el.style.setProperty(key, value)
  }
}

/** 移除指定 CSS 变量 (默认 :root) */
export function removeCssVariables(
  vars: CssVariables | readonly string[],
  target: HTMLElement | null = null,
): void {
  if (!isBrowser()) return
  const el = target ?? document.documentElement
  const keys = Array.isArray(vars) ? vars : Object.keys(vars)
  for (const key of keys) {
    el.style.removeProperty(key)
  }
}

const STYLE_ID = 'ov-theme-transition'

/** 注入全局过渡样式 (用于主题切换动画) */
export function injectTransitionStyles(
  duration: number = 200,
  properties: string[] = ['background-color', 'color', 'border-color', 'box-shadow'],
): void {
  if (!isBrowser()) return
  let el = document.getElementById(STYLE_ID) as HTMLStyleElement | null
  if (!el) {
    el = document.createElement('style')
    el.id = STYLE_ID
    document.head.appendChild(el)
  }
  el.textContent = `*, *::before, *::after {\n  transition: ${properties.join(', ')} ${duration}ms ease !important;\n}\n`
}

/** 移除注入的过渡样式 */
export function removeTransitionStyles(): void {
  if (!isBrowser()) return
  const el = document.getElementById(STYLE_ID)
  if (el) el.remove()
}
