import type {
  HttpChain,
  HttpClientConfig,
  HttpMethod,
  HttpRequestConfig,
} from './types'
import { InternalHttpClient } from './pipeline'
import { createChainBuilder } from './chain'
import { all, any, allSettled, sequence, map, concurrent } from './concurrent'
import { upload, download, downloadAndSave } from './transfer'
import type { SettledResult } from './concurrent'

/**
 * HttpClient — 公开 OOP 客户端(axios-like)
 * 默认实例:http
 */
export class HttpClient {
  readonly internal: InternalHttpClient

  constructor(config: HttpClientConfig = {}) {
    this.internal = new InternalHttpClient(config)
  }

  /** 创建独立实例(类似 axios.create) */
  static create(config: HttpClientConfig = {}): HttpClient {
    return new HttpClient(config)
  }

  // ===== 拦截器访问 =====
  get interceptors() {
    return this.internal.interceptors
  }

  // ===== 基础方法 =====

  async get<T = unknown>(url: string, config?: HttpRequestConfig): Promise<T> {
    return this.internal.request<T>({ ...config, url, method: 'GET' } as any)
  }

  async post<T = unknown>(url: string, data?: unknown, config?: HttpRequestConfig): Promise<T> {
    return this.internal.request<T>({ ...config, url, data, method: 'POST' } as any)
  }

  async put<T = unknown>(url: string, data?: unknown, config?: HttpRequestConfig): Promise<T> {
    return this.internal.request<T>({ ...config, url, data, method: 'PUT' } as any)
  }

  async delete<T = unknown>(url: string, config?: HttpRequestConfig): Promise<T> {
    return this.internal.request<T>({ ...config, url, method: 'DELETE' } as any)
  }

  async patch<T = unknown>(url: string, data?: unknown, config?: HttpRequestConfig): Promise<T> {
    return this.internal.request<T>({ ...config, url, data, method: 'PATCH' } as any)
  }

  async head<T = unknown>(url: string, config?: HttpRequestConfig): Promise<T> {
    return this.internal.request<T>({ ...config, url, method: 'HEAD' } as any)
  }

  async options<T = unknown>(url: string, config?: HttpRequestConfig): Promise<T> {
    return this.internal.request<T>({ ...config, url, method: 'OPTIONS' } as any)
  }

  /** 通用请求 */
  async request<T = unknown>(config: HttpRequestConfig): Promise<T> {
    return this.internal.request<T>(config)
  }

  // ===== 链式构造器 =====

  chain<T = unknown>(method: HttpMethod): HttpChain<T> {
    return createChainBuilder<T>(this, method)
  }

  // ===== 并发控制 =====

  all<T>(requests: Promise<T>[]): Promise<T[]> {
    return all(requests)
  }

  any<T>(requests: Promise<T>[]): Promise<T> {
    return any(requests)
  }

  allSettled<T>(requests: Promise<T>[]): Promise<SettledResult<T>[]> {
    return allSettled(requests)
  }

  sequence<T>(tasks: (() => Promise<T>)[]): Promise<T[]> {
    return sequence(tasks)
  }

  map<T, R>(
    items: T[],
    mapper: (item: T, index: number) => Promise<R>,
    concurrency = 6
  ): Promise<R[]> {
    return map(items, mapper, concurrency)
  }

  concurrent<T, R>(
    items: T[],
    mapper: (item: T, index: number) => Promise<R>,
    concurrency: number
  ): Promise<R[]> {
    return concurrent(items, mapper, concurrency)
  }

  // ===== 文件传输 =====

  async upload<T = unknown>(url: string, file: File | Blob, config?: any): Promise<T> {
    return upload<T>(this, url, file, config)
  }

  async download(url: string, config?: any): Promise<Blob> {
    return download(this, url, config)
  }

  async downloadAndSave(url: string, filename: string, config?: any): Promise<void> {
    return downloadAndSave(this, url, filename, config)
  }

  // ===== 配置管理 =====

  setConfig(config: Partial<HttpClientConfig>): void {
    this.internal.setConfig(config)
  }

  getConfig(): HttpClientConfig {
    return this.internal.getConfig()
  }
}

/** 默认全局实例 */
export const http: HttpClient = new HttpClient()