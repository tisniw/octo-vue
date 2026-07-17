import {
  createBlobAdapter,
  resolveBlobBackendType,
  type BlobBackendType,
} from '../db/blobBackend'
import { FSAAdapter } from '../db/fsa'
import {
  saveDirectoryHandle,
  loadDirectoryHandle,
  clearDirectoryHandle,
} from '../db/fsaHandle'
import { StorageError } from '../shared/error'
import type { StorageAdapter } from '../db/types'

export interface AssetStoreOptions {
  // Blob 后端选择,默认 'indexeddb' 保持向后兼容
  //   'auto'      同步探测,优先 OPFS,降级 IDB
  //   'opfs'      强制 OPFS,环境不支持时构造抛错
  //   'indexeddb' 显式 IDB
  //   'fsa'       启动时不绑定(因为 FSA 需要 handle + user gesture),
  //               仅记录意图为默认后端,实际生效需调 bindDirectory/请求用户 picker
  backend?: BlobBackendType
  // 数据库 / OPFS 根目录名,默认 'octovue-assets'
  name?: string
  // IDB object store 名,默认 'blobs',OPFS 下忽略
  store?: string
  // IDB 数据库版本,默认 1,OPFS 下忽略
  version?: number
  // IDB upgrade 回调,首次打开或 version 提升时调用,OPFS/FSA 下忽略
  upgrade?: (db: IDBDatabase, oldVersion: number) => void
  // FSA 启动时是否自动从持久化 handle 恢复,默认 false
  //   仅在 backend 为 'fsa' / 'auto'(且最终落到 'fsa')时生效
  autoBindPersistedDirectory?: boolean
}

// 当前目录绑定信息(UI 显示用)
export interface DirectoryBindingInfo {
  // 目录名(用户选定的真实目录)
  name: string
  // 持久化时间
  savedAt: number
}

interface URLEntry {
  // createObjectURL 返回的 URL
  url: string
  // 引用计数
  refCount: number
}

export interface AssetInfo {
  // 资产 key
  key: string
  // Blob 大小,字节
  size: number
  // Blob MIME 类型
  type: string
  // 最后修改时间,若有
  lastModified?: number
}

// switchBackend 时的可选项,允许在切换时同时改 namespace / IDB store 等
export interface SwitchBackendOptions {
  // 命名空间,IDB 用作 database name,OPFS 用作 rootName
  name?: string
  // IDB object store 名,默认 'blobs',OPFS 下忽略
  store?: string
  // IDB 数据库版本,默认 1,OPFS 下忽略
  version?: number
  // IDB upgrade 回调,首次打开或 version 提升时调用,OPFS 下忽略
  upgrade?: (db: IDBDatabase, oldVersion: number) => void
}

// 文件资产存储
//   底层通过 createBlobAdapter 选择 IndexedDB 或 OPFS 存 Blob
//   上层管理 ObjectURL 引用计数
// 默认后端是 IndexedDB(向后兼容),传 backend: 'opfs' / 'auto' 切换到 OPFS
export class AssetStore {
  // 当前底层适配器,异步接口,可能是 IndexedDB 或 OPFS
  protected adapter: StorageAdapter

  // 当前 backend 类型,构造时由 options.backend 解析得到
  protected backendType: BlobBackendType

  // URL 引用计数表,纯内存
  protected urlMap = new Map<string, URLEntry>()

  // getURL 并发去重:同 key 多次首次请求只走一次 adapter.get + createObjectURL
  protected urlInflight = new Map<string, Promise<string>>()

  // FSA 命名空间名
  protected fsaRootName: string

  // FSA 当前绑定信息(从持久化记录或主动 picker 获得)
  protected directoryBinding: DirectoryBindingInfo | undefined

  constructor(options: AssetStoreOptions = {}) {
    this.fsaRootName = options.name ?? 'octovue-storage'
    const raw = options.backend ?? 'indexeddb'
    // 'fsa' / 'auto' 在构造时不真正绑定 FSA(handle 需要 gesture),
    //   fallback 到 IDB,后续调 requestUserDirectory()/bindDirectory() 替换
    let resolved: 'indexeddb' | 'opfs'
    if (raw === 'fsa') {
      resolved = 'indexeddb'
    } else {
      resolved = resolveBlobBackendType(raw)
    }
    this.backendType = raw
    this.adapter = createBlobAdapter({
      backend: resolved,
      name: options.name ?? 'octovue-assets',
      store: options.store ?? 'blobs',
      version: options.version ?? 1,
      upgrade: options.upgrade,
    })

    // FSA 启动时自动恢复持久化 handle
    //   只在 raw === 'fsa' 时触发:auto 模式下 resolver 已优先选 opfs,
    //   不该被持久化 FSA handle 覆盖
    if (raw === 'fsa' && options.autoBindPersistedDirectory) {
      // 异步,不阻塞构造
      void this.bindDirectoryFromPersisted()
    }
  }

