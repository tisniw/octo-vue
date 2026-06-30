import type { HttpChain, HttpMethod, HttpRequestConfig, HttpResponseType } from './types'
import type { HttpClient } from './client'

/** 链式构造器内部状态 */
interface ChainState {
  url: string
  method: HttpMethod
  config: HttpRequestConfig
}

/**
 * 创建链式构造器(绑定到指定 HttpClient 实例)
 * 修复 H-1: send() 不再双发请求,直接调用对应 HTTP 方法
 * 修复 M-5: 增加 cancel() 方法
 */
export function createChainBuilder<T = unknown>(
  client: HttpClient,
  method: HttpMethod
): HttpChain<T> {
  const state: ChainState = {
    url: '',
    method,
    config: {},
  }
  let cancelController: AbortController | null = null

  const chain: HttpChain<T> = {
    url(url: string) {
      state.url = url
      return chain
    },
    baseURL(base: string) {
      state.config.baseURL = base
      return chain
    },
    header(key: string, value: string) {
      state.config.headers = { ...state.config.headers, [key]: value }
      return chain
    },
    headers(headers: Record<string, string>) {
      state.config.headers = { ...state.config.headers, ...headers }
      return chain
    },
    param(key: string, value: unknown) {
      state.config.params = { ...state.config.params, [key]: value }
      return chain
    },
    params(params: Record<string, unknown>) {
      state.config.params = { ...state.config.params, ...params }
      return chain
    },
    data(data: unknown) {
      state.config.data = data
      return chain
    },
    timeout(ms: number) {
      state.config.timeout = ms
      return chain
    },
    responseType(type: HttpResponseType) {
      state.config.responseType = type
      return chain
    },
    cancel(reason?: string) {
      cancelController?.abort(reason ?? 'chain-cancelled')
    },
    async send(): Promise<T> {
      // 创建独立的 AbortController 以支持取消
      cancelController = new AbortController()
      const configWithSignal: HttpRequestConfig = {
        ...state.config,
        signal: cancelController.signal,
      }
      const data = state.config.data

      switch (state.method) {
        case 'GET':
          return client.get<T>(state.url, configWithSignal)
        case 'DELETE':
          return client.delete<T>(state.url, configWithSignal)
        case 'HEAD':
          return client.head<T>(state.url, configWithSignal)
        case 'OPTIONS':
          return client.options<T>(state.url, configWithSignal)
        case 'POST':
          return client.post<T>(state.url, data, configWithSignal)
        case 'PUT':
          return client.put<T>(state.url, data, configWithSignal)
        case 'PATCH':
          return client.patch<T>(state.url, data, configWithSignal)
        default:
          return client.request<T>({ ...configWithSignal, url: state.url, data })
      }
    },
  }

  return chain
}