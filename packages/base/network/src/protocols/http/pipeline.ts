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

/**
 * InternalHttpClient — 统一请求管线
 * 被函数式 API / 客户端实例 / 链式构造器共享
 */
export class InternalHttpClient {
  readonly instance: AxiosInstance
  readonly interceptors: HttpInterceptors
  private config: HttpClientConfig
  private timeoutScheduler = new TimeoutScheduler()

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
          const id = this.instance.interceptors.request.use(i.onFulfilled, i.onRejected)
          return String(id)
        },
        eject: (id: string) => {
          // axios 不支持 id 概念,这里只是占位实现
        },
        clear: () => this.instance.interceptors.request.clear(),
        has: () => false,
      },
      response: {
        use: (i: any) => {
          const id = this.instance.interceptors.response.use(i.onFulfilled, i.onRejected)
          return String(id)
        },
        eject: (id: string) => {},
        clear: () => this.instance.interceptors.response.clear(),
        has: () => false,
      },
      error: {
        use: (i: any) => '',
        eject: (id: string) => {},
        clear: () => {},
        has: () => false,
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

    // 3. 去重
    const identity = generateIdentity({ method: 'AUTO', url: config.baseURL ?? '', data: config.params })
    const dedupeEnabled = config.dedupe ?? this.config.dedupe ?? globalConfig.dedupe ?? true
    if (dedupeEnabled) {
      const dup = getDedupeManager().register(identity, controller)
      if (dup.isDuplicate && dup.previousController) {
        dup.previousController.cancel('deduped')
      }
    }

    // 4. 启动超时调度
    this.timeoutScheduler.schedule(timeoutMs, controller.signal)

    try {
      // 5. 重试执行器
      const exec = () => this.executeRequest<T>(config, controller)
      const retryConfig = config.retry ?? this.config.retry ?? globalConfig.defaultRetry
      const result = retryConfig
        ? await withRetry(exec, retryConfig)
        : await exec()
      return result
    } catch (err) {
      // 6. 错误分类
      let classified = classifyError(err)

      // 区分取消 vs 超时
      if (controller.cancelled) {
        if (controller.signal.reason === 'timeout') {
          classified = new TimeoutError('Request timeout', timeoutMs, { cause: err })
        } else {
          classified = new CancelError(
            typeof controller.signal.reason === 'string' ? controller.signal.reason : 'cancelled',
            { cause: err }
          )
        }
      } else if (axios.isAxiosError(err) && !err.response) {
        classified = new NetworkException(err.message, { cause: err })
      }

      // 7. 错误拦截器
      try {
        classified = await runErrorInterceptors(this.interceptors.error, classified, config.interceptors)
      } catch {
        // 错误拦截器抛出时忽略,保持原错误
      }

      throw classified
    } finally {
      this.timeoutScheduler.clear()
      if (dedupeEnabled) {
        getDedupeManager().unregister(identity)
      }
    }
  }

  /** 实际 axios 请求 */
  private async executeRequest<T>(config: HttpRequestConfig, controller: HttpCancelController): Promise<T> {
    // 1. 运行请求拦截器
    const internalConfig: InternalHttpRequestConfig = {
      url: this.extractUrl(config),
      method: 'AUTO',
      baseURL: config.baseURL ?? this.config.baseURL,
      params: config.params,
      headers: { ...this.config.headers, ...config.headers },
      data: (config as any).data,
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

    const finalConfig = await runRequestInterceptors(
      this.interceptors.request,
      internalConfig,
      config.interceptors
    )

    // 2. 应用 transformRequest
    if (finalConfig._meta?.transformRequest) {
      const transforms = Array.isArray(finalConfig._meta.transformRequest)
        ? finalConfig._meta.transformRequest
        : [finalConfig._meta.transformRequest]
      for (const fn of transforms) {
        finalConfig.data = fn(finalConfig.data)
      }
    }

    // 3. 发起 axios 请求
    const axiosResponse = await this.instance.request(finalConfig)

    // 4. 应用 transformResponse
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

    // 5. 业务响应解包(如果开启了)
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

    // 6. 运行响应拦截器
    const final = await runResponseInterceptors(
      this.interceptors.response,
      result as T,
      config.interceptors
    )

    return final
  }

  private extractUrl(config: HttpRequestConfig): string {
    // url 字段存储在 _meta?简化:通过函数式 API / 实例方法 / 链式构造器传入的 url 已合并
    return (config as any).url ?? ''
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