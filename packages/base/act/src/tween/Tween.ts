/**
 * tween/Tween · 元素动画主体 (0.0.5 §5.4 + §5.5 + §5.6 + §5.7 + §5.9.2)
 *
 * 提供:tween / fromTo / staggerTo / staggerFromTo / set
 * + 内部 applyValues 复用 + nanoid
 */
import type { Driver } from '../engine-core/engines/Driver.js'
import { getGlobalDriver } from '../engine-core/engines/Driver.js'
import type { TweenId } from '../types.js'
import { resolveEasing } from '../easing/resolver.js'
import type { EasingFn } from '../easing/types.js'
import { applyTransform, isTransformKey } from './transform.js'
import { interpolateArray } from './array.js'
import { interpolatePath } from './path.js'
import { interpolatePoints } from './array.js'
import { interpolateSvgAttr, isSvgAttr } from './svg.js'
import { computeStaggerOrder } from './stagger-order.js'
import {
  isCssVarKey,
  parseCssValue,
  interpolateCssValue,
  readCssVar,
  readDOMProperty,
  resolveTarget,
  writeCssValueToDom,
  writeTargetValue,
} from './targets.js'
import type {
  StaggerOptions,
  TransformParts,
  TweenHandle,
  TweenObjectTarget,
  TweenOptions,
  TweenTarget,
} from './types.js'
import { TWEEN_KIND } from './types.js'

/** 简易 nanoid */
function nanoId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)
}

/** Tween 内部帧逻辑 */
interface TweenInternals {
  startedAt: number
  paused: boolean
  state: 'idle' | 'playing' | 'paused' | 'finished'
  direction: 'forward' | 'backward'
  fromProps: Record<string, number | string>
  toProps: Record<string, number | string>
  easingFn: EasingFn
}

/**
 * 通用内部实现:创建 tween handle 并订阅 driver
 * @param target 目标元素
 * @param fromProps 起点(可为空对象,表示从当前值起)
 * @param toProps 终点(必填)
 * @param options 配置
 * @param applyImmediately 是否立即写入 from(t=0 状态)
 */
function createTweenInternal(
  target: TweenTarget,
  fromProps: Record<string, number | string>,
  toProps: Record<string, number | string>,
  options: TweenOptions,
  applyImmediately: boolean,
): TweenHandle {
  const driver = getGlobalDriver() as Driver
  const {
    duration = 1000,
    delay = 0,
    ease = 'easeInOutQuad',
    onUpdate,
    onComplete,
    onStart,
  } = options

  const easingFn: EasingFn = typeof ease === 'string' ? resolveEasing(ease) : ease
  const resolved = resolveTarget(target)

  // 立即写入 from(0 状态)
  if (applyImmediately) {
    applyValues(target, resolved, fromProps, fromProps, 0)
  }

  const internals: TweenInternals = {
    startedAt: 0,
    paused: false,
    state: 'idle',
    direction: 'forward',
    fromProps,
    toProps,
    easingFn,
  }

  let reverseFrom = false

  const handle: TweenHandle = {
    id: nanoId() as TweenId,
    state: 'idle',
    kind: TWEEN_KIND,
    play() {
      // 从 idle/paused/finished 启动
      if (internals.state === 'finished') {
        // 重启:重置 startedAt 与 state,下次 tick 会重新触发 onStart
        internals.startedAt = 0
        internals.state = 'idle'
      }
      internals.paused = false
      internals.state = 'playing'
      handle.state = 'playing'
      return handle
    },
    pause() {
      internals.paused = true
      internals.state = 'paused'
      handle.state = 'paused'
      return handle
    },
    resume() {
      internals.paused = false
      internals.state = 'playing'
      handle.state = 'playing'
      return handle
    },
    seek(progress: number) {
      const t = Math.max(0, Math.min(1, progress))
      const eased = easingFn(t)
      applyValues(target, resolved, internals.fromProps, internals.toProps, eased)
      onUpdate?.(eased)
      if (t >= 1) {
        internals.state = 'finished'
        handle.state = 'finished'
      }
      return handle
    },
    reverse() {
      // 交换 from / to
      const tmp = internals.fromProps
      internals.fromProps = internals.toProps
      internals.toProps = tmp
      reverseFrom = !reverseFrom
      // 重置到起点
      internals.startedAt = 0
      internals.state = 'idle'
      handle.state = 'idle'
      return handle
    },
    kill() {
      internals.state = 'finished'
      handle.state = 'finished'
      unsubscribe()
    },
  }

  const unsubscribe = driver.subscribe((_delta, time) => {
    if (internals.paused || internals.state === 'finished') return

    if (internals.state === 'idle') {
      internals.startedAt = time + delay
      internals.state = 'playing'
      handle.state = 'playing'
      onStart?.()
    }

    const elapsed = time - internals.startedAt
    if (elapsed < 0) return

    const t = Math.min(elapsed / duration, 1)
    const easedT = easingFn(t)
    applyValues(target, resolved, internals.fromProps, internals.toProps, easedT)
    onUpdate?.(easedT)

    if (t >= 1) {
      internals.state = 'finished'
      handle.state = 'finished'
      onComplete?.()
      unsubscribe()
    }
  })

  // 防止 reverseFrom 未使用警告
  void reverseFrom

  return handle
}

