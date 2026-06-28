/** 取消控制器接口 */
export interface HttpCancelController {
  /** 取消信号(传递给 axios / fetch) */
  readonly signal: AbortSignal
  /** 是否已取消 */
  readonly cancelled: boolean
  /** 主动取消 */
  cancel(reason?: string): void
  /** 监听取消事件 */
  onCancel(handler: (reason: string) => void): () => void
}

/** 创建取消控制器 */
export function createCancelController(): HttpCancelController {
  const controller = new AbortController()
  let _cancelled = false
  let _reason = ''
  const handlers = new Set<(reason: string) => void>()

  const onAbort = () => {
    _cancelled = true
    _reason = controller.signal.reason ?? 'cancelled'
    handlers.forEach((h) => h(_reason))
  }

  controller.signal.addEventListener('abort', onAbort, { once: true })

  return {
    get signal() {
      return controller.signal
    },
    get cancelled() {
      return _cancelled
    },
    cancel(reason = 'cancelled') {
      if (!_cancelled) {
        controller.abort(reason)
      }
    },
    onCancel(handler) {
      handlers.add(handler)
      return () => handlers.delete(handler)
    },
  }
}