import type { HttpClient } from './client'
import type { UploadConfig, DownloadConfig } from './types'
import { uploadFile, downloadFile, downloadAndSave as sharedDownloadAndSave } from '../../shared/transfer'

/** 实例方法: 单文件上传(绑定到当前 client) */
export async function upload<T = unknown>(
  client: HttpClient,
  url: string,
  file: File | Blob,
  config?: UploadConfig
): Promise<T> {
  return uploadFile<T>(url, file, config, client as any)
}

/** 实例方法: 下载为 Blob(绑定到当前 client) */
export async function download(
  client: HttpClient,
  url: string,
  config?: DownloadConfig
): Promise<Blob> {
  return downloadFile(url, config, client as any)
}

/** 实例方法: 下载并触发浏览器保存(绑定到当前 client) */
export async function downloadAndSave(
  client: HttpClient,
  url: string,
  filename: string,
  config?: DownloadConfig
): Promise<void> {
  return sharedDownloadAndSave(url, filename, config, client as any)
}