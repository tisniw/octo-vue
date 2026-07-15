/**
 * tween/morph · 顶点级形变 (0.0.5 §5.10.4)
 */
import { parsePath, stringifyPath } from './path.js'
import type { MorphVertex, NormalizedSegment, PathCommand } from './types.js'

/** 将 PathCommand 数组标准化为全 Bezier 段 */
function normalizePath(cmds: PathCommand[]): NormalizedSegment[] {
  return cmds.map((c) => ({
    x: c.x,
    y: c.y,
    c1x: c.ctrl1X ?? c.x,
    c1y: c.ctrl1Y ?? c.y,
    c2x: c.ctrl2X ?? c.x,
    c2y: c.ctrl2Y ?? c.y,
  }))
}

/** path 形变(全 Bezier 表达输出) */
export function morphPath(fromD: string, toD: string, t: number): string {
  const from = normalizePath(parsePath(fromD))
  const to = normalizePath(parsePath(toD))
  if (from.length === 0) return toD
  if (to.length === 0) return fromD
  if (from.length !== to.length) {
    console.warn(`[act/tween] morphPath 顶点数不同(${from.length} vs ${to.length})`)
    return t < 0.5 ? fromD : toD
  }
  const result = from.map((fp, i) => {
    const tp = to[i]!
    return {
      x: fp.x + (tp.x - fp.x) * t,
      y: fp.y + (tp.y - fp.y) * t,
      c1x: fp.c1x + (tp.c1x - fp.c1x) * t,
      c1y: fp.c1y + (tp.c1y - fp.c1y) * t,
      c2x: fp.c2x + (tp.c2x - fp.c2x) * t,
      c2y: fp.c2y + (tp.c2y - fp.c2y) * t,
    }
  })
  return 'M ' + result.map((p) =>
    `${p.x} ${p.y} C ${p.c1x} ${p.c1y}, ${p.c2x} ${p.c2y}, ${p.x} ${p.y}`,
  ).join(' ') + ' Z'
}

/** 顶点形变(普通顶点数组) */
export function morphVertices(from: MorphVertex[], to: MorphVertex[], t: number): MorphVertex[] {
  if (from.length !== to.length) {
    console.warn('[act/tween] morphVertices 顶点数不同')
    return t < 0.5 ? from.slice() : to.slice()
  }
  return from.map((v, i) => ({
    x: v.x + (to[i]!.x - v.x) * t,
    y: v.y + (to[i]!.y - v.y) * t,
  }))
}

// 重导出 stringifyPath 便于使用
export { stringifyPath }