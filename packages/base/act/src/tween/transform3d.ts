/**
 * tween/transform3d · 3D 分层管理 (0.0.5 §5.10.5)
 */
import type { Layer3DOptions } from './types.js'

export interface Layer3DHandle {
  setup(): void
  teardown(): void
}

/** 创建 3D 分层控制器 */
export function create3DLayer(options: Layer3DOptions): Layer3DHandle {
  const {
    parent,
    perspective = 1000,
    preserve3D = true,
    backfaceHidden = true,
  } = options

  const savedStyles: string[] = []
  let active = false

  return {
    setup() {
      if (active) return
      active = true
      parent.style.perspective = `${perspective}px`
      parent.style.transformStyle = preserve3D ? 'preserve-3d' : 'flat'
      if (backfaceHidden) {
        for (const child of Array.from(parent.children)) {
          const el = child as HTMLElement
          savedStyles.push(el.style.backfaceVisibility)
          el.style.backfaceVisibility = 'hidden'
        }
      }
    },
    teardown() {
      if (!active) return
      active = false
      parent.style.perspective = ''
      parent.style.transformStyle = ''
      Array.from(parent.children).forEach((child, i) => {
        ;(child as HTMLElement).style.backfaceVisibility = savedStyles[i] ?? ''
      })
      savedStyles.length = 0
    },
  }
}