/**
 * easing 模块 · 缓动函数实现 (0.0.5 §4.2-§4.5)
 *
 * 25 个缓动函数 + cubicBezier + spring + springToEasingFn + 4 个 Material 预设
 * 所有函数输入 t ∈ [0,1],输出 ∈ [0,1]
 */
import type { EasingFn, SpringConfig, SpringPoint } from './types.js'

// ============================================================
// 基础函数(0.0.5 §4.2)
// ============================================================

export const linear: EasingFn = (t) => t

// Quad
export const easeInQuad: EasingFn = (t) => t * t
export const easeOutQuad: EasingFn = (t) => 1 - (1 - t) * (1 - t)
export const easeInOutQuad: EasingFn = (t) =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2

// Cubic
export const easeInCubic: EasingFn = (t) => t * t * t
export const easeOutCubic: EasingFn = (t) => 1 - Math.pow(1 - t, 3)
export const easeInOutCubic: EasingFn = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

// Sine
export const easeInSine: EasingFn = (t) => 1 - Math.cos((t * Math.PI) / 2)
export const easeOutSine: EasingFn = (t) => Math.sin((t * Math.PI) / 2)
export const easeInOutSine: EasingFn = (t) => -(Math.cos(Math.PI * t) - 1) / 2

// Expo
export const easeInExpo: EasingFn = (t) =>
  t === 0 ? 0 : Math.pow(2, 10 * t - 10)
export const easeOutExpo: EasingFn = (t) =>
  t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
export const easeInOutExpo: EasingFn = (t) =>
  t === 0
    ? 0
    : t === 1
      ? 1
      : t < 0.5
        ? Math.pow(2, 20 * t - 10) / 2
        : (2 - Math.pow(2, -20 * t + 10)) / 2

// Circ
export const easeInCirc: EasingFn = (t) => 1 - Math.sqrt(1 - Math.pow(t, 2))
export const easeOutCirc: EasingFn = (t) => Math.sqrt(1 - Math.pow(t - 1, 2))
export const easeInOutCirc: EasingFn = (t) =>
  t < 0.5
    ? (1 - Math.sqrt(1 - Math.pow(2 * t, 2))) / 2
    : (Math.sqrt(1 - Math.pow(-2 * t + 2, 2)) + 1) / 2

// Elastic
const ELASTIC_C4 = (2 * Math.PI) / 3
const ELASTIC_C5 = (2 * Math.PI) / 4.5
export const easeInElastic: EasingFn = (t) => {
  if (t === 0 || t === 1) return t
  return -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * ELASTIC_C4)
}
export const easeOutElastic: EasingFn = (t) => {
  if (t === 0 || t === 1) return t
  return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ELASTIC_C4) + 1
}
export const easeInOutElastic: EasingFn = (t) => {
  if (t === 0 || t === 1) return t
  return t < 0.5
    ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * ELASTIC_C5)) / 2
    : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * ELASTIC_C5)) / 2 + 1
}

// Back
const BACK_S = 1.70158
const BACK_S_INOUT = 2.5949095
export const easeInBack: EasingFn = (t) => {
  if (t === 1) return 1
  const c1 = BACK_S
  const c3 = c1 + 1
  return c3 * t * t * t - c1 * t * t
}
export const easeOutBack: EasingFn = (t) => {
  const c1 = BACK_S
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}
export const easeInOutBack: EasingFn = (t) => {
  const c1 = BACK_S_INOUT
  const c2 = c1 + 1
  return t < 0.5
    ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
    : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2
}

// Bounce
const BOUNCE_N1 = 7.5625
const BOUNCE_D1 = 2.75
function bounceOut(t: number): number {
  if (t < 1 / BOUNCE_D1) return BOUNCE_N1 * t * t
  if (t < 2 / BOUNCE_D1) return BOUNCE_N1 * (t -= 1.5 / BOUNCE_D1) * t + 0.75
  if (t < 2.5 / BOUNCE_D1) return BOUNCE_N1 * (t -= 2.25 / BOUNCE_D1) * t + 0.9375
  return BOUNCE_N1 * (t -= 2.625 / BOUNCE_D1) * t + 0.984375
}
export const easeOutBounce: EasingFn = (t) => bounceOut(t)
export const easeInBounce: EasingFn = (t) => 1 - bounceOut(1 - t)
export const easeInOutBounce: EasingFn = (t) =>
  t < 0.5 ? (1 - bounceOut(1 - 2 * t)) / 2 : (1 + bounceOut(2 * t - 1)) / 2

