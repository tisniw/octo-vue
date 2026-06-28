import type { HttpCancelController } from '../cancel'

/** 请求唯一标识 */
export interface RequestIdentity {
  /** HTTP 方法 */
  method: string
  /** 完整 URL */
  url: string
  /** 请求体序列化(可能为 undefined) */
  body: string | undefined
}

/** 序列化请求标识 */
export function generateIdentity(config: {
  method?: string
  url?: string
  data?: unknown
}): string {
  const identity: RequestIdentity = {
    method: (config.method ?? 'GET').toUpperCase(),
    url: config.url ?? '',
    body: config.data !== undefined ? safeStringify(config.data) : undefined,
  }
  return JSON.stringify(identity)
}

function safeStringify(data: unknown): string {
  try {
    return JSON.stringify(data)
  } catch {
    return String(data)
  }
}

/** 请求去重管理器(单例) */
export class RequestDedupeManager {
  private inFlight = new Map<string, HttpCancelController>()

  /**
   * 注册请求
   * @returns isDuplicate: 是否为重复请求
   * @returns previousController: 若重复,返回前一个的取消控制器
   */
  register(
    identity: string,
    controller: HttpCancelController
  ): { isDuplicate: boolean; previousController?: HttpCancelController } {
    const existing = this.inFlight.get(identity)
    if (existing) {
      return { isDuplicate: true, previousController: existing }
    }
    this.inFlight.set(identity, controller)
    return { isDuplicate: false }
  }

  /** 请求完成时注销 */
  unregister(identity: string): void {
    this.inFlight.delete(identity)
  }

  /** 当前进行中的请求数 */
  get size(): number {
    return this.inFlight.size
  }

  /** 清空所有进行中的请求 */
  clear(): void {
    this.inFlight.clear()
  }
}

/** 全局单例 */
let _instance: RequestDedupeManager | null = null

export function getDedupeManager(): RequestDedupeManager {
  if (!_instance) {
    _instance = new RequestDedupeManager()
  }
  return _instance
}

export function disposeDedupeManager(): void {
  _instance?.clear()
  _instance = null
}