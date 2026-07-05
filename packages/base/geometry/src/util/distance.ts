import type { Point, Point3D } from '../primitive/types.js'

/** 欧氏距离(2D) */
export function distance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x
  const dy = p2.y - p1.y
  return Math.sqrt(dx * dx + dy * dy)
}

/** 距离平方(避免开方) */
export function distanceSq(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x
  const dy = p2.y - p1.y
  return dx * dx + dy * dy
}

/** 3D 距离 */
export function distance3D(p1: Point3D, p2: Point3D): number {
  const dx = p2.x - p1.x
  const dy = p2.y - p1.y
  const dz = p2.z - p1.z
  return Math.sqrt(dx * dx + dy * dy + dz * dz)
}

/** 3D 距离平方 */
export function distanceSq3D(p1: Point3D, p2: Point3D): number {
  return (p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2 + (p2.z - p1.z) ** 2
}