  // 当前后端类型
  get currentBackend(): BlobBackendType {
    return this.backendType
  }

  // 底层适配器引用,供高级用户直接调用(只读语义)
  get adapterRef(): StorageAdapter {
    return this.adapter
  }

  // ============== 运行时切换后端 ==============

  // 切换底层 Blob 后端(例如应用启动时探测后选择,或运行时迁移)
  //   - 不做数据迁移,旧后端的数据需业务方自行处理
  //   - 会主动 close 旧 adapter(若实现 close)
  //   - 切换后 urlMap 清空并释放旧 URL(后端换了,旧 URL 仍指向旧 blob,
  //     不释放会让上层拿到"指向旧后端的 URL",迁移期容易踩坑)
  //   - 不接受 'fsa':FSA 需 handle + user gesture,无法通过 sync/sync-only API 切换,
  //     请改用 requestUserDirectory() / bindDirectory()
  //   - options 可指定新 namespace / store / version / upgrade,默认走 createBlobAdapter 的默认
  async switchBackend(
    backend: BlobBackendType,
    options?: SwitchBackendOptions,
  ): Promise<void> {
    if (backend === 'fsa') {
      throw new StorageError(
        `switchBackend does not accept 'fsa'. Use requestUserDirectory() or bindDirectory() instead.`,
        { adapter: 'fsa', kind: 'unknown' },
      )
    }
    const resolved = resolveBlobBackendType(backend)
    // 关闭旧 adapter(若有 close)
    const old = this.adapter as { close?: () => void }
    if (typeof old.close === 'function') {
      try {
        old.close()
      } catch {
        // 关闭失败不阻塞切换
      }
    }
    // 释放旧 URL(切后端后旧 URL 仍指向旧 blob,留着会误导上层)
    this.urlMap.forEach((entry) => {
      try {
        URL.revokeObjectURL(entry.url)
      } catch {
        // 静默
      }
    })
    this.urlMap.clear()
    this.urlInflight.clear()
    this.adapter = createBlobAdapter({
      backend: resolved,
      name: options?.name,
      store: options?.store,
      version: options?.version,
      upgrade: options?.upgrade,
    })
    this.backendType = backend
  }

  // ============== 持久化操作 ==============

  // 写入 Blob
  async save(key: string, blob: Blob): Promise<void> {
    return this.adapter.set(key, blob)
  }

  // 写入 File,以 file.name 为 key 转发到 save
  async saveFile(file: File): Promise<string> {
    await this.save(file.name, file)
    return file.name
  }

  // 取回原始 Blob
  async get(key: string): Promise<Blob | undefined> {
    return this.adapter.get<Blob>(key)
  }

  // 删除单个资产,同时释放对应 URL
  async remove(key: string): Promise<void> {
    // 同步释放 URL,refCount 强制归零
    this.forceRevokeURL(key)
    // 删除后端数据
    return this.adapter.remove(key)
  }

  // 列出所有资产元信息
  async list(): Promise<AssetInfo[]> {
    const keys = await this.adapter.keys()
    const items = await Promise.all(
      keys.map(async (key) => {
        const blob = await this.adapter.get<Blob>(key)
        if (!blob) return null
        const info: AssetInfo = {
          key,
          size: blob.size,
          type: blob.type,
        }
        const lastModified = (blob as File).lastModified
        if (typeof lastModified === 'number') {
          info.lastModified = lastModified
        }
        return info
      }),
    )
    return items.filter((x): x is AssetInfo => x !== null)
  }

  // 清空全部资产,同时释放所有 URL
  async clear(): Promise<void> {
    this.urlMap.forEach((entry) => {
      URL.revokeObjectURL(entry.url)
    })
    this.urlMap.clear()
    return this.adapter.clear()
  }

  // ============== URL 引用计数操作 ==============

