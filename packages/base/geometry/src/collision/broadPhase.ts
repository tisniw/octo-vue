import type { Rect } from '../primitive/types.js'
import { UniformGrid } from './uniformGrid.js'

/**
 * Broad Phase:用 AABB 包围盒预筛 N 个物体
 * 返回可能碰撞的对的索引 (i, j) for i < j
 */
export function broadPhase(
  items: ReadonlyArray<{ aabb(): Rect; body: unknown }>,
  worldBounds: Rect,
  cellSize: number = 64,
): Array<[number, number]> {
  const grid = new UniformGrid<{ aabb(): Rect; body: unknown }>(worldBounds, cellSize)

  for (let i = 0; i < items.length; i++) {
    grid.insert({ item: items[i], index: i })
  }

  return grid.queryAllPairs()
}
