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
 * 获取默认 HTTP 客户端(lazy import 避免循环依赖)
 */
async function getHttpClient() {
  const { http } = await import('../../protocols/http')
  return http
}

/** 单文件上传 */
export async function uploadFile<T = unknown>(
  url: string,
  file: File | Blob,
  config: UploadConfig = {}
): Promise<T> {
  const http = await getHttpClient()
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

  return http.post<T>(url, form, {
    headers: config.headers,
    signal: config.signal,
    onUploadProgress: tracker ? asAxiosProgress(tracker) : undefined,
  } as any)
}

/** 多文件上传 */
export async function uploadFiles<T = unknown>(
  url: string,
  files: Array<File | Blob>,
  config: UploadConfig = {}
): Promise<T> {
  const http = await getHttpClient()
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

  return http.post<T>(url, form, {
    headers: config.headers,
    signal: config.signal,
  } as any)
}

/** 下载为 Blob */
export async function downloadFile(url: string, config: DownloadConfig = {}): Promise<Blob> {
  const http = await getHttpClient()
  const tracker = config.onDownloadProgress ? createProgressTracker() : null
  if (tracker && config.onDownloadProgress) {
    tracker.on(config.onDownloadProgress)
  }

  const headers = { ...config.headers }
  if (config.rangeStart !== undefined) {
    const end = config.rangeEnd !== undefined ? config.rangeEnd : ''
    headers['Range'] = `bytes=${config.rangeStart}-${end}`
  }

  const response = await http.get<Blob>(url, {
    responseType: 'blob',
    headers,
    signal: config.signal,
    onDownloadProgress: tracker ? asAxiosProgress(tracker) : undefined,
  } as any)

  return response
}

/** 下载并触发浏览器保存 */
export async function downloadAndSave(
  url: string,
  filename: string,
  config: DownloadConfig = {}
): Promise<void> {
  const blob = await downloadFile(url, config)
  triggerBrowserDownload(blob, filename)
}

/** 触发浏览器下载 */
export function triggerBrowserDownload(blob: Blob, filename: string): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/** 创建上传任务(返回 Promise + tracker) */
export function createUploadTask(
  url: string,
  file: File | Blob,
  config: UploadConfig = {}
): { promise: Promise<unknown>; tracker: ProgressTracker } {
  const tracker = createProgressTracker()
  const promise = uploadFile(url, file, {
    ...config,
    onUploadProgress: (e) => tracker.update(e.loaded, e.total),
  })
  return { promise, tracker }
}

/** 创建下载任务 */
export function createDownloadTask(
  url: string,
  config: DownloadConfig = {}
): { promise: Promise<Blob>; tracker: ProgressTracker } {
  const tracker = createProgressTracker()
  const promise = downloadFile(url, {
    ...config,
    onDownloadProgress: (e) => tracker.update(e.loaded, e.total),
  })
  return { promise, tracker }
}