  // 取 ObjectURL,自动 refCount +1,首次创建时调 URL.createObjectURL
  //   - 并发去重:同 key 多次首次请求只走一次 adapter.get + createObjectURL,避免 ObjectURL 泄漏
  async getURL(key: string): Promise<string> {
    const entry = this.urlMap.get(key)
    if (entry) {
      // 已有 URL,refCount +1
      entry.refCount++
      return entry.url
    }

    // 已有 in-flight 请求,直接复用 Promise
    const pending = this.urlInflight.get(key)
    if (pending) {
      // 等拿到 url 后再加引用计数,in-flight 完成的 entry.refCount = 1
      return pending.then((url) => {
        const e = this.urlMap.get(key)
        if (e) e.refCount++
        return url
      })
    }

    // 首次,起一个 Promise 并登记 in-flight
    const promise = (async () => {
      const blob = await this.adapter.get<Blob>(key)
      if (!blob) {
        throw new Error(`Asset not found: ${key}`)
      }
      const url = URL.createObjectURL(blob)
      this.urlMap.set(key, { url, refCount: 1 })
      return url
    })()
    this.urlInflight.set(key, promise)
    // 不管成功失败都清掉 in-flight,失败时 urlMap 也不会有残留
    const cleanup = () => this.urlInflight.delete(key)
    promise.then(cleanup, cleanup)
    return promise
  }

  // 释放 ObjectURL,refCount -1,归零时自动 URL.revokeObjectURL
  releaseURL(key: string): void {
    const entry = this.urlMap.get(key)
    if (!entry) return

    entry.refCount--
    if (entry.refCount <= 0) {
      URL.revokeObjectURL(entry.url)
      this.urlMap.delete(key)
    }
  }

  // 私有,强制 revoke,remove 时调用
  protected forceRevokeURL(key: string): void {
    const entry = this.urlMap.get(key)
    if (entry) {
      URL.revokeObjectURL(entry.url)
      this.urlMap.delete(key)
    }
  }

  // 当前活跃的 URL 数,用于监控
  get urlCount(): number {
    return this.urlMap.size
  }

  // ============== FSA 用户目录绑定 ==============

  // 当前是否有已绑定的用户目录
  get hasDirectoryBinding(): boolean {
    return this.directoryBinding !== undefined
  }

  // 获取当前绑定信息(只读)
  get directoryBindingInfo(): DirectoryBindingInfo | undefined {
    return this.directoryBinding
  }

  // 弹窗请求用户选择目录,自动持久化并切换后端到 FSA
  //
  // 调用约束:
  //   1. 必须由 user gesture 触发(click / keydown 等),浏览器会拒绝脚本调用
  //   2. 仅 Chromium 86+ / Edge 86+ / Opera,其它浏览器抛 StorageError
  //
  // 成功后会:
  //   - 把 handle 存到 IDB,下次启动可自动恢复
  //   - 把 adapter 切换到 FSAAdapter,后续 save/get 落到用户选的真实目录
  //   - 返回 handle,业务方可保留用于查询权限
  async requestUserDirectory(options?: {
    rootName?: string
    persist?: boolean
  }): Promise<FileSystemDirectoryHandle> {
    if (typeof globalThis === 'undefined') {
      throw new StorageError(
        'FSA not available in this environment',
        { adapter: 'fsa', kind: 'not-found' },
      )
    }
    const g = globalThis as { showDirectoryPicker?: (opts?: unknown) => Promise<FileSystemDirectoryHandle> }
    if (typeof g.showDirectoryPicker !== 'function') {
      throw new StorageError(
        'window.showDirectoryPicker is not available',
        { adapter: 'fsa', kind: 'not-found' },
      )
    }

    // 弹出系统目录选择器
    const handle = await g.showDirectoryPicker({ mode: 'readwrite' })

    // 切换后端
    this.bindDirectory(handle, {
      rootName: options?.rootName ?? this.fsaRootName,
      persist: options?.persist ?? true,
    })

    return handle
  }

  // 把已获得的目录 handle 绑定为当前后端
  //   - 同步执行(FSAAdapter 构造是同步的,handle 已授权)
  //   - persist 默认 true,handle 写入 IDB 用于下次启动恢复
  //   - 不传 handle 时仅切换 backendType 标记(占位用,adapter 不变)
  bindDirectory(
    handle: FileSystemDirectoryHandle,
    options?: { rootName?: string; persist?: boolean },
  ): void {
    const rootName = options?.rootName ?? this.fsaRootName
    this.fsaRootName = rootName

    // 关旧 adapter
    const old = this.adapter as { close?: () => void }
    if (typeof old.close === 'function') {
      try {
        old.close()
      } catch {
        // 忽略
      }
    }

    // 建新 FSAAdapter
    this.adapter = new FSAAdapter({ rootHandle: handle, rootName })
    this.backendType = 'fsa'
    this.directoryBinding = { name: handle.name, savedAt: Date.now() }

    // 持久化
    if (options?.persist !== false) {
      void saveDirectoryHandle(handle, rootName)
    }
  }

