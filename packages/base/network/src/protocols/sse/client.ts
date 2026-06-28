import type {
  SseClient,
  SseClientConfig,
  SseEventHandler,
  SseLifecycleHandler,
  SseRawEvent,
  SseReadyState,
  SseSubscription,
} from './types'
import { calculateDelay } from '../../shared/retry'
import { NetworkError } from '../../types/error'
import { UnknownError } from '../../shared/error'

/**
 * SSE 客户端实现(基于浏览器原生 EventSource)
 */
export class SseClientImpl<T = unknown> implements SseClient<T> {
  private _source: EventSource | null = null
  private _readyState: SseReadyState = 'connecting'
  private _lastEventId: string | undefined
  private _handlers = new Map<string, Set<SseEventHandler<any> | SseLifecycleHandler>>()
  private _messageHandlers = new Set<SseEventHandler<T>>()
  private _reconnectAttempts = 0
  private _closed = false
  private _paused = false
  private _heartbeatTimer: ReturnType<typeof setTimeout> | null = null
  private _reconnectTimer: ReturnType<typeof setTimeout> | null = null

  constructor(
    private readonly url: string,
    private readonly config: SseClientConfig = {}
  ) {
    this._connect()
  }

  get readyState(): SseReadyState {
    return this._readyState
  }

  get lastEventId(): string | undefined {
    return this._lastEventId
  }

  on(event: string, handler: SseEventHandler<any>): SseSubscription
  on(event: 'open' | 'error' | 'reconnect', handler: SseLifecycleHandler): SseSubscription
  on(event: string, handler: any): SseSubscription {
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

  onMessage(handler: SseEventHandler<T>): SseSubscription {
    this._messageHandlers.add(handler)
    return {
      unsubscribe: () => this._messageHandlers.delete(handler),
    }
  }

  close(): void {
    this._closed = true
    if (this._reconnectTimer) {
      clearTimeout(this._reconnectTimer)
      this._reconnectTimer = null
    }
    if (this._heartbeatTimer) {
      clearTimeout(this._heartbeatTimer)
      this._heartbeatTimer = null
    }
    if (this._source) {
      this._source.close()
      this._source = null
    }
    this._readyState = 'closed'
  }

  pause(): void {
    this._paused = true
  }

  resume(): void {
    if (this._paused) {
      this._paused = false
      this._connect()
    }
  }

  // ===== 私有方法 =====

  private _connect(): void {
    if (this._closed) return
    this._readyState = 'connecting'

    const fullUrl = this._buildUrl()
    try {
      this._source = new EventSource(fullUrl, {
        withCredentials: this.config.withCredentials,
      })
    } catch (err) {
      this._handleError(err as Error)
      return
    }

    this._source.onopen = () => {
      this._readyState = 'open'
      this._reconnectAttempts = 0
      this._emit('open')
      this._resetHeartbeat()
    }

    this._source.onerror = (event) => {
      this._handleError(new Error('SSE connection error'))
    }

    this._source.onmessage = (event: MessageEvent) => {
      this._handleMessage(event)
    }
  }

  private _buildUrl(): string {
    if (!this.config.params) return this.url
    const qs = new URLSearchParams()
    for (const [k, v] of Object.entries(this.config.params)) {
      qs.append(k, String(v))
    }
    if (this.config.resumeParam && this._lastEventId) {
      qs.append(this.config.resumeParam, this._lastEventId)
    }
    const sep = this.url.includes('?') ? '&' : '?'
    return `${this.url}${sep}${qs.toString()}`
  }

  private _handleMessage(event: MessageEvent): void {
    if (this._paused) return

    const raw: SseRawEvent = {
      id: event.lastEventId || undefined,
      event: event.type !== 'message' ? event.type : undefined,
      data: event.data,
    }

    if (raw.id) this._lastEventId = raw.id
    this._resetHeartbeat()

    // 默认 message 事件
    let parsed: any = raw.data
    if (this.config.dataParser) {
      try {
        parsed = this.config.dataParser(raw.data)
      } catch {
        parsed = raw.data
      }
    }

    // 派发给类型化事件
    if (raw.event) {
      this._emit(raw.event, parsed, raw)
    } else {
      this._messageHandlers.forEach((h) => h(parsed, raw))
    }
  }

  private _handleError(err: Error): void {
    const netErr = new UnknownError(err.message, { cause: err })
    this._emit('error', netErr)

    const reconnect = this.config.reconnect ?? {}
    if (reconnect.enabled === false || this._closed) {
      this._readyState = 'closed'
      return
    }

    const maxRetries = reconnect.maxRetries ?? Infinity
    if (this._reconnectAttempts >= maxRetries) {
      this._readyState = 'closed'
      return
    }

    if (reconnect.noRetryOn?.(netErr)) {
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
      if (this._source) this._source.close()
      this._connect()
    }, delay)
  }

  private _resetHeartbeat(): void {
    const heartbeat = this.config.heartbeat
    if (!heartbeat) return

    if (this._heartbeatTimer) {
      clearTimeout(this._heartbeatTimer)
    }

    const timeout = heartbeat.timeout ?? 45000
    this._heartbeatTimer = setTimeout(() => {
      heartbeat.onTimeout?.(this._lastEventId)
      this._handleError(new Error('Heartbeat timeout'))
    }, timeout)
  }

  private _emit(event: string, ...args: any[]): void {
    const handlers = this._handlers.get(event)
    if (!handlers) return
    handlers.forEach((h: any) => {
      try {
        h(...args)
      } catch {
        // 忽略处理器异常
      }
    })
  }
}

/** 独立创建(绕过连接池) */
export function createSseClient<T = unknown>(
  url: string,
  config?: SseClientConfig
): SseClient<T> {
  return new SseClientImpl<T>(url, config)
}