/**
 * tween/props · 属性插值白名单 (0.0.5 §5.2)
 */

/** 白名单:可以 tween 的属性 */
export const TWEENABLE_PROPS: ReadonlySet<string> = new Set([
  // 数值(px)
  'x', 'y', 'z', 'width', 'height', 'top', 'left', 'right', 'bottom',
  // 数值(无单位)
  'opacity', 'scale', 'scaleX', 'scaleY', 'scaleZ',
  'rotate', 'rotateX', 'rotateY', 'rotateZ',
  // 颜色
  'backgroundColor', 'color', 'borderColor', 'fill', 'stroke',
  // 其他
  'scrollTop', 'scrollLeft',
])

/** 判断是否为白名单属性 */
export function isTweenable(prop: string): boolean {
  return TWEENABLE_PROPS.has(prop)
}