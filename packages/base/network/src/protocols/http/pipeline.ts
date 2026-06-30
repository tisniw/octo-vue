import axios, { type AxiosInstance, type AxiosResponse } from 'axios'
import {
  CancelError,
  NetworkException,
  TimeoutError,
  classifyError,
} from '../../shared/error'
import { createCancelController } from '../../shared/cancel'
import type { HttpCancelController } from '../../shared/cancel'
import { TimeoutScheduler } from '../../shared/timeout'
import { generateIdentity, getDedupeManager } from '../../shared/dedupe'
import { withRetry } from '../../shared/retry'
import { unwrapResponse } from '../../shared/response'
import {
  runRequestInterceptors,
  runResponseInterceptors,
  runErrorInterceptors,
} from '../../shared/interceptors'
import type { HttpInterceptors } from '../../shared/interceptors'
import { getHttpConfig } from '../../shared/inject'
import type { HttpClientConfig, HttpRequestConfig, InternalHttpRequestConfig } from './types'

/** 拦截器 id 映射(String → axios number) */
class InterceptorIdMap {
  private map = new Map<string, number>()

  set(stringId: string, axiosId: number): void {
    this.map.set(stringId, axiosId)
  }

  delete(stringId: string): boolean {
    return this.map.delete(stringId)
  }

  get(stringId: string): number | undefined {
    return this.map.get(stringId)
  }

  has(stringId: string): boolean {
    return this.map.has(stringId)
  }

  clear(): void {
    this.map.clear()
  }
}

/**
 * InternalHttpClient — 统一请求管线
 * 修复 H-2: 拦截器 eject/has 通过 id 映射实现
 * 修复 H-3: 去重 identity 在 executeRequest 内基于完整 url+method+body 生成
 * 修复 M-1: 错误拦截器抛错时保留原始错误并附加 cause
 */
export class InternalHttpClient {
  readonly instance: AxiosInstance
  readonly interceptors: HttpInterceptors
  private config: HttpClientConfig
  private timeoutScheduler = new TimeoutScheduler()
  private requestIdMap = new InterceptorIdMap()
  private responseIdMap = new InterceptorIdMap()
  private errorIdMap = new InterceptorIdMap()

