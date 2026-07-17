import { IndexedDBAdapter } from './indexedDB'
import { OPFSAdapter } from './opfs'
import { StorageError } from '../shared/error'
import type { StorageAdapter, UpgradeCallback } from './types'

// Blob 专用后端类型
//   auto      运行时探测,优先 OPFS,不可用降级 IndexedDB
//   indexeddb 强制使用 IndexedDB
//   opfs      强制使用 OPFS(不可用时抛 StorageError)
//   fsa       意图为 FSA,但需后续调 requestUserDirectory()/bindDirectory() 提供 handle
//             构造时不真绑定,fallback 到 IndexedDB
export type BlobBackendType = 'auto' | 'indexeddb' | 'opfs' | 'fsa'

// createBlobAdapter 选项
export interface CreateBlobAdapterOptions {
  // 后端类型,必填,调用方需自行 resolve 'auto'
  // 用 resolveBlobAdapter() 或 detectBestBlobBackend() 完成
  backend: 'indexeddb' | 'opfs'
  // 命名空间,默认 'octovue-assets'
  //   - IDB:用作 database name
  //   - OPFS:用作 rootName
  name?: string
  // IDB object store 名,默认 'blobs',OPFS 下忽略
  store?: string
  // IDB 版本号,默认 1,OPFS 下忽略
  version?: number
  // IDB upgrade 回调,OPFS 下忽略
  upgrade?: UpgradeCallback
}

// ============== 能力探测 ==============

// 同步检测 OPFS 是否可用
// 仅看 API 存在性,不实际打开;真实写入失败会在 set 时捕获
export function isOPFSAvailable(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    typeof navigator.storage?.getDirectory === 'function'
  )
}

// 同步检测 FSA 是否可用
// 条件:showDirectoryPicker 存在 + 安全上下文(localhost / https)
// 注意:FSA 不能参与 'auto' 探测(需要 user gesture + 真实目录),
//   所以 BlobBackendType 中不含 'fsa',但提供本函数供业务方主动判断
export function isFSAAvailable(): boolean {
  if (typeof globalThis === 'undefined') return false
  const g = globalThis as {
    showDirectoryPicker?: unknown
    isSecureContext?: boolean
  }
  if (typeof g.showDirectoryPicker !== 'function') return false
  // secure context:FSA 在 http 上不可用
  if (g.isSecureContext === false) return false
  return true
}

// 同步选择当前最优 Blob 后端
// OPFS 可用 -> 'opfs'(性能更好、用户能"在文件管理器中显示")
// 否则 -> 'indexeddb'(兼容性最好,所有现代浏览器)
export function detectBestBlobBackend(): 'opfs' | 'indexeddb' {
  return isOPFSAvailable() ? 'opfs' : 'indexeddb'
}

// ============== 同步工厂 ==============

// 同步创建 Blob 适配器,不接受 'auto',调用方需自行 resolve
// 原因:保持与现有 AssetStore 同步构造函数兼容
export function createBlobAdapter(options: CreateBlobAdapterOptions): StorageAdapter {
  const name = options.name ?? 'octovue-assets'

  if (options.backend === 'opfs') {
    return new OPFSAdapter({ rootName: name })
  }

  return new IndexedDBAdapter({
    name,
    store: options.store ?? 'blobs',
    version: options.version ?? 1,
    upgrade: options.upgrade,
  })
}

// 把 BlobBackendType('auto' | 'indexeddb' | 'opfs' | 'fsa') 解析为具体 backend
// 'auto' 走 detectBestBlobBackend(),'fsa' 返回 'indexeddb'(因为 FSA 不能 sync 创建)
// 抛错场景:opfs 但环境不支持
export function resolveBlobBackendType(
  type: BlobBackendType,
): 'indexeddb' | 'opfs' {
  if (type === 'auto') return detectBestBlobBackend()
  if (type === 'opfs') {
    if (!isOPFSAvailable()) {
      throw new StorageError(
        'OPFS is not available in this environment',
        { kind: 'not-found', adapter: 'opfs' },
      )
    }
    return 'opfs'
  }
  if (type === 'fsa') return 'indexeddb'
  return 'indexeddb'
}
