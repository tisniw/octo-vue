import type { HttpClient } from './client'
import type { UploadConfig, DownloadConfig } from './types'
import { createProgressTracker, asAxiosProgress } from '../../shared/progress'

/** 单文件上传 */
export async function upload<T = unknown>(
  client: HttpClient,
  url: string,
  file: File | Blob,
  config: UploadConfig = {}
): Promise<T> {
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

  return client.post<T>(url, form, {
    ...config,
    onUploadProgress: tracker ? asAxiosProgress(tracker) : undefined,
  })
}

/** 下载为 Blob */
export async function download(
  client: HttpClient,
  url: string,
  config: DownloadConfig = {}
): Promise<Blob> {
  const tracker = config.onDownloadProgress ? createProgressTracker() : null
  if (tracker && config.onDownloadProgress) {
    tracker.on(config.onDownloadProgress)
  }

  const headers = { ...config.headers }
  if (config.rangeStart !== undefined) {
    const end = config.rangeEnd !== undefined ? config.rangeEnd : ''
    headers['Range'] = `bytes=${config.rangeStart}-${end}`
  }

  return client.get<Blob>(url, {
    ...config,
    headers,
    responseType: 'blob',
    onDownloadProgress: tracker ? asAxiosProgress(tracker) : undefined,
  })
}

/** 下载并触发浏览器保存 */
export async function downloadAndSave(
  client: HttpClient,
  url: string,
  filename: string,
  config: DownloadConfig = {}
): Promise<void> {
  const blob = await download(client, url, config)
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