// ============================================================
// Material 预设曲线(0.0.5 §4.4.5)
// ============================================================

export const easeInSinePreset = cubicBezier(0.12, 0, 0.39, 0) // Material decelerate
export const easeOutSinePreset = cubicBezier(0.61, 1, 0.88, 1) // Material accelerate
export const easeInOutSinePreset = cubicBezier(0.37, 0, 0.63, 1) // Material standard
export const easeOutExpoPreset = cubicBezier(0.19, 1, 0.22, 1) // Material sharp

// ============================================================
// cubicBezier · 三次贝塞尔曲线缓动 (0.0.5 §4.4)
// ============================================================

const NEWTON_ITERATIONS = 4
const NEWTON_MIN_SLOPE = 0.001
const SUBDIVISION_PRECISION = 0.0000001
const SUBDIVISION_MAX_ITERATIONS = 10

/** 三次贝塞尔公式(计算 x 或 y 在 t 时刻的值) */
function calcBezier(t: number, a1: number, a2: number): number {
  return ((1 - 3 * a2 + 3 * a1) * t + (3 * a2 - 6 * a1)) * t * t + 3 * a1 * t
}

/**
 * 三次贝塞尔曲线缓动函数(对齐 CSS cubic-bezier 语义)
 * 控制点:P0=(0,0), P1=(p1x,p1y), P2=(p2x,p2y), P3=(1,1)
 */
export function cubicBezier(
  p1x: number,
  p1y: number,
  p2x: number,
  p2y: number,
): EasingFn {
  if (p1x < 0 || p1x > 1 || p2x < 0 || p2x > 1) {
    throw new RangeError(
      `[act/easing] cubicBezier 控制点 x 必须在 [0, 1],收到 (${p1x}, ${p2x})`,
    )
  }

  // 预采样 11 点用于二分查找粗定位
  const sampleValues = new Float64Array(11)
  for (let i = 0; i < 11; i++) sampleValues[i] = calcBezier(i * 0.1, p1x, p2x)

  function aForT(t: number): number {
    return ((1 - 3 * p2x + 3 * p1x) * t + (3 * p2x - 6 * p1x)) * t + 3 * p1x
  }

  function bForT(t: number, a: number): number {
    return (
      ((1 - 3 * p2x + 3 * p1x) * t + (3 * p2x - 6 * p1x)) * t * t +
      3 * p1x * t -
      a
    )
  }

  function slopeForT(t: number): number {
    return (
      3 *
      ((1 - 3 * p2x + 3 * p1x) * t * t + (2 * p2x - 4 * p1x) * t + p1x)
    )
  }

  function newtonRaphsonIterate(t: number, a: number): number {
    for (let i = 0; i < NEWTON_ITERATIONS; i++) {
      const slope = slopeForT(t)
      if (slope === 0) return t
      const b = bForT(t, a)
      t -= b / slope
    }
    return t
  }

  function binarySubdivide(a: number, mA: number, mB: number): number {
    let currentT = 0
    let currentX = 0
    let i = 0
    do {
      currentT = mA + (mB - mA) / 2
      currentX = calcBezier(currentT, p1x, p2x) - a
      if (currentX > 0) mB = currentT
      else mA = currentT
    } while (Math.abs(currentX) > SUBDIVISION_PRECISION && ++i < SUBDIVISION_MAX_ITERATIONS)
    return currentT
  }

  function getTForX(a: number): number {
    let i = 1
    let currentX = 0
    for (; i < 10 && a >= sampleValues[i]!; i++) {
      currentX = sampleValues[i]!
    }
    i--
    const dist = (a - currentX) / (sampleValues[i + 1]! - currentX)
    const guessForT = i * 0.1 + dist * 0.1
    const initialSlope = aForT(guessForT)
    if (initialSlope >= NEWTON_MIN_SLOPE) {
      return newtonRaphsonIterate(guessForT, a)
    } else if (initialSlope === 0) {
      return guessForT
    }
    return binarySubdivide(a, i * 0.1, (i + 1) * 0.1)
  }

  return (t: number): number => {
    if (t === 0 || t === 1) return t
    return calcBezier(getTForX(t), p1y, p2y)
  }
}