  constructor(config: HttpClientConfig = {}) {
    this.config = { timeout: 30000, ...config }
    this.instance = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: this.config.headers,
      withCredentials: this.config.withCredentials,
    })
    this.interceptors = {
      request: {
        use: (i: any) => {
          const axiosId = this.instance.interceptors.request.use(i.onFulfilled, i.onRejected)
          const stringId = i.id ?? `_auto_${axiosId}_${Date.now()}`
          this.requestIdMap.set(stringId, axiosId)
          return stringId
        },
        eject: (id: string) => {
          const axiosId = this.requestIdMap.get(id)
          if (axiosId !== undefined) {
            this.instance.interceptors.request.eject(axiosId)
            this.requestIdMap.delete(id)
          }
        },
        clear: () => {
          this.instance.interceptors.request.clear()
          this.requestIdMap.clear()
        },
        has: (id: string) => this.requestIdMap.has(id),
      },
      response: {
        use: (i: any) => {
          const axiosId = this.instance.interceptors.response.use(i.onFulfilled, i.onRejected)
          const stringId = i.id ?? `_auto_${axiosId}_${Date.now()}`
          this.responseIdMap.set(stringId, axiosId)
          return stringId
        },
        eject: (id: string) => {
          const axiosId = this.responseIdMap.get(id)
          if (axiosId !== undefined) {
            this.instance.interceptors.response.eject(axiosId)
            this.responseIdMap.delete(id)
          }
        },
        clear: () => {
          this.instance.interceptors.response.clear()
          this.responseIdMap.clear()
        },
        has: (id: string) => this.responseIdMap.has(id),
      },
      error: {
        use: (i: any) => {
          const stringId = i.id ?? `_auto_err_${Date.now()}_${Math.random().toString(36).slice(2)}`
          this.errorIdMap.set(stringId, 0)
          return stringId
        },
        eject: (id: string) => {
          this.errorIdMap.delete(id)
        },
        clear: () => {
          this.errorIdMap.clear()
        },
        has: (id: string) => this.errorIdMap.has(id),
      },
    }
  }

  /** 发起请求(完整管线: 拦截器 → 去重 → 超时 → 重试 → axios → 解包) */
  async request<T = unknown>(config: HttpRequestConfig): Promise<T> {
    // 1. 解析超时
    const globalConfig = getHttpConfig()
    const timeoutMs =
      config.timeout ?? this.config.timeout ?? globalConfig.defaultTimeout ?? 30000

    // 2. 取消控制器
    const controller = createCancelController()
    if (config.signal) {
      config.signal.addEventListener('abort', () => controller.cancel('user-cancelled'))
    }

    // 3. 启动超时调度
    this.timeoutScheduler.schedule(timeoutMs, controller.signal)

    // 持有本次去重 identity 以便 finally 中注销
    let dedupeIdentity: string | null = null
    const dedupeEnabled =
      config.dedupe ?? this.config.dedupe ?? globalConfig.dedupe ?? true
    if (dedupeEnabled) {
      const url = config.url ?? ''
      const method = config.method ?? 'GET'
      dedupeIdentity = generateIdentity({
        method,
        url: this._resolveUrl({
          url,
          baseURL: config.baseURL ?? this.config.baseURL,
          params: config.params,
        } as InternalHttpRequestConfig),
        data: config.data,
      })
      const dup = getDedupeManager().register(dedupeIdentity, controller)
      if (dup.isDuplicate && dup.previousController) {
        dup.previousController.cancel('deduped')
      }
    }

    try {
      // 4. 重试执行器
      const exec = () => this.executeRequest<T>(config, controller)
      const retryConfig = config.retry ?? this.config.retry ?? globalConfig.defaultRetry
      const result = retryConfig
        ? await withRetry(exec, retryConfig)
        : await exec()
      return result
    } catch (err) {
      // 5. 错误分类
      let classified: ReturnType<typeof classifyError>
      if (controller.cancelled) {
        if (controller.signal.reason === 'timeout') {
          classified = new TimeoutError('Request timeout', timeoutMs, { cause: err })
        } else {
          classified = new CancelError(
            typeof controller.signal.reason === 'string' ? controller.signal.reason : 'cancelled',
            { cause: err }
          )
        }
      } else if (axios.isAxiosError(err)) {
        if (!err.response) {
          classified = new NetworkException(err.message, { cause: err })
        } else {
          classified = classifyError(err)
        }
      } else {
        classified = classifyError(err)
      }

      // 6. 错误拦截器(抛错时保留原错误,不再吞掉)
      try {
        classified = await runErrorInterceptors(this.interceptors.error, classified, config.interceptors)
      } catch (interceptorErr) {
        // 拦截器自身抛出时,作为 cause 附加到原错误
        // cause 是 readonly,用类型断言绕过
        ;(classified as any).cause = interceptorErr
        // 开发环境 console.warn 提示
        if (typeof console !== 'undefined') {
          console.warn('[network] error interceptor threw:', interceptorErr)
        }
      }

      throw classified
    } finally {
      this.timeoutScheduler.clear()
      if (dedupeIdentity) {
        getDedupeManager().unregister(dedupeIdentity)
      }
    }
  }

  /** 实际 axios 请求 */
  private async executeRequest<T>(config: HttpRequestConfig, controller: HttpCancelController): Promise<T> {
    // 1. 构建内部配置
    const internalConfig: InternalHttpRequestConfig = {
      url: config.url ?? '',
      method: (config.method ?? 'GET') as string,
      baseURL: config.baseURL ?? this.config.baseURL,
      params: config.params,
      headers: { ...this.config.headers, ...config.headers },
      data: config.data,
      timeout: config.timeout ?? this.config.timeout,
      withCredentials: config.withCredentials ?? this.config.withCredentials,
      responseType: config.responseType,
      signal: controller.signal,
      onUploadProgress: config.onUploadProgress as any,
      onDownloadProgress: config.onDownloadProgress as any,
      _meta: {
        dedupe: config.dedupe,
        retry: config.retry,
        interceptors: config.interceptors,
        transformRequest: config.transformRequest,
        transformResponse: config.transformResponse,
        bigIntMode: config.bigIntMode,
      },
    }

    // 2. 运行请求拦截器(去重已在外层 request() 中处理)
    const finalConfig = await runRequestInterceptors(
      this.interceptors.request,
      internalConfig,
      config.interceptors
    )

    // 4. 应用 transformRequest
    if (finalConfig._meta?.transformRequest) {
      const transforms = Array.isArray(finalConfig._meta.transformRequest)
        ? finalConfig._meta.transformRequest
        : [finalConfig._meta.transformRequest]
      for (const fn of transforms) {
        finalConfig.data = fn(finalConfig.data)
      }
    }

    // 5. 发起 axios 请求
    const axiosResponse: AxiosResponse = await this.instance.request(finalConfig)

    // 6. 应用 transformResponse
    let data = axiosResponse.data
    if (finalConfig._meta?.transformResponse) {
      const transforms = Array.isArray(finalConfig._meta.transformResponse)
        ? finalConfig._meta.transformResponse
        : [finalConfig._meta.transformResponse]
      for (const fn of transforms) {
        data = await fn(data)
      }
    }

    const wrappedResponse = { ...axiosResponse, data }

    // 7. 业务响应解包(如果开启了)
    let result: unknown = data
    if (
      data !== null &&
      typeof data === 'object' &&
      'code' in data &&
      'msg' in data &&
      'data' in data
    ) {
      result = unwrapResponse({ data: data as any })
    }

    // 8. 运行响应拦截器
    const final = await runResponseInterceptors(
      this.interceptors.response,
      result as T,
      config.interceptors
    )

    return final
  }

  /** 解析完整 URL(baseURL + url + params) */
  private _resolveUrl(config: InternalHttpRequestConfig): string {
    let url = config.url ?? ''
    if (config.baseURL && !url.startsWith('http')) {
      url = config.baseURL.replace(/\/$/, '') + '/' + url.replace(/^\//, '')
    }
    if (config.params && Object.keys(config.params).length > 0) {
      const qs = new URLSearchParams()
      for (const [k, v] of Object.entries(config.params)) {
        qs.append(k, String(v))
      }
      url += (url.includes('?') ? '&' : '?') + qs.toString()
    }
    return url
  }

  /** 更新配置 */
  setConfig(config: Partial<HttpClientConfig>): void {
    this.config = { ...this.config, ...config }
    if (config.baseURL !== undefined) this.instance.defaults.baseURL = config.baseURL
    if (config.timeout !== undefined) this.instance.defaults.timeout = config.timeout
    if (config.headers !== undefined) this.instance.defaults.headers = config.headers as any
    if (config.withCredentials !== undefined) this.instance.defaults.withCredentials = config.withCredentials
  }

  /** 读取配置 */
  getConfig(): HttpClientConfig {
    return { ...this.config }
  }
}