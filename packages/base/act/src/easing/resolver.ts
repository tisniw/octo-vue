/**
 * easing 模块 · 字符串 / 对象解析 (0.0.5 §4.3, §4.4.4, §4.5.4)
 */
import {
  cubicBezierFromCSS,
  easeInBack,
  easeInBounce,
  easeInCirc,
  easeInCubic,
  easeInElastic,
  easeInExpo,
  easeInOutBack,
  easeInOutBounce,
  easeInOutCirc,
  easeInOutCubic,
  easeInOutElastic,
  easeInOutExpo,
  easeInOutQuad,
  easeInOutSine,
  easeInQuad,
  easeInSine,
  easeOutBack,
  easeOutBounce,
  easeOutCirc,
  easeOutCubic,
  easeOutElastic,
  easeOutExpo,
  easeOutQuad,
  easeOutSine,
  linear,
  springToEasingFn,
} from './functions.js'
import type { EasingFn, SpringConfig } from './types.js'

/** 25 个缓动函数的名称索引 */
export const EASING_MAP: Record<string, EasingFn> = {
  linear,
  easeInQuad, easeOutQuad, easeInOutQuad,
  easeInCubic, easeOutCubic, easeInOutCubic,
  easeInSine, easeOutSine, easeInOutSine,
  easeInExpo, easeOutExpo, easeInOutExpo,
  easeInCirc, easeOutCirc, easeInOutCirc,
  easeInElastic, easeOutElastic, easeInOutElastic,
  easeInBack, easeOutBack, easeInOutBack,
  easeInBounce, easeOutBounce, easeInOutBounce,
}

/** 解析 spring(...) 字符串 → SpringConfig */
export function parseSpringString(s: string): SpringConfig {
  const inside = s.slice(7, -1).trim()
  if (!inside) return {}
  const parts = inside.split(',').map((p) => p.trim())

  // 位置参数形式: stiffness, damping, mass
  if (parts.length >= 3 && !parts[0]!.includes('=')) {
    return {
      stiffness: Number(parts[0]),
      damping: Number(parts[1]),
      mass: Number(parts[2]),
    }
  }

  // KV 形式
  const config: SpringConfig = {}
  for (const part of parts) {
    const eq = part.indexOf('=')
    if (eq < 0) continue
    const k = part.slice(0, eq).trim()
    const v = part.slice(eq + 1).trim()
    if (k === 'stiffness') config.stiffness = Number(v)
    else if (k === 'damping') config.damping = Number(v)
    else if (k === 'mass') config.mass = Number(v)
  }
  return config
}

/**
 * 字符串 / 对象 / 函数 统一解析为 EasingFn
 *
 * 支持:
 * 1. 函数 → 直接返回
 * 2. SpringConfig 对象(有 stiffness / damping / mass 字段)→ springToEasingFn
 * 3. 'spring(...)' 字符串 → springToEasingFn(parseSpringString(...))
 * 4. 'cubic-bezier(...)' 字符串 → cubicBezierFromCSS
 * 5. EASING_MAP 中的命名 → 查表
 * 6. 未知 → console.warn + fallback linear
 */
export function resolveEasing(
  name: string | EasingFn | SpringConfig,
): EasingFn {
  if (typeof name === 'function') return name

  // 对象: 检查 SpringConfig 字段
  if (typeof name === 'object' && name !== null) {
    if ('stiffness' in name || 'damping' in name || 'mass' in name) {
      return springToEasingFn(name as SpringConfig)
    }
  }

  if (typeof name !== 'string') {
    console.warn(`[act/easing] resolveEasing: 无法解析 ${String(name)}`)
    return linear
  }

  // spring(...) 字符串
  if (name.startsWith('spring(') && name.endsWith(')')) {
    return springToEasingFn(parseSpringString(name))
  }

  // cubic-bezier(...) 字符串
  if (name.startsWith('cubic-bezier(')) {
    try {
      return cubicBezierFromCSS(name)
    } catch (e) {
      console.warn(`[act/easing] 解析 cubic-bezier 失败:"${name}"`, e)
      return linear
    }
  }

  // EASING_MAP 查表
  const fn = EASING_MAP[name]
  if (!fn) {
    console.warn(`[act/easing] Unknown easing "${name}", fallback to linear`)
    return linear
  }
  return fn
}