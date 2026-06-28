/** 三层超时优先级栈 */
export interface TimeoutStack {
  /** 请求级超时 */
  request: number | undefined
  /** 客户端级超时 */
  client: number | undefined
  /** 全局级超时 */
  global: number | undefined
}

/** 统一的 setTimeout 调度器 */
export class TimeoutScheduler {
  private timer: ReturnType<typeof setTimeout> | null = null

  schedule(ms: number, signal: AbortSignal): void {
    this.clear()
    this.timer = setTimeout(() => {
      if (!signal.aborted) {
        // AbortSignal 没有 abort(reason) 方法,只能触发 abort 事件
        // 通过 dispatchEvent 模拟
        const event = new Event('abort')
        signal.dispatchEvent(event)
      }
    }, ms)
  }

  clear(): void {
    if (this.timer !== null) {
      clearTimeout(this.timer)
      this.timer = null
    }
  }
}

/** 解析最终超时值(请求 > 客户端 > 全局) */
export function resolveTimeout(stack: TimeoutStack, defaultMs = 30000): number {
  return stack.request ?? stack.client ?? stack.global ?? defaultMs
}