/** Transform + 其他属性的合并 view */
type PropBag = Record<string, number | string | undefined>

/**
 * 应用 values 到 target(0.0.5 §5.4 + §5.7.7)
 * - CSS Variable 走 interpolateCssValue
 * - Transform 组件走 applyTransform(组合)
 * - 普通 DOM 属性走 writeTargetValue
 * - 对象走 writeTargetValue
 * - SVG 路径/points 走专门插值
 */
function applyValues(
  target: TweenTarget,
  resolved: ReturnType<typeof resolveTarget>,
  from: Record<string, number | string>,
  to: Record<string, number | string>,
  t: number,
): void {
  // 检查是否有 transform 组件需要特殊处理
  const hasTransformKeys = Object.keys(to).some(isTransformKey)
  if (hasTransformKeys && resolved.kind === 'dom') {
    // 拆分:transform 组件 + 其他属性
    const transformFrom: TransformParts = {}
    const transformTo: TransformParts = {}
    const otherFrom: Record<string, number | string> = {}
    const otherTo: Record<string, number | string> = {}
    for (const k of Object.keys(to)) {
      const tv = to[k]
      if (isTransformKey(k)) {
        ;(transformTo as PropBag)[k] = tv
        const fv = from[k]
        if (fv !== undefined) (transformFrom as PropBag)[k] = fv
      } else {
        ;(otherTo as PropBag)[k] = tv
        const fv = from[k]
        if (fv !== undefined) (otherFrom as PropBag)[k] = fv
      }
    }
    applyTransform(resolved.element, transformFrom, transformTo, t)
    applyOtherValues(target, resolved, otherFrom, otherTo, t)
    return
  }

  applyOtherValues(target, resolved, from, to, t)
}

