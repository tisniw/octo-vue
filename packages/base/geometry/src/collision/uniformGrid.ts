import type { Rect } from '../primitive/types.js'

interface GridItem<T> {
  item: T
  index: number
}

/**
 * 均匀网格(Uniform Grid):把空间划分为等大 cell,每个物体归入其 AABB 覆盖的所有 cell
 */
export class UniformGrid<T extends { aabb(): Rect }> {
  private readonly cellSize: number
  private readonly cells: Map<string, Array<GridItem<T>>> = new Map()
  private globalItems: Array<GridItem<T>> = []
  private readonly worldBounds: Rect

  constructor(worldBounds: Rect, cellSize: number = 64) {
    this.worldBounds = worldBounds
    this.cellSize = cellSize
  }

  insert(entry: { item: T; index: number }): void {
    this.globalItems.push(entry)
    const aabb = entry.item.aabb()
    const cells = this.rangeCells(aabb)
    for (const cellId of cells) {
      const list = this.cells.get(cellId) ?? []
      list.push(entry)
      this.cells.set(cellId, list)
    }
  }

  query(rect: Rect): T[] {
    const seen = new Set<number>()
    const result: T[] = []
    const cells = this.rangeCells(rect)

    for (const cellId of cells) {
      const list = this.cells.get(cellId)
      if (!list) continue
      for (const entry of list) {
        if (!seen.has(entry.index)) {
          seen.add(entry.index)
          result.push(entry.item)
        }
      }
    }

    return result
  }

  queryAllPairs(): Array<[number, number]> {
    const pairs = new Set<string>()
    const result: Array<[number, number]> = []

    for (const [, list] of this.cells) {
      for (let i = 0; i < list.length; i++) {
        for (let j = i + 1; j < list.length; j++) {
          const a = list[i].index
          const b = list[j].index
          const key = a < b ? `${a},${b}` : `${b},${a}`
          if (!pairs.has(key)) {
            pairs.add(key)
            result.push([a, b])
          }
        }
      }
    }

    return result
  }

  clear(): void {
    this.cells.clear()
    this.globalItems = []
  }

  private rangeCells(rect: Rect): string[] {
    const minX = Math.floor(rect.x / this.cellSize)
    const minY = Math.floor(rect.y / this.cellSize)
    const maxX = Math.floor((rect.x + rect.width) / this.cellSize)
    const maxY = Math.floor((rect.y + rect.height) / this.cellSize)

    const ids: string[] = []
    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        ids.push(`${x},${y}`)
      }
    }
    return ids
  }
}
