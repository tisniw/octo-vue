export interface ElementRect {
  top: number
  left: number
  right: number
  bottom: number
  width: number
  height: number
  x: number
  y: number
}

function toRect(rect: DOMRect): ElementRect {
  return {
    top: rect.top,
    left: rect.left,
    right: rect.right,
    bottom: rect.bottom,
    width: rect.width,
    height: rect.height,
    x: rect.x,
    y: rect.y,
  }
}

/** 获取元素矩形（封装 getBoundingClientRect） */
export function getBoundingClientRect(el: Element): ElementRect {
  return toRect(el.getBoundingClientRect())
}

/** 元素相对于视口的位置 */
export function getRectToViewport(el: Element): ElementRect {
  return getBoundingClientRect(el)
}

/** 元素相对于父元素的位置 */
export function getRectToParent(el: Element): ElementRect {
  const parent = el.parentElement
  if (!parent) return getBoundingClientRect(el)
  const parentRect = parent.getBoundingClientRect()
  const rect = el.getBoundingClientRect()
  return toRect(
    new DOMRect(
      rect.left - parentRect.left,
      rect.top - parentRect.top,
      rect.width,
      rect.height
    )
  )
}

/** 元素相对于指定祖先元素的位置 */
export function getRectTo(el: Element, ancestor: Element): ElementRect {
  const ancestorRect = ancestor.getBoundingClientRect()
  const rect = el.getBoundingClientRect()
  return toRect(
    new DOMRect(
      rect.left - ancestorRect.left,
      rect.top - ancestorRect.top,
      rect.width,
      rect.height
    )
  )
}

/** 元素内容宽度（不含 padding / border） */
export function getContentWidth(el: Element): number {
  const style = window.getComputedStyle(el)
  const padding = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight)
  return el.clientWidth - padding
}

/** 元素内容高度 */
export function getContentHeight(el: Element): number {
  const style = window.getComputedStyle(el)
  const padding = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom)
  return el.clientHeight - padding
}

/** 元素完整宽度（含 padding + border，不含 margin） */
export function getOffsetWidth(el: HTMLElement): number {
  return el.offsetWidth
}

/** 元素完整高度 */
export function getOffsetHeight(el: HTMLElement): number {
  return el.offsetHeight
}

/** 元素 + margin 占位宽度 */
export function getOuterWidth(el: HTMLElement): number {
  const style = window.getComputedStyle(el)
  return (
    el.offsetWidth +
    parseFloat(style.marginLeft) +
    parseFloat(style.marginRight)
  )
}

/** 元素 + margin 占位高度 */
export function getOuterHeight(el: HTMLElement): number {
  const style = window.getComputedStyle(el)
  return (
    el.offsetHeight +
    parseFloat(style.marginTop) +
    parseFloat(style.marginBottom)
  )
}

/** 元素是否在视口内（完全可见） */
export function isInViewport(el: Element): boolean {
  const rect = el.getBoundingClientRect()
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= window.innerHeight &&
    rect.right <= window.innerWidth
  )
}

/** 元素是否部分可见 */
export function isPartiallyInViewport(el: Element): boolean {
  const rect = el.getBoundingClientRect()
  return (
    rect.top < window.innerHeight &&
    rect.bottom > 0 &&
    rect.left < window.innerWidth &&
    rect.right > 0
  )
}

/** 元素可见比例（0-1） */
export function getVisibleRatio(el: Element): number {
  const rect = el.getBoundingClientRect()
  const visibleWidth = Math.max(
    0,
    Math.min(rect.right, window.innerWidth) - Math.max(rect.left, 0)
  )
  const visibleHeight = Math.max(
    0,
    Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0)
  )
  const visibleArea = visibleWidth * visibleHeight
  const totalArea = rect.width * rect.height
  return totalArea > 0 ? visibleArea / totalArea : 0
}

/** 元素距离视口顶部距离 */
export function getDistanceToViewportTop(el: Element): number {
  return el.getBoundingClientRect().top
}

/** 元素距离视口底部距离 */
export function getDistanceToViewportBottom(el: Element): number {
  return window.innerHeight - el.getBoundingClientRect().bottom
}

/** 平滑滚动到元素（进入视口） */
export function scrollIntoView(
  el: Element,
  options?: ScrollIntoViewOptions
): void {
  el.scrollIntoView(options ?? { behavior: 'smooth', block: 'start' })
}

/** 滚动到指定位置 */
export function scrollTo(
  target: Element | Window,
  options: { top?: number; left?: number; behavior?: ScrollBehavior } = {}
): void {
  const { top, left, behavior = 'smooth' } = options
  if (target instanceof Window) {
    window.scrollTo({ top, left, behavior })
  } else {
    target.scrollTo({ top, left, behavior })
  }
}

/** 获取滚动位置 */
export function getScrollPosition(
  target?: Element | Window
): { top: number; left: number } {
  if (!target || target instanceof Window) {
    return { top: window.scrollY, left: window.scrollX }
  }
  return { top: target.scrollTop, left: target.scrollLeft }
}