function applyOtherValues(
  target: TweenTarget,
  resolved: ReturnType<typeof resolveTarget>,
  from: Record<string, number | string>,
  to: Record<string, number | string>,
  t: number,
): void {
  for (const key of Object.keys(to)) {
    // CSS Variable 走专门路径
    if (resolved.kind === 'dom' && isCssVarKey(key)) {
      const element = resolved.element
      const fromValStr = from[key] !== undefined ? String(from[key]) : readCssVar(element, key)
      const toValStr = String(to[key])
      const fromParsed = parseCssValue(fromValStr)
      const toParsed = parseCssValue(toValStr)
      const interpolated = interpolateCssValue(fromParsed, toParsed, t)
      writeCssValueToDom(element, key, interpolated)
      continue
    }
    // SVG path / points
    if (resolved.kind === 'dom' && isSvgAttr(key)) {
      const element = resolved.element
      const fromVal = from[key] ?? readDOMProperty(element, key)
      const toVal = to[key]!
      const kind = isSvgAttr(key)
      const interp = interpolateSvgAttr(
        key,
        fromVal,
        toVal,
        t,
        interpolatePath,
        interpolatePoints,
      )
      if (kind === 'numeric') {
        writeTargetValue(resolved, key, interp)
      } else {
        element.setAttribute(key, interp)
      }
      continue
    }
    // 普通路径
    const fromVal = from[key] ?? (resolved.kind === 'dom' ? readDOMProperty(resolved.element, key) : 0)
    const toVal = to[key]!
    let value: number | string
    if (typeof fromVal === 'number' && typeof toVal === 'number') {
      value = fromVal + (toVal - fromVal) * t
    } else if (typeof fromVal === 'string' && typeof toVal === 'string') {
      const fromKind = parseCssValue(fromVal).kind
      const toKind = parseCssValue(toVal).kind
      if (fromKind === 'number' && toKind === 'number') {
        const fn = parseCssValue(fromVal)
        const tn = parseCssValue(toVal)
        value = String((fn as { number: number }).number + ((tn as { number: number }).number - (fn as { number: number }).number) * t)
      } else {
        value = interpolateCssValue(parseCssValue(fromVal), parseCssValue(toVal), t)
      }
    } else {
      value = toVal
    }
    writeTargetValue(resolved, key, value)
  }
}

// ============================================================
// 公开 API(0.0.5 §5.4 / §5.5 / §5.6 / §5.9.2)
// ============================================================

/** 单 tween:从当前值 → 目标 */
export function tween(
  target: TweenTarget,
  props: Record<string, number | string>,
  options: TweenOptions = {},
): TweenHandle {
  const resolved = resolveTarget(target)
  const startValues: Record<string, number | string> = {}
  for (const key of Object.keys(props)) {
    if (resolved.kind === 'dom') {
      if (isCssVarKey(key)) {
        startValues[key] = readCssVar(resolved.element, key)
        continue
      }
      startValues[key] = readDOMProperty(resolved.element, key)
    } else {
      startValues[key] = (resolved.obj as TweenObjectTarget)[key] ?? 0
    }
  }
  return createTweenInternal(target, startValues, props, options, false)
}

/** fromTo:从指定起点 → 终点 */
export function fromTo(
  target: TweenTarget,
  fromProps: Record<string, number | string>,
  toProps: Record<string, number | string>,
  options: TweenOptions = {},
): TweenHandle {
  return createTweenInternal(target, fromProps, toProps, options, true)
}

/** Stagger 多目标 */
export function staggerTo(
  targets: TweenTarget[],
  props: Record<string, number | string>,
  options: StaggerOptions = {},
): TweenHandle[] {
  const { stagger = 50, from = 'start', grid, ...tweenOpts } = options
  const order = computeStaggerOrder(targets.length, from, grid)
  return order.map((index, i) => {
    const itemOpts = { ...tweenOpts, delay: (tweenOpts.delay ?? 0) + i * stagger }
    return tween(targets[index]!, props, itemOpts)
  })
}

/** Stagger fromTo */
export function staggerFromTo(
  targets: TweenTarget[],
  fromProps: Record<string, number | string>,
  toProps: Record<string, number | string>,
  options: StaggerOptions = {},
): TweenHandle[] {
  const { stagger = 50, from: fromOpt = 'start', grid, ...tweenOpts } = options
  const order = computeStaggerOrder(targets.length, fromOpt, grid)
  return order.map((index, i) => {
    const itemOpts = { ...tweenOpts, delay: (tweenOpts.delay ?? 0) + i * stagger }
    return fromTo(targets[index]!, fromProps, toProps, itemOpts)
  })
}

/** set:立即设置(无动画) */
export function set(
  target: TweenTarget,
  props: Record<string, number | string>,
): TweenHandle {
  const resolved = resolveTarget(target)
  applyValues(target, resolved, props, props, 1)
  return {
    id: nanoId() as TweenId,
    state: 'finished',
    kind: TWEEN_KIND,
    play() { return this },
    pause() { return this },
    resume() { return this },
    seek() { return this },
    reverse() { return this },
    kill() { /* no-op */ },
  }
}

// 重新导出 interpolateArray 便于使用
export { interpolateArray }