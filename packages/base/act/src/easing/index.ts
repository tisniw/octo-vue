/**
 * easing 模块桶入口 (0.0.5 §4 + §7)
 *
 * 公开 API:
 * - 类型 4: EasingFn / EasingName / SpringConfig / SpringPoint
 * - 函数 27: linear + 24 缓动 + 4 cubicBezier 入口 + 2 spring + 1 resolveEasing
 */
export type { EasingFn, EasingName, SpringConfig, SpringPoint } from './types.js'

export {
  linear,
  easeInQuad, easeOutQuad, easeInOutQuad,
  easeInCubic, easeOutCubic, easeInOutCubic,
  easeInSine, easeOutSine, easeInOutSine,
  easeInExpo, easeOutExpo, easeInOutExpo,
  easeInCirc, easeOutCirc, easeInOutCirc,
  easeInElastic, easeOutElastic, easeInOutElastic,
  easeInBack, easeOutBack, easeInOutBack,
  easeInBounce, easeOutBounce, easeInOutBounce,
  cubicBezier,
  cubicBezierFromCSS,
  spring,
  springToEasingFn,
} from './functions.js'

export { resolveEasing, EASING_MAP, parseSpringString } from './resolver.js'