  // 从持久化的 handle 恢复绑定(通常在应用启动时调用)
  //   - 找不到记录 / IDB 不可用 -> 返回 false,backend 不变
  //   - 找到但权限被撤销 -> 抛 StorageError,backend 不变
  //   - 找到且权限仍 granted -> 切换到 FSA,返回 true
  async bindDirectoryFromPersisted(): Promise<boolean> {
    const record = await loadDirectoryHandle()
    if (!record) return false

    const handle = record.handle
    try {
      // queryPermission 在 TS 当前 lib.dom 中未在 FileSystemDirectoryHandle 上声明,运行时存在
      const perm = await (
        handle as unknown as {
          queryPermission: (opts: { mode: string }) => Promise<
            'granted' | 'prompt' | 'denied'
          >
        }
      ).queryPermission({ mode: 'readwrite' })
      if (perm !== 'granted') {
        // 权限失效,清掉持久化记录
        await clearDirectoryHandle()
        throw new StorageError(
          `FSA persisted directory permission "${perm}", please re-authorize`,
          { adapter: 'fsa', kind: 'not-found' },
        )
      }
    } catch (err) {
      if (err instanceof StorageError) throw err
      throw new StorageError(
        `FSA persisted directory queryPermission failed`,
        { cause: err, adapter: 'fsa', kind: 'unknown' },
      )
    }

    this.bindDirectory(handle, {
      rootName: record.rootName,
      // 已经是持久化记录了,不需要再存一遍
      persist: false,
    })
    this.directoryBinding = {
      name: record.handle.name,
      savedAt: record.savedAt,
    }
    return true
  }

  // 解除目录绑定并清除持久化记录
  //   - backend 切回 IDB(不删除 FSA 文件,用户可在文件管理器手动清理)
  //   - urlMap 不动,但下次 getURL 会从 IDB 取(可能取不到,业务方注意)
  async forgetDirectory(): Promise<void> {
    await clearDirectoryHandle()
    this.directoryBinding = undefined
    this.resetAdapterToIDB()
  }

  // ============== 生命周期 ==============

  // 销毁 AssetStore,释放所有内部资源
  //   - 释放 urlMap 中所有 ObjectURL(避免 SPA 长时间运行累积 URL)
  //   - 关闭底层 adapter(若实现 close,IDB 会断开连接,OPFS 释放句柄,FSA 释放 handle 引用)
  //   - 清空 directoryBinding(但**不删除**持久化的 FSA handle,
  //     下次启动仍可调 bindDirectoryFromPersisted 恢复)
  //   - 重建一个干净的 IDB adapter,保证 destroy 后调用 save/get/list 不报错
  //   - 不抛错:close 失败静默忽略(资源已尽力释放)
  //
  // 典型用法:
  //   - SPA 路由切换 / 用户登出
  //   - 单元测试 teardown
  //
  // 注意:destroy 后 AssetStore 仍可继续调用其它方法,会从干净 IDB adapter 开始
  //   但业务方一般应保证 destroy 后不再使用此实例
  destroy(): void {
    // 1. 释放所有 URL
    this.urlMap.forEach((entry) => {
      try {
        URL.revokeObjectURL(entry.url)
      } catch {
        // 静默
      }
    })
    this.urlMap.clear()
    this.urlInflight.clear()

    // 2. 关 adapter + 清 binding + 重建干净 IDB adapter
    //   resetAdapterToIDB() 内部已经负责关旧 adapter + 重建 IDB,直接复用
    this.directoryBinding = undefined
    this.resetAdapterToIDB()
  }

  // ============== 辅助方法 ==============

  // 把当前 adapter 替换为新 IDB adapter(关闭旧 adapter)
  // 用于 destroy 之外的内部辅助,fsa/unbind 都靠它
  // 抽出来避免重复 close+create 模板
  protected resetAdapterToIDB(): void {
    const old = this.adapter as { close?: () => void }
    if (typeof old.close === 'function') {
      try {
        old.close()
      } catch {
        // 忽略
      }
    }
    this.adapter = createBlobAdapter({
      backend: 'indexeddb',
      name: 'octovue-assets',
    })
    this.backendType = 'indexeddb'
  }
}

// 全局 AssetStore 单例,默认 IndexedDB 后端
// 业务方如需 OPFS:
//   import { assetStore } from '@octovue/storage/asset'
//   await assetStore.switchBackend('auto')
// 业务方如需 FSA(让用户选真实磁盘目录):
//   import { assetStore } from '@octovue/storage/asset'
//   await assetStore.requestUserDirectory()  // 必须在 click 等 user gesture 中调用
export const assetStore: AssetStore = new AssetStore()
