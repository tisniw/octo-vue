/** 添加 class */
export function addClass(el: Element, ...classes: string[]): void {
  for (const cls of classes.filter(Boolean)) {
    el.classList.add(cls)
  }
}

/** 移除 class */
export function removeClass(el: Element, ...classes: string[]): void {
  for (const cls of classes.filter(Boolean)) {
    el.classList.remove(cls)
  }
}

/** 切换 class（force 强制设值） */
export function toggleClass(el: Element, className: string, force?: boolean): boolean {
  return el.classList.toggle(className, force as boolean)
}

/** 是否包含 class */
export function hasClass(el: Element, className: string): boolean {
  return el.classList.contains(className)
}

/** 替换 class（移除旧的添加新的） */
export function replaceClass(el: Element, oldClass: string, newClass: string): void {
  el.classList.replace(oldClass, newClass)
}

/** 读取计算样式 */
export function getStyle(el: Element, property: string): string {
  return window.getComputedStyle(el).getPropertyValue(property)
}

/** 批量读取 */
export function getStyles(el: Element, properties: string[]): Record<string, string> {
  const style = window.getComputedStyle(el)
  return properties.reduce((acc, prop) => {
    acc[prop] = style.getPropertyValue(prop)
    return acc
  }, {} as Record<string, string>)
}

/** 设置内联样式（支持 string 字典或 key-value） */
export function setStyle(el: HTMLElement, styles: Record<string, string>): void {
  for (const [key, value] of Object.entries(styles)) {
    el.style.setProperty(key, value)
  }
}

/** 重置内联样式（移除指定属性） */
export function resetStyle(el: HTMLElement, ...properties: string[]): void {
  for (const prop of properties) {
    el.style.removeProperty(prop)
  }
}

/** 显示元素（display 恢复为原值） */
export function show(el: HTMLElement): void {
  el.style.removeProperty('display')
}

/** 隐藏元素（display: none） */
export function hide(el: HTMLElement): void {
  el.style.display = 'none'
}

/** 切换显示 */
export function toggleDisplay(el: HTMLElement): void {
  if (el.style.display === 'none') {
    show(el)
  } else {
    hide(el)
  }
}

function normalizeVarName(name: string): string {
  return name.startsWith('--') ? name : `--${name}`
}

/** 读取 CSS 变量值 */
export function getCssVar(el: Element, varName: string): string {
  return window.getComputedStyle(el).getPropertyValue(normalizeVarName(varName)).trim()
}

/** 在指定元素设置 CSS 变量 */
export function setCssVar(el: HTMLElement, varName: string, value: string): void {
  el.style.setProperty(normalizeVarName(varName), value)
}

/** 在 document.documentElement 设置全局 CSS 变量 */
export function setGlobalCssVar(varName: string, value: string): void {
  document.documentElement.style.setProperty(normalizeVarName(varName), value)
}

/** 读取全局 CSS 变量 */
export function getGlobalCssVar(varName: string): string {
  return getCssVar(document.documentElement, varName)
}

/** px → rem（基于根字号，默认 16） */
export function pxToRem(px: number, base = 16): string {
  return `${px / base}rem`
}

/** rem → px */
export function remToPx(rem: number, base = 16): number {
  return rem * base
}

/** px → vw（基于视口宽度） */
export function pxToVw(px: number, viewport = 375): string {
  return `${(px / viewport) * 100}vw`
}

/** px → vh（基于视口高度） */
export function pxToVh(px: number, viewport = 812): string {
  return `${(px / viewport) * 100}vh`
}
