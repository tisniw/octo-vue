/**
 * engine-core/base/keyframes — 关键帧采样 (0.0.1 §4)
 */
import type { InterpolationFn, Interpolatable, Keyframe, KeyframesConfig } from './types.js'
import { interpolate } from './interpolation.js'

/** 线性缓动(默认) */
function linear(t: number): number {
  return t
}

/**
 * 多段关键帧插值器
 * - 每段独立 easing
 * - t ∈ [0,1],超出边界返回首/末帧
 * - 至少 2 帧,否则抛 ActError
 *
 * **类型约束**:`keyframes<T>` 仅约束 T 兼容 `Interpolatable`(number/string),
 * 因为插值器内部基于 interpolate<T extends Interpolatable>。
 * 非数值/字符串(如对象/颜色对象)需通过 `interpolate` 自定义回调传入。
 */
export function keyframes<T extends Interpolatable>(
  config: KeyframesConfig<T>,
): InterpolationFn<T> {
  const { frames, interpolate: interp } = config

  if (frames.length < 2) {
    throw new Error('[octovue/act:base] keyframes: 需要至少 2 个关键帧')
  }

  // 排序:按 offset 升序
  const sorted = [...frames].sort((a, b) => a.offset - b.offset)

  // 预解析每段的插值器与缓动
  type Segment = {
    start: number
    end: number
    easing: (t: number) => number
    interpFn: InterpolationFn<T>
  }
  const segments: Segment[] = []

  for (let i = 0; i < sorted.length - 1; i++) {
    const cur = sorted[i]!
    const next = sorted[i + 1]!
    const segmentEasing = cur.easing ?? linear
    const interpFn = interp
      ? interp(cur.value, next.value)
      : (interpolate as (a: T, b: T) => InterpolationFn<T>)(cur.value, next.value)
    segments.push({
      start: cur.offset,
      end: next.offset,
      easing: segmentEasing,
      interpFn,
    })
  }

  return (t: number) => {
    // 边界裁剪
    if (t <= sorted[0]!.offset) return sorted[0]!.value
    if (t >= sorted[sorted.length - 1]!.offset) return sorted[sorted.length - 1]!.value

    // 找到 t 所在段
    const seg =
      segments.find((s) => t >= s.start && t <= s.end) ?? segments[segments.length - 1]!
    const localT = (t - seg.start) / (seg.end - seg.start)
    return seg.interpFn(seg.easing(localT))
  }
}

/** 关键帧排序:返回按 offset 升序的新数组 (辅助函数) */
export function sortKeyframes<T>(frames: readonly Keyframe<T>[]): Keyframe<T>[] {
  return [...frames].sort((a, b) => a.offset - b.offset)
}
