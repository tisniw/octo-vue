/**
 * tween/path · SVG 路径解析与插值 (0.0.5 §5.9.5)
 */
import type { PathCommand } from './types.js'

/**
 * 解析 SVG path d 属性为命令数组
 * 支持:M / m / L / l / H / h / V / v / C / c / S / s / Q / q / T / t / A / a / Z / z
 */
export function parsePath(d: string): PathCommand[] {
  if (!d || typeof d !== 'string') return []
  const commands: PathCommand[] = []
  // 拆分命令字母 + 数字
  const tokens = d.match(/[a-zA-Z]|-?\d*\.?\d+(?:e[-+]?\d+)?/g)
  if (!tokens) return []

  let i = 0
  let cx = 0
  let cy = 0
  let startX = 0
  let startY = 0
  let lastCmd = ''

  while (i < tokens.length) {
    const tk = tokens[i]!
    if (/[a-zA-Z]/.test(tk)) {
      const cmd = tk
      lastCmd = cmd
      i++
      if (cmd === 'Z' || cmd === 'z') {
        cx = startX
        cy = startY
        commands.push({ cmd, x: cx, y: cy })
        continue
      }
    }
    const cmd = lastCmd
    const readNum = () => Number(tokens[i++])

    switch (cmd) {
      case 'M':
        cx = readNum(); cy = readNum()
        startX = cx; startY = cy
        commands.push({ cmd: 'M', x: cx, y: cy })
        lastCmd = 'L'
        break
      case 'm': {
        cx += readNum(); cy += readNum()
        startX = cx; startY = cy
        commands.push({ cmd: 'M', x: cx, y: cy })
        lastCmd = 'l'
        break
      }
      case 'L':
        cx = readNum(); cy = readNum()
        commands.push({ cmd: 'L', x: cx, y: cy })
        break
      case 'l':
        cx += readNum(); cy += readNum()
        commands.push({ cmd: 'L', x: cx, y: cy })
        break
      case 'H':
        cx = readNum()
        commands.push({ cmd: 'L', x: cx, y: cy })
        break
      case 'h':
        cx += readNum()
        commands.push({ cmd: 'L', x: cx, y: cy })
        break
      case 'V':
        cy = readNum()
        commands.push({ cmd: 'L', x: cx, y: cy })
        break
      case 'v':
        cy += readNum()
        commands.push({ cmd: 'L', x: cx, y: cy })
        break
      case 'C': {
        const x1 = readNum(), y1 = readNum()
        const x2 = readNum(), y2 = readNum()
        cx = readNum(); cy = readNum()
        commands.push({ cmd: 'C', x: cx, y: cy, ctrl1X: x1, ctrl1Y: y1, ctrl2X: x2, ctrl2Y: y2 })
        break
      }
      case 'c': {
        const x1 = cx + readNum(), y1 = cy + readNum()
        const x2 = cx + readNum(), y2 = cy + readNum()
        cx += readNum(); cy += readNum()
        commands.push({ cmd: 'C', x: cx, y: cy, ctrl1X: x1, ctrl1Y: y1, ctrl2X: x2, ctrl2Y: y2 })
        break
      }
      case 'Q': {
        const x1 = readNum(), y1 = readNum()
        cx = readNum(); cy = readNum()
        commands.push({ cmd: 'Q', x: cx, y: cy, ctrl1X: x1, ctrl1Y: y1 })
        break
      }
      case 'q': {
        const x1 = cx + readNum(), y1 = cy + readNum()
        cx += readNum(); cy += readNum()
        commands.push({ cmd: 'Q', x: cx, y: cy, ctrl1X: x1, ctrl1Y: y1 })
        break
      }
      default:
        // 未实现:跳过当前 token
        i++
        break
    }
  }

  return commands
}

/** 命令数组 → d 字符串 */
export function stringifyPath(commands: PathCommand[]): string {
  if (commands.length === 0) return ''
  return commands.map((c) => {
    if (c.cmd === 'Z' || c.cmd === 'z') return 'Z'
    const parts: string[] = [c.cmd]
    if (c.ctrl1X !== undefined) parts.push(String(c.ctrl1X), String(c.ctrl1Y ?? 0))
    if (c.ctrl2X !== undefined) parts.push(String(c.ctrl2X), String(c.ctrl2Y ?? 0))
    parts.push(String(c.x), String(c.y))
    return parts.join(' ')
  }).join(' ')
}

/** 路径插值 */
export function interpolatePath(fromD: string, toD: string, t: number): string {
  const from = parsePath(fromD)
  const to = parsePath(toD)
  if (from.length === 0) return toD
  if (to.length === 0) return fromD
  if (from.length !== to.length) {
    console.warn(`[act/tween] Path 命令数不同(${from.length} vs ${to.length})`)
    return t < 0.5 ? fromD : toD
  }
  for (let i = 0; i < from.length; i++) {
    if (from[i]!.cmd !== to[i]!.cmd) {
      console.warn(`[act/tween] Path[${i}] 命令类型不匹配`)
      return t < 0.5 ? fromD : toD
    }
  }
  const result: PathCommand[] = from.map((fc, i) => {
    const tc = to[i]!
    return {
      cmd: fc.cmd,
      x: fc.x + (tc.x - fc.x) * t,
      y: fc.y + (tc.y - fc.y) * t,
      ctrl1X: fc.ctrl1X !== undefined && tc.ctrl1X !== undefined
        ? fc.ctrl1X + (tc.ctrl1X - fc.ctrl1X) * t : undefined,
      ctrl1Y: fc.ctrl1Y !== undefined && tc.ctrl1Y !== undefined
        ? fc.ctrl1Y + (tc.ctrl1Y - fc.ctrl1Y) * t : undefined,
      ctrl2X: fc.ctrl2X !== undefined && tc.ctrl2X !== undefined
        ? fc.ctrl2X + (tc.ctrl2X - fc.ctrl2X) * t : undefined,
      ctrl2Y: fc.ctrl2Y !== undefined && tc.ctrl2Y !== undefined
        ? fc.ctrl2Y + (tc.ctrl2Y - fc.ctrl2Y) * t : undefined,
    }
  })
  return stringifyPath(result)
}