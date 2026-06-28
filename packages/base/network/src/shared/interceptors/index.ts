import type { NetworkError } from '../../types/error'

/** 请求拦截器 */
export interface RequestInterceptor {
  readonly id?: string
  onFulfilled?: (config: any) => any | Promise<any>
  onRejected?: (error: unknown) => unknown
}

/** 响应拦截器 */
export interface ResponseInterceptor {
  readonly id?: string
  onFulfilled?: <T>(response: T) => T | Promise<T>
  onRejected?: (error: unknown) => unknown
}

/** 错误拦截器 */
export interface ErrorInterceptor {
  readonly id?: string
  onError?: (error: NetworkError) => NetworkError | Promise<NetworkError>
}

/** 拦截器集合 */
export interface InterceptorSet<T> {
  use(interceptor: T): string
  eject(id: string): void
  clear(): void
  has(id: string): boolean
}

/** HTTP 拦截器集合 */
export interface HttpInterceptors {
  readonly request: InterceptorSet<RequestInterceptor>
  readonly response: InterceptorSet<ResponseInterceptor>
  readonly error: InterceptorSet<ErrorInterceptor>
}

/** 临时拦截器(单次请求作用域) */
export interface TemporaryInterceptors {
  request?: RequestInterceptor | RequestInterceptor[]
  response?: ResponseInterceptor | ResponseInterceptor[]
  error?: ErrorInterceptor | ErrorInterceptor[]
}

/** 内部拦截器集合(含 items 访问) */
interface InterceptorSetInternal<T> extends InterceptorSet<T> {
  readonly _items: { id: string; interceptor: T }[]
}

function createInterceptorSetInternal<T extends { id?: string }>(): InterceptorSetInternal<T> {
  const items: { id: string; interceptor: T }[] = []
  let counter = 0

  const set: InterceptorSetInternal<T> = {
    _items: items,
    use(interceptor: T): string {
      const id = interceptor.id ?? `_auto_${++counter}_${Date.now()}`
      items.push({ id, interceptor })
      return id
    },
    eject(id: string): void {
      const idx = items.findIndex((it) => it.id === id || it.id.startsWith(id))
      if (idx !== -1) items.splice(idx, 1)
    },
    clear(): void {
      items.length = 0
    },
    has(id: string): boolean {
      return items.some((it) => it.id === id)
    },
  }
  return set
}

/** 创建拦截器集合 */
export function createInterceptors(): HttpInterceptors {
  return {
    request: createInterceptorSetInternal<RequestInterceptor>(),
    response: createInterceptorSetInternal<ResponseInterceptor>(),
    error: createInterceptorSetInternal<ErrorInterceptor>(),
  }
}

/** 串联执行请求拦截器 */
export async function runRequestInterceptors(
  set: InterceptorSet<RequestInterceptor>,
  config: any,
  temporary?: TemporaryInterceptors
): Promise<any> {
  const chain: RequestInterceptor[] = []
  if (temporary?.request) {
    const temp = Array.isArray(temporary.request) ? temporary.request : [temporary.request]
    chain.push(...temp)
  }
  for (const { interceptor } of (set as InterceptorSetInternal<RequestInterceptor>)._items) {
    chain.push(interceptor)
  }
  for (const interceptor of chain) {
    if (interceptor.onFulfilled) {
      try {
        config = await interceptor.onFulfilled(config)
      } catch (err) {
        if (interceptor.onRejected) {
          await interceptor.onRejected(err)
        }
        throw err
      }
    }
  }
  return config
}

/** 串联执行响应拦截器 */
export async function runResponseInterceptors<T>(
  set: InterceptorSet<ResponseInterceptor>,
  response: T,
  temporary?: TemporaryInterceptors
): Promise<T> {
  const chain: ResponseInterceptor[] = []
  if (temporary?.response) {
    const temp = Array.isArray(temporary.response) ? temporary.response : [temporary.response]
    chain.push(...temp)
  }
  for (const { interceptor } of (set as InterceptorSetInternal<ResponseInterceptor>)._items) {
    chain.push(interceptor)
  }
  let result = response
  for (const interceptor of chain) {
    if (interceptor.onFulfilled) {
      result = await interceptor.onFulfilled(result)
    }
  }
  return result
}

/** 串联执行错误拦截器 */
export async function runErrorInterceptors(
  set: InterceptorSet<ErrorInterceptor>,
  error: NetworkError,
  temporary?: TemporaryInterceptors
): Promise<NetworkError> {
  const chain: ErrorInterceptor[] = []
  if (temporary?.error) {
    const temp = Array.isArray(temporary.error) ? temporary.error : [temporary.error]
    chain.push(...temp)
  }
  for (const { interceptor } of (set as InterceptorSetInternal<ErrorInterceptor>)._items) {
    chain.push(interceptor)
  }
  let result = error
  for (const interceptor of chain) {
    if (interceptor.onError) {
      result = await interceptor.onError(result)
    }
  }
  return result
}