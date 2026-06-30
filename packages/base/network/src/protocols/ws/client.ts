import type {
  WsClient,
  WsClientConfig,
  WsCodec,
  WsMessageHandler,
  WsOutgoing,
  WsReadyState,
  WsSubscription,
  WsTypedMessage,
  WsLifecycleHandler,
  WsAnyHandler,
} from './types'
import { NO_RETRY_CLOSE_CODES } from './types'
import { jsonCodec } from './codec'
import { calculateDelay } from '../../shared/retry'
import { TimeoutError } from '../../shared/error'

/**
 * WS 客户端实现
 */
export class WsClientImpl<T = unknown> implements WsClient<T> {
  private _ws: WebSocket | null = null
  private _readyState: WsReadyState = 'init'
  private _handlers = new Map<string, Set<WsMessageHandler<any> | WsLifecycleHandler>>()
  private _anyHandlers = new Set<WsAnyHandler>()
  private _queue: WsOutgoing[] = []
  private _reconnectAttempts = 0
  private _paused = false
  private _closedByUser = false
  private _heartbeatTimer: ReturnType<typeof setInterval> | null = null
  private _heartbeatTimeoutTimer: ReturnType<typeof setTimeout> | null = null
  private _reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private _pendingRequests = new Map<
    string,
    { resolve: (v: any) => void; reject: (e: unknown) => void; timeout: ReturnType<typeof setTimeout> }
  >()
  private _codec: WsCodec

  constructor(
    private readonly url: string,
    private readonly config: WsClientConfig = {}
  ) {
    this._codec = config.codec ?? jsonCodec
    this._connect()
  }

  get readyState(): WsReadyState {
    return this._readyState
  }

  on(type: string, handler: WsMessageHandler<unknown>): WsSubscription
  on(event: 'open' | 'close' | 'error' | 'reconnect', handler: WsLifecycleHandler): WsSubscription
  on(event: string, handler: any): WsSubscription {
    if (!this._handlers.has(event)) {
      this._handlers.set(event, new Set())
    }
    this._handlers.get(event)!.add(handler)
    return {
      unsubscribe: () => {
        this._handlers.get(event)?.delete(handler)
      },
    }
  }

  onAny(handler: WsAnyHandler): WsSubscription {
    this._anyHandlers.add(handler)
    return {
      unsubscribe: () => this._anyHandlers.delete(handler),
    }
  }

  send(message: WsOutgoing): void {
    if (this._readyState === 'open' && this._ws) {
      this._doSend(message)
    } else {
      const queue = this.config.queue ?? {}
      if (queue.enabled !== false) {
        const maxSize = queue.maxSize ?? 100
        const strategy = queue.overflowStrategy ?? 'drop'
        if (this._queue.length >= maxSize) {
          if (strategy === 'throw') {
            throw new Error('WS message queue overflow')
          }
          // 'drop' 策略:丢弃队首
          this._queue.shift()
        }
        this._queue.push(message)
      }
    }
  }

  request<TResp, TReq = unknown>(
    type: string,
    data: TReq,
    options: { timeout?: number; requestId?: string } = {}
  ): Promise<TResp> {
    const requestId = options.requestId ?? `req_${Date.now()}_${Math.random().toString(36).slice(2)}`
    return new Promise<TResp>((resolve, reject) => {
      const timeoutMs = options.timeout ?? 30000
      const timer = setTimeout(() => {
        this._pendingRequests.delete(requestId)
        reject(new TimeoutError(`WS request timeout: ${type}`, timeoutMs))
      }, timeoutMs)

      this._pendingRequests.set(requestId, { resolve, reject, timeout: timer })

      this.send({
        kind: 'typed',
        type,
        data: data as unknown,
        requestId,
      })
    })
  }

  close(code?: number, reason?: string): void {
    this._closedByUser = true
    this._cleanup()
    if (this._ws) {
      this._readyState = 'closing'
      try {
        this._ws.close(code ?? 1000, reason ?? '')
      } catch {
        // ignore
      }
    } else {
      this._readyState = 'closed'
    }
  }

  pause(): void {
    this._paused = true
  }

  resume(): void {
    if (this._paused) {
      this._paused = false
    }
  }

  // ===== 私有方法 =====

  private _connect(): void {
    if (this._paused) return
    this._readyState = 'connecting'

    try {
      const protocols = this.config.protocols
      this._ws = protocols
        ? new WebSocket(this.url, Array.isArray(protocols) ? protocols : [protocols])
        : new WebSocket(this.url)
    } catch (err) {
      this._handleClose(-1, 'connect-failed')
      return
    }

    this._ws.onopen = () => {
      this._readyState = 'open'
      this._reconnectAttempts = 0
      this._emit('open')
      this._flushQueue()
      this._startHeartbeat()
    }

    this._ws.onmessage = (event) => {
      this._handleMessage(event)
    }

    this._ws.onerror = () => {
      this._emit('error', new Error('WebSocket error'))
    }

    this._ws.onclose = (event) => {
      this._handleClose(event.code, event.reason)
    }
  }

