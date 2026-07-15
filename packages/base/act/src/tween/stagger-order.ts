/**
 * tween/stagger-order · stagger 起始顺序计算 (0.0.5 §5.5 / §6.6)
 */

export type StaggerFrom = 'start' | 'end' | 'center' | number

export interface StaggerGrid {
  readonly rows: number
  readonly cols: number
}

/**
 * 计算 stagger 起始顺序(返回索引数组)
 * - from='start' → [0, 1, 2, ..., n-1]
 * - from='end'   → [n-1, n-2, ..., 1, 0]
 * - from='center' → 从中心向外辐射
 * - from=number  → 以 number 为起点向外辐射
 * - grid 提供时按 (row + col) 距离排序
 */
export function computeStaggerOrder(
  length: number,
  from: StaggerFrom = 'start',
  grid?: StaggerGrid,
): number[] {
  if (length <= 0) return []
  const indices = Array.from({ length }, (_, i) => i)

  if (grid) {
    const { rows, cols } = grid
    const center = computeGridCenter(rows, cols, from)
    return indices
      .map((i) => ({ i, d: gridDistance(i, rows, cols, center) }))
      .sort((a, b) => a.d - b.d)
      .map((x) => x.i)
  }

  if (from === 'start') return indices
  if (from === 'end') return indices.slice().reverse()

  const center = typeof from === 'number' ? from : (length - 1) / 2
  return indices
    .map((i) => ({ i, d: Math.abs(i - center) }))
    .sort((a, b) => a.d - b.d)
    .map((x) => x.i)
}

function computeGridCenter(rows: number, cols: number, from: StaggerFrom): number {
  if (typeof from === 'number') return from
  if (from === 'start') return 0
  if (from === 'end') return rows * cols - 1
  // center: 网格几何中心
  const midRow = (rows - 1) / 2
  const midCol = (cols - 1) / 2
  return Math.round(midRow) * cols + Math.round(midCol)
}

function gridDistance(i: number, rows: number, cols: number, centerIdx: number): number {
  const r1 = Math.floor(i / cols)
  const c1 = i % cols
  const r2 = Math.floor(centerIdx / cols)
  const c2 = centerIdx % cols
  return Math.abs(r1 - r2) + Math.abs(c1 - c2)
}