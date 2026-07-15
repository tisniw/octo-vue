/**
 * easing 模块类型定义 (0.0.5 §4.1, §4.5.2)
 */

/** 缓动函数签名:输入 t ∈ [0,1] 返回 ∈ [0,1] */
export type EasingFn = (t: number) => number

/** 缓动函数名称字面量联合(11 类 × 3 形态 = 16 + linear = 17 项) */
export type EasingName =
  | 'linear'
  | 'easeInQuad' | 'easeOutQuad' | 'easeInOutQuad'
  | 'easeInCubic' | 'easeOutCubic' | 'easeInOutCubic'
  | 'easeInSine' | 'easeOutSine' | 'easeInOutSine'
  | 'easeInExpo' | 'easeOutExpo' | 'easeInOutExpo'
  | 'easeInCirc' | 'easeOutCirc' | 'easeInOutCirc'
  | 'easeInElastic' | 'easeOutElastic' | 'easeInOutElastic'
  | 'easeInBack' | 'easeOutBack' | 'easeInOutBack'
  | 'easeInBounce' | 'easeOutBounce' | 'easeInOutBounce'

/** 弹簧配置(0.0.5 §4.5.2) */
export interface SpringConfig {
  /** 刚度(默认 100;越大越快回到平衡) */
  stiffness?: number
  /** 阻尼(默认 10;越小越震荡) */
  damping?: number
  /** 质量(默认 1;越大惯性越大) */
  mass?: number
  /** 静止阈值(默认 0.0005) */
  restThreshold?: number
  /** 积分步长(默认 1/60s,即 60fps) */
  dt?: number
  /** 采样点数量(默认 100) */
  samples?: number
}

/** 单个采样点(x 为归一化时间 0-1,y 为归一化位置 0-1) */
export interface SpringPoint {
  x: number
  y: number
}