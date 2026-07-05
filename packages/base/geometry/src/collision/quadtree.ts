import type { Rect } from '../primitive/types.js'
import { Rect as RectFn } from '../primitive/factories.js'

interface QuadtreeNode<T> {
  bounds: Rect
  items: T[]
  children: QuadtreeNode<T>[] | null
  depth: number
}

/**
 * 四叉树(Quadtree):递归细分空间
 */
export class Quadtree<T extends { aabb(): Rect }> {
  private root: QuadtreeNode<T>
  private readonly capacity: number
  private readonly maxDepth: number

  constructor(bounds: Rect, capacity: number = 4, maxDepth: number = 8) {
    this.root = { bounds, items: [], children: null, depth: 0 }
    this.capacity = capacity
    this.maxDepth = maxDepth
  }

  insert(item: T): void {
    this.insertInto(this.root, item)
  }

  query(rect: Rect): T[] {
    const result: T[] = []
    const seen = new Set<T>()
    this.queryInto(this.root, rect, result, seen)
    return result
  }

  clear(): void {
    this.root = { bounds: this.root.bounds, items: [], children: null, depth: 0 }
  }

  private insertInto(node: QuadtreeNode<T>, item: T): void {
    if (node.children === null && node.items.length < this.capacity) {
      node.items.push(item)
      return
    }

    if (node.children === null && node.depth < this.maxDepth) {
      this.split(node)
      const oldItems = node.items
      node.items = []
      for (const old of oldItems) {
        this.insertInto(node, old)
      }
    }

    // 已达最大深度或无法再细分,直接加入此节点
    if (node.children === null) {
      node.items.push(item)
      return
    }

    for (const child of node.children) {
      if (rectIntersects(child.bounds, item.aabb())) {
        this.insertInto(child, item)
      }
    }
  }

  private queryInto(node: QuadtreeNode<T>, rect: Rect, result: T[], seen: Set<T>): void {
    if (!rectIntersects(node.bounds, rect)) return

    for (const item of node.items) {
      if (!seen.has(item)) {
        seen.add(item)
        result.push(item)
      }
    }

    if (node.children !== null) {
      for (const child of node.children) {
        this.queryInto(child, rect, result, seen)
      }
    }
  }

  private split(node: QuadtreeNode<T>): void {
    const { x, y, width, height } = node.bounds
    const hw = width / 2
    const hh = height / 2
    node.children = [
      { bounds: RectFn(x, y, hw, hh), items: [], children: null, depth: node.depth + 1 },
      { bounds: RectFn(x + hw, y, hw, hh), items: [], children: null, depth: node.depth + 1 },
      { bounds: RectFn(x, y + hh, hw, hh), items: [], children: null, depth: node.depth + 1 },
      { bounds: RectFn(x + hw, y + hh, hw, hh), items: [], children: null, depth: node.depth + 1 },
    ]
  }
}

function rectIntersects(a: Rect, b: Rect): boolean {
  return !(
    a.x + a.width < b.x ||
    b.x + b.width < a.x ||
    a.y + a.height < b.y ||
    b.y + b.height < a.y
  )
}
