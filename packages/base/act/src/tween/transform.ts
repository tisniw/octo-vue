/**
 * tween/transform · Transform 组件自动组合 (0.0.5 §5.9.3)
 *
 * 将 x/y/scale/rotate/skew 组件按 translate → scale → rotate → skew 顺序组合为 matrix 字符串
 */
import type { TransformParts } from './types.js'

const TRANSFORM_KEYS: ReadonlySet<string> = new Set([
  'x', 'y', 'z', 'scale', 'scaleX', 'scaleY', 'scaleZ',
  'rotate', 'rotateX', 'rotateY', 'rotateZ',
  'skewX', 'skewY', 'origin', 'perspective',
])

/** 判断是否为 transform 组件键 */
export function isTransformKey(key: string): boolean {
  return TRANSFORM_KEYS.has(key)
}

interface Matrix3x3 {
  a: number; b: number; c: number; d: number; e: number; f: number
}

const IDENTITY: Matrix3x3 = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }

/** 矩阵乘法 */
function multiply(m1: Matrix3x3, m2: Matrix3x3): Matrix3x3 {
  return {
    a: m1.a * m2.a + m1.c * m2.b,
    b: m1.b * m2.a + m1.d * m2.b,
    c: m1.a * m2.c + m1.c * m2.d,
    d: m1.b * m2.c + m1.d * m2.d,
    e: m1.a * m2.e + m1.c * m2.f + m1.e,
    f: m1.b * m2.e + m1.d * m2.f + m1.f,
  }
}

/** 平移 */
function translate(x: number, y: number, z = 0): Matrix3x3 {
  void z
  return { ...IDENTITY, e: x, f: y }
}

/** 缩放 */
function scale(sx: number, sy: number, sz = 1): Matrix3x3 {
  void sz
  return { ...IDENTITY, a: sx, d: sy }
}

/** 旋转(deg) */
function rotate(deg: number): Matrix3x3 {
  const rad = (deg * Math.PI) / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  return { a: cos, b: sin, c: -sin, d: cos, e: 0, f: 0 }
}

/** 倾斜(deg) */
function skew(skewX: number, skewY: number): Matrix3x3 {
  return {
    a: 1,
    b: Math.tan((skewY * Math.PI) / 180),
    c: Math.tan((skewX * Math.PI) / 180),
    d: 1,
    e: 0,
    f: 0,
  }
}

/** 矩阵组合(顺序: translate → scale → rotate → skew) */
function compose(parts: {
  tx: number; ty: number; tz: number
  sx: number; sy: number; sz: number
  rot: number
  skx: number; sky: number
}): Matrix3x3 {
  const t = translate(parts.tx, parts.ty, parts.tz)
  const s = scale(parts.sx, parts.sy, parts.sz)
  const r = rotate(parts.rot)
  const k = skew(parts.skx, parts.sky)
  // 顺序:translate → scale → rotate → skew
  return multiply(multiply(multiply(t, s), r), k)
}

/** 输出 matrix CSS 字符串 */
function matrixToCss(m: Matrix3x3): string {
  return `matrix(${m.a}, ${m.b}, ${m.c}, ${m.d}, ${m.e}, ${m.f})`
}

/** 索引化 TransformParts */
type IndexedTransformParts = {
  [K in keyof TransformParts]: TransformParts[K]
} & Record<string, number | string | undefined>

/** 每个 element 的 transform 状态缓存 */
const transformStateCache = new WeakMap<HTMLElement, TransformParts>()

function getOrInitState(element: HTMLElement): IndexedTransformParts {
  let state = transformStateCache.get(element) as IndexedTransformParts | undefined
  if (!state) {
    state = {} as IndexedTransformParts
    transformStateCache.set(element, state)
  }
  return state
}

/**
 * 应用 Transform 组件到 element(平滑过渡)
 * @param element  目标 element
 * @param fromProps 起点(每字段未提供则用上次状态)
 * @param toProps 终点
 * @param t ∈ [0, 1]
 */
export function applyTransform(
  element: HTMLElement,
  fromProps: TransformParts,
  toProps: TransformParts,
  t: number,
): TransformParts {
  const state = getOrInitState(element)
  const next: IndexedTransformParts = { ...state }

  for (const key of Object.keys(toProps)) {
    const fromVal = (fromProps as Record<string, number | string | undefined>)[key]
    const toVal = (toProps as Record<string, number | string | undefined>)[key]
    if (typeof fromVal === 'number' && typeof toVal === 'number') {
      next[key] = fromVal + (toVal - fromVal) * t
    } else if (toVal !== undefined) {
      next[key] = toVal
    }
  }

  const matrix = compose({
    tx: next.x ?? 0,
    ty: next.y ?? 0,
    tz: next.z ?? 0,
    sx: next.scaleX ?? next.scale ?? 1,
    sy: next.scaleY ?? next.scale ?? 1,
    sz: next.scaleZ ?? 1,
    rot: next.rotate ?? 0,
    skx: next.skewX ?? 0,
    sky: next.skewY ?? 0,
  })

  let transformStr = matrixToCss(matrix)
  if (next.perspective !== undefined) {
    transformStr = `perspective(${next.perspective}px) ${transformStr}`
  }

  element.style.transform = transformStr
  if (next.origin) element.style.transformOrigin = next.origin

  transformStateCache.set(element, next)
  return next as TransformParts
}

/** 清除 element 的 transform 状态缓存 */
export function clearTransformState(element: HTMLElement): void {
  transformStateCache.delete(element)
}