  private _handleMessage(event: MessageEvent): void {
    this._handleHeartbeatResponse()

    // 解析为类型化消息
    this._codec
      .decode(event.data)
      .then((msg) => {
        // request-响应模式
        if (msg.kind === 'typed' && msg.requestId && this._pendingRequests.has(msg.requestId)) {
          const pending = this._pendingRequests.get(msg.requestId)!
          this._pendingRequests.delete(msg.requestId)
          clearTimeout(pending.timeout)
          pending.resolve(msg.data)
          return
        }

        // 类型化分发
        if (msg.kind === 'typed') {
          this._emit(msg.type, msg.data)
        } else {
          this._emit('message', msg)
        }

        // 任意消息处理器
        this._anyHandlers.forEach((h) => h(msg, event))
      })
      .catch(() => {
        // 解析失败时,当作原始消息派发
        this._emit('message', event.data)
      })
  }

  private _handleClose(code: number, reason: string): void {
    this._cleanup()
    this._emit('close', { code, reason })

    const reconnect = this.config.reconnect ?? {}
    if (reconnect.enabled === false || this._closedByUser) {
      this._readyState = 'closed'
      return
    }

    if (NO_RETRY_CLOSE_CODES.includes(code) || (reconnect.noRetryCodes?.includes(code) ?? false)) {
      this._readyState = 'closed'
      return
    }

    const maxRetries = reconnect.maxRetries ?? Infinity
    if (this._reconnectAttempts >= maxRetries) {
      this._readyState = 'closed'
      return
    }

    this._readyState = 'reconnecting'
    const delay = calculateDelay(this._reconnectAttempts, {
      baseDelay: reconnect.baseDelay ?? 1000,
      maxDelay: reconnect.maxDelay ?? 30000,
      jitter: reconnect.jitter ?? true,
    })

    this._emit('reconnect', { attempt: this._reconnectAttempts, delay })

    this._reconnectTimer = setTimeout(() => {
      this._reconnectAttempts++
      this._connect()
    }, delay)
  }

  private _doSend(message: WsOutgoing): void {
    if (!this._ws) return
    switch (message.kind) {
      case 'text':
        this._ws.send(message.data)
        break
      case 'binary':
        this._ws.send(message.data)
        break
      case 'typed':
        this._ws.send(this._codec.encode(message))
        break
    }
  }

  private _flushQueue(): void {
    const queue = this._queue.slice()
    this._queue.length = 0
    for (const msg of queue) {
      this._doSend(msg)
    }
  }

  private _startHeartbeat(): void {
    const heartbeat = this.config.heartbeat
    if (!heartbeat) return

    const interval = heartbeat.interval ?? 30000
    const timeout = heartbeat.timeout ?? 60000

    if (this._heartbeatTimer) clearInterval(this._heartbeatTimer)
    this._heartbeatTimer = setInterval(() => {
      if (heartbeat.payload) {
        this._doSend(heartbeat.payload)
      }
      // 启动超时检测
      if (this._heartbeatTimeoutTimer) clearTimeout(this._heartbeatTimeoutTimer)
      this._heartbeatTimeoutTimer = setTimeout(() => {
        heartbeat.onTimeout?.()
        this._ws?.close()
      }, timeout)
    }, interval)
  }

  private _handleHeartbeatResponse(): void {
    if (this._heartbeatTimeoutTimer) {
      clearTimeout(this._heartbeatTimeoutTimer)
      this._heartbeatTimeoutTimer = null
    }
  }

  private _cleanup(): void {
    if (this._heartbeatTimer) clearInterval(this._heartbeatTimer)
    if (this._heartbeatTimeoutTimer) clearTimeout(this._heartbeatTimeoutTimer)
    if (this._reconnectTimer) clearTimeout(this._reconnectTimer)
    this._heartbeatTimer = null
    this._heartbeatTimeoutTimer = null
    this._reconnectTimer = null

    // 拒绝所有 pending 请求
    for (const [id, pending] of this._pendingRequests) {
      clearTimeout(pending.timeout)
      pending.reject(new Error('WebSocket closed'))
    }
    this._pendingRequests.clear()
  }

  private _emit(event: string, ...args: any[]): void {
    const handlers = this._handlers.get(event)
    if (!handlers) return
    handlers.forEach((h: any) => {
      try {
        h(...args)
      } catch {
        // ignore
      }
    })
  }
}