/** 从 CSS 字符串解析 cubic-bezier() */
export function cubicBezierFromCSS(cssValue: string): EasingFn {
  const match = cssValue
    .trim()
    .match(
      /^cubic-bezier\(\s*([0-9.+\-eE]+)\s*,\s*([0-9.+\-eE]+)\s*,\s*([0-9.+\-eE]+)\s*,\s*([0-9.+\-eE]+)\s*\)$/,
    )
  if (!match) {
    throw new SyntaxError(
      `[act/easing] 无法解析 cubic-bezier 字符串:"${cssValue}"`,
    )
  }
  return cubicBezier(
    Number(match[1]),
    Number(match[2]),
    Number(match[3]),
    Number(match[4]),
  )
}

// ============================================================
// spring() · 弹簧缓动 (0.0.5 §4.5)
// ============================================================

const DEFAULT_SPRING_CONFIG: Required<SpringConfig> = {
  stiffness: 100,
  damping: 10,
  mass: 1,
  restThreshold: 0.0005,
  dt: 1 / 60,
  samples: 100,
}

interface RawSpringPoint {
  x: number
  t: number
}

/**
 * 一阶动力学弹簧求解(显式欧拉积分)
 *   a = -stiffness * (x - 1) - damping * v
 *   v += a * dt / mass
 *   x += v * dt
 * 初始条件:x=0, v=0(趋向 x=1 平衡位置)
 */
function solveSpring(
  stiffness: number,
  damping: number,
  mass: number,
  dt: number,
  restThreshold: number,
  maxSamples: number,
): RawSpringPoint[] {
  const points: RawSpringPoint[] = []
  let x = 0
  let v = 0
  let t = 0

  for (let i = 0; i < maxSamples; i++) {
    const springForce = -stiffness * (x - 1)
    const dampingForce = -damping * v
    const acceleration = (springForce + dampingForce) / mass
    v += acceleration * dt
    x += v * dt
    t += dt
    points.push({ x, t })

    // 静止检测:补足到末尾采样
    if (Math.abs(x - 1) < restThreshold && Math.abs(v) < restThreshold) {
      for (let j = i + 1; j < maxSamples; j++) {
        points.push({ x: 1, t })
      }
      return points
    }
  }

  return points
}

function validateSpringConfig(cfg: Required<SpringConfig>): void {
  if (cfg.stiffness < 0) {
    throw new RangeError('[act/easing] spring.stiffness 不能为负')
  }
  if (cfg.damping < 0) {
    throw new RangeError('[act/easing] spring.damping 不能为负')
  }
  if (cfg.mass <= 0) {
    throw new RangeError('[act/easing] spring.mass 必须 > 0')
  }
}

/** 弹簧采样,返回归一化关键帧数组 */
export function spring(config?: SpringConfig): SpringPoint[] {
  const cfg = { ...DEFAULT_SPRING_CONFIG, ...config }
  validateSpringConfig(cfg)
  if (cfg.samples <= 0) return []

  const raw = solveSpring(
    cfg.stiffness,
    cfg.damping,
    cfg.mass,
    cfg.dt,
    cfg.restThreshold,
    cfg.samples,
  )

  const maxT = raw[raw.length - 1]?.t ?? 1
  if (maxT === 0) return []
  return raw.map((p) => ({ x: p.t / maxT, y: p.x }))
}

/** 将弹簧采样转为可调用的缓动函数 */
export function springToEasingFn(config?: SpringConfig): EasingFn {
  const points = spring(config)
  if (points.length === 0) return (t) => t

  return (t: number): number => {
    if (t <= 0) return 0
    if (t >= 1) return 1

    // 二分查找:找到 points[i].x >= t 的最小 i
    let lo = 0
    let hi = points.length - 1
    while (lo < hi) {
      const mid = (lo + hi) >>> 1
      if (points[mid]!.x < t) lo = mid + 1
      else hi = mid
    }
    const i = Math.max(0, lo - 1)
    const p0 = points[i]!
    const p1 = points[Math.min(i + 1, points.length - 1)]!
    const span = p1.x - p0.x
    if (span <= 0) return p0.y
    return p0.y + (p1.y - p0.y) * ((t - p0.x) / span)
  }
}