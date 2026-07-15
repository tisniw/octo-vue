/**
 * tween/motionPath · 沿 SVG 路径动画 (0.0.5 §5.10.2)
 */
import type { PathCommand, TransformParts } from './types.js'
import type { MotionPathOptions } from './types.js'
import { parsePath } from './path.js'
import { applyTransform } from './transform.js'
import { resolveEasing } from '../easing/resolver.js'
import type { EasingFn } from '../easing/types.js'

/** 在路径上获取某归一化点 + 切线角度 */
export function getMotionPathPoint(
  path: PathCommand[],
  t: number,
): { x: number; y: number; angle: number } {
  if (path.length === 0) return { x: 0, y: 0, angle: 0 }
  if (path.length === 1) return { x: path[0]!.x, y: path[0]!.y, angle: 0 }

  const clamped = Math.max(0, Math.min(1, t))
  const segments = path.length - 1
  const scaledT = clamped * segments
  const idx = Math.min(segments - 1, Math.floor(scaledT))
  const localT = scaledT - idx

  const p0 = path[idx]!
  const p1 = path[idx + 1]!
  const dx = p1.x - p0.x
  const dy = p1.y - p0.y
  const angle = Math.atan2(dy, dx) * (180 / Math.PI)

  return {
    x: p0.x + dx * localT,
    y: p0.y + dy * localT,
    angle,
  }
}

/**
 * MotionPath 工厂 — 实际驱动由调用方实现(框架层)
 * 此处仅暴露 getMotionPathPoint 与配置解析
 */
export function createMotionPathState(options: MotionPathOptions) {
  const cmds = typeof options.path === 'string' ? parsePath(options.path) : options.path
  const easingFn: EasingFn = typeof options.ease === 'string'
    ? resolveEasing(options.ease)
    : (options.ease ?? resolveEasing('easeInOutQuad'))
  return {
    cmds,
    easingFn,
    autoRotate: options.autoRotate ?? false,
    start: options.start ?? 0,
    end: options.end ?? 1,
  }
}

/** 在指定 t 时应用 motionPath 到 element */
export function applyMotionPathFrame(
  element: HTMLElement,
  state: ReturnType<typeof createMotionPathState>,
  t: number,
): { x: number; y: number; angle: number } {
  const eased = state.easingFn(Math.max(0, Math.min(1, t)))
  const mapped = state.start + (state.end - state.start) * eased
  const point = getMotionPathPoint(state.cmds, mapped)

  const transformProps: TransformParts = {
    x: point.x,
    y: point.y,
  }
  if (state.autoRotate) {
    transformProps.rotate = (typeof state.autoRotate === 'number' ? state.autoRotate : 0) + point.angle
  }

  applyTransform(element, {}, transformProps, 1)
  return point
}