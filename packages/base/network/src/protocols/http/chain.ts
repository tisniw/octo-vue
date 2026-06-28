import type { HttpChain, HttpMethod, HttpRequestConfig, HttpResponseType } from './types'
import type { HttpClient } from './client'

/**
 * 创建链式构造器(绑定到指定 HttpClient 实例)
 */
export function createChainBuilder<T = unknown>(
  client: HttpClient,
  method: HttpMethod
): HttpChain<T> {
  const config: HttpRequestConfig = { method } as any

  const chain: HttpChain<T> = {
    url(url: string) {
      ;(config as any).url = url
      return chain
    },
    baseURL(base: string) {
      config.baseURL = base
      return chain
    },
    header(key: string, value: string) {
      config.headers = { ...config.headers, [key]: value }
      return chain
    },
    headers(headers: Record<string, string>) {
      config.headers = { ...config.headers, ...headers }
      return chain
    },
    param(key: string, value: unknown) {
      config.params = { ...config.params, [key]: value }
      return chain
    },
    params(params: Record<string, unknown>) {
      config.params = { ...config.params, ...params }
      return chain
    },
    data(data: unknown) {
      ;(config as any).data = data
      return chain
    },
    timeout(ms: number) {
      config.timeout = ms
      return chain
    },
    responseType(type: HttpResponseType) {
      config.responseType = type
      return chain
    },
    async send() {
      const url = (config as any).url as string
      const data = (config as any).data
      return client.request<T>({
        ...config,
      } as any).then(() => {
        // 根据 method 走对应方法
        switch (method) {
          case 'GET':
            return client.get<T>(url, config)
          case 'DELETE':
            return client.delete<T>(url, config)
          case 'HEAD':
            return client.head<T>(url, config)
          case 'OPTIONS':
            return client.options<T>(url, config)
          case 'POST':
            return client.post<T>(url, data, config)
          case 'PUT':
            return client.put<T>(url, data, config)
          case 'PATCH':
            return client.patch<T>(url, data, config)
          default:
            return client.request<T>({ ...config, url, data } as any)
        }
      })
    },
  }
  return chain
}