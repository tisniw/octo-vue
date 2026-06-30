import type { ProgressCallback } from '../progress'
import { createProgressTracker, asAxiosProgress, type ProgressTracker } from '../progress'

/** 上传配置 */
export interface UploadConfig {
  fields?: Record<string, unknown>
  fieldName?: string
  onUploadProgress?: ProgressCallback
  buildFormData?: (form: FormData) => void
  headers?: Record<string, string>
  signal?: AbortSignal
}

/** 下载配置 */
export interface DownloadConfig {
  responseType?: 'blob' | 'arraybuffer'
  onDownloadProgress?: ProgressCallback
  rangeStart?: number
  rangeEnd?: number
  headers?: Record<string, string>
  signal?: AbortSignal
}

/**
 * 最小 HTTP 客户端契约(避免对 protocols/http 的循环依赖)
 */
interface HttpClientLike {
  post<T = unknown>(url: string, data?: unknown, config?: any): Promise<T>
  get<T = unknown>(url: string, config?: any): Promise<T>
}

/**
 * 获取默认 HTTP 客户端(lazy import 避免循环依赖)
 */
async function getDefaultClient(): Promise<HttpClientLike> {
  const { http } = await import('../../protocols/http')
  return http as unknown as HttpClientLike
}

/**
 * 接收可选 client 实例,未传则用默认 http
 * - 顶层调用(如 uploadFile)用默认 http
 * - 实例方法调用(如 http.upload)传入 client 绑定
 */
async function resolveClient(client?: HttpClientLike): Promise<HttpClientLike> {
  return client ?? (await getDefaultClient())
}

/** 单文件上传 */
export async function uploadFile<T = unknown>(
  url: string,
  file: File | Blob,
  config: UploadConfig = {},
  client?: HttpClientLike
): Promise<T> {
  const c = await resolveClient(client)
  const form = new FormData()
  const fieldName = config.fieldName ?? 'file'
  form.append(fieldName, file)
  if (config.fields) {
    for (const [key, value] of Object.entries(config.fields)) {
      form.append(key, String(value))
    }
  }
  config.buildFormData?.(form)

  const tracker = config.onUploadProgress ? createProgressTracker() : null
  if (tracker && config.onUploadProgress) {
    tracker.on(config.onUploadProgress)
  }

  return c.post<T>(url, form, {
    headers: config.headers,
    signal: config.signal,
    onUploadProgress: tracker ? asAxiosProgress(tracker) : undefined,
  } as any)
}

/** 多文件上传 */
export async function uploadFiles<T = unknown>(
  url: string,
  files: Array<File | Blob>,
  config: UploadConfig = {},
  client?: HttpClientLike
): Promise<T> {
  const c = await resolveClient(client)
  const form = new FormData()
  const fieldName = config.fieldName ?? 'files'
  for (const file of files) {
    form.append(fieldName, file)
  }
  if (config.fields) {
    for (const [key, value] of Object.entries(config.fields)) {
      form.append(key, String(value))
    }
  }
  config.buildFormData?.(form)

  return c.post<T>(url, form, {
    headers: config.headers,
    signal: config.signal,
  } as any)
}

/** 下载为 Blob */
export async function downloadFile(
  url: string,
  config: DownloadConfig = {},
  client?: HttpClientLike
): Promise<Blob> {
  const c = await resolveClient(client)
  const tracker = config.onDownloadProgress ? createProgressTracker() : null
  if (tracker && config.onDownloadProgress) {
    tracker.on(config.onDownloadProgress)
  }

  const headers = { ...config.headers }
  if (config.rangeStart !== undefined) {
    const end = config.rangeEnd !== undefined ? config.rangeEnd : ''
    headers['Range'] = `bytes=${config.rangeStart}-${end}`
  }

  return c.get<Blob>(url, {
    responseType: 'blob',
    headers,
    signal: config.signal,
    onDownloadProgress: tracker ? asAxiosProgress(tracker) : undefined,
  } as any)
}

/** 下载并触发浏览器保存 */
export async function downloadAndSave(
  url: string,
  filename: string,
  config: DownloadConfig = {},
  client?: HttpClientLike
): Promise<void> {
  const blob = await downloadFile(url, config, client)
  triggerBrowserDownload(blob, filename)
}

/** 触发浏览器下载 */
export function triggerBrowserDownload(blob: Blob, filename: string): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return
  const objectUrl = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = objectUrl
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(objectUrl)
}

/** 断点续传 */
export async function resumeDownload(
  url: string,
  options: {
    receivedBytes: number
    totalBytes: number
    writable?: WritableStream
  } & DownloadConfig = {} as any,
  client?: HttpClientLike
): Promise<Blob> {
  return downloadFile(
    url,
    {
      ...options,
      rangeStart: options.receivedBytes,
      rangeEnd: options.totalBytes,
    },
    client
  )
}

/** 便捷 FormData POST */
export async function httpPostForm<T = unknown>(
  url: string,
  form: FormData | Record<string, unknown>,
  config?: Record<string, unknown>,
  client?: HttpClientLike
): Promise<T> {
  const c = await resolveClient(client)
  const body =
    form instanceof FormData
      ? form
      : Object.entries(form).reduce((acc, [k, v]) => {
          acc.append(k, String(v))
          return acc
        }, new FormData())
  return c.post<T>(url, body, config as any)
}

/** 创建上传任务(返回 Promise + tracker) */
export function createUploadTask(
  url: string,
  file: File | Blob,
  config: UploadConfig = {},
  client?: HttpClientLike
): { promise: Promise<unknown>; tracker: ProgressTracker } {
  const tracker = createProgressTracker()
  const promise = uploadFile(
    url,
    file,
    { ...config, onUploadProgress: (e) => tracker.update(e.loaded, e.total) },
    client
  )
  return { promise, tracker }
}

/** 创建下载任务 */
export function createDownloadTask(
  url: string,
  config: DownloadConfig = {},
  client?: HttpClientLike
): { promise: Promise<Blob>; tracker: ProgressTracker } {
  const tracker = createProgressTracker()
  const promise = downloadFile(
    url,
    { ...config, onDownloadProgress: (e) => tracker.update(e.loaded, e.total) },
    client
  )
  return { promise, tracker }
}