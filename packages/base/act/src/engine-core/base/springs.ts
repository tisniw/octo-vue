/**
 * engine-core/base/springs — 弹簧物理单步求解 (0.0.1 §6,本节修订)
 *
 * **本节范围**(0.0.0 §6 + 文档修订):
 * - 仅暴露 `springFrame(prev, vel, target, spec, dt)`,供 SpringDriver 在每帧调用
 * - **不导出**面向消费方的 `spring(spec, duration?)` (那是 0.0.1 §6 旧签名的静态采样);
 *   面向消费方的 `spring(config?)` 缓动版本在 0.0.5 easing/spring.ts
 *
 * 一阶动力学弹簧求解(显式欧拉积分):
 *   a = -stiffness * (x - target) - damping * v
 *   v += a * dt / mass
 *   x += v * dt
 */
import type { SpringFrameResult, SpringSpec } from './types.js'

/** 单步求解:输入当前 (value, velocity) + target + dt → 下一帧 */
export function springFrame(
  prevValue: number,
  prevVelocity: number,
  target: number,
  spec: SpringSpec,
  dt: number,
): SpringFrameResult {
  const stiffness = spec.stiffness
  const damping = spec.damping
  const mass = spec.mass ?? 1
  const restSpeed = spec.restSpeed ?? 0.01
  const restDelta = spec.restDelta ?? 0.0001

  // 1. 弹簧力
  const displacement = prevValue - target
  const springForce = -stiffness * displacement
  // 2. 阻尼力
  const dampingForce = -damping * prevVelocity
  // 3. 加速度 = (弹簧力 + 阻尼力) / 质量
  const acceleration = (springForce + dampingForce) / mass
  // 4. 显式欧拉积分
  const newVelocity = prevVelocity + acceleration * dt
  const newValue = prevValue + newVelocity * dt

  // 5. 静止检测
  if (
    Math.abs(newVelocity) < restSpeed &&
    Math.abs(newValue - target) < restDelta
  ) {
    return { value: target, velocity: 0 }
  }

  return { value: newValue, velocity: newVelocity }
}
