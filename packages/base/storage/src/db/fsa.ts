import { StorageError } from '../shared/error'
import type { StorageAdapter } from './types'

// FSA 适配器构造函数选项
export interface FSAAdapterOptions {
  // 根目录 handle,必填
  //   通常由 window.showDirectoryPicker() 获得,或从 IDB 恢复(structured clone 支持)
  //   调用方需自行保证 handle 仍有读/写权限(用 queryPermission 检查)
  rootHandle: FileSystemDirectoryHandle
  // 命名空间,在 rootHandle 下的子目录,默认 'octovue-storage'
  // 多个业务方共享同一 root 也不冲突
  rootName?: string
}

// 索引文件名,与 OPFSAdapter 共用同一协议
//   (未来可抽取 fileBackendBase 共用,当前为节省改动保持重复实现)
const META_FILE = '__meta__.json'

// FSA 适配器,基于 File System Access API
//
// 关键约束:
//   1. 仅 Chromium 系浏览器(Chrome 86+ / Edge 86+ / Opera)
//   2. 必须在 secure context(HTTPS / localhost)
//   3. window.showDirectoryPicker() 必须在 user gesture 中调用(click 等)
//   4. handle 可通过 structured clone 存到 IDB,下次启动恢复
//   5. 每次使用前要 queryPermission;用户撤销授权后需 requestPermission(也要 gesture)
//
// 与 OPFSAdapter 共享设计(代码独立实现,未来可抽 fileBackendBase):
//   - base64url 文件名编码(避开 FSA 文件名不允许的特殊字符)
//   - __meta__.json 索引文件(避开 TS lib.dom 未声明的目录迭代 API)
//   - meta 写入串行化(Promise 链防并发覆盖)
//   - knownKeys 内存缓存
export class FSAAdapter implements StorageAdapter {
  readonly rootName: string

  // 命名空间子目录 handle,构造时同步校验权限并 get/create 子目录
  protected rootHandlePromise: Promise<FileSystemDirectoryHandle>

  // 已知 key 集合缓存
  protected knownKeys: Set<string> | null = null

  // meta 写入串行化队列
  protected metaWriteQueue: Promise<void> = Promise.resolve()

  constructor(options: FSAAdapterOptions) {
    if (!options || !options.rootHandle) {
      throw new StorageError(
        'FSAAdapter requires rootHandle in options',
        { adapter: 'fsa', kind: 'not-found' },
      )
    }
    this.rootName = options.rootName ?? 'octovue-storage'
    this.rootHandlePromise = this.prepareRoot(options.rootHandle)
  }

  // ============== 私有 ==============

  // 校验权限 + 拿/建命名空间子目录
  // 失败原因通常是:
  //   - 用户撤销了授权(queryPermission != 'granted')
  //   - handle 已被浏览器回收(从 IDB 恢复后但权限失效)
  //   - 命名空间子目录被用户从目录里删了(getDirectoryHandle 会自动 create)
  protected async prepareRoot(
    handle: FileSystemDirectoryHandle,
  ): Promise<FileSystemDirectoryHandle> {
    // 1. 校验权限
    try {
      const perm = await handle.queryPermission({ mode: 'readwrite' })
      if (perm !== 'granted') {
        throw new StorageError(
          `FSA permission not granted (got "${perm}"). User must re-authorize via requestUserDirectory().`,
          { adapter: 'fsa', kind: 'not-found' },
        )
      }
    } catch (err) {
      if (err instanceof StorageError) throw err
      throw new StorageError(
        `FSA queryPermission failed for "${handle.name}"`,
        { cause: err, adapter: 'fsa', kind: 'unknown' },
      )
    }

    // 2. 拿到/创建命名空间子目录
    try {
      return await handle.getDirectoryHandle(this.rootName, { create: true })
    } catch (err) {
      throw new StorageError(
        `Failed to access FSA namespace "${this.rootName}"`,
        { cause: err, adapter: 'fsa', kind: 'unknown' },
      )
    }
  }

  // utf-8 key -> base64url 文件名
  protected encodeKey(key: string): string {
    const bytes = new TextEncoder().encode(key)
    let bin = ''
    for (let i = 0; i < bytes.length; i++) {
      bin += String.fromCharCode(bytes[i]!)
    }
    return btoa(bin)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
  }

  protected decodeKey(name: string): string | null {
    try {
      let b64 = name.replace(/-/g, '+').replace(/_/g, '/')
      while (b64.length % 4 !== 0) b64 += '='
      const bin = atob(b64)
      const bytes = new Uint8Array(bin.length)
      for (let i = 0; i < bin.length; i++) {
        bytes[i] = bin.charCodeAt(i)
      }
      return new TextDecoder().decode(bytes)
    } catch {
      return null
    }
  }

  protected validateKey(key: string): void {
    if (typeof key !== 'string' || key.length === 0) {
      throw new StorageError(
        `FSA adapter requires non-empty string key`,
        { adapter: 'fsa', kind: 'unknown' },
      )
    }
  }

  protected async loadMeta(
    root: FileSystemDirectoryHandle,
  ): Promise<Set<string>> {
    try {
      const fh = await root.getFileHandle(META_FILE, { create: false })
      const file = await fh.getFile()
      const text = await file.text()
      const arr = JSON.parse(text) as unknown
      if (Array.isArray(arr)) {
        return new Set(arr.filter((x): x is string => typeof x === 'string'))
      }
      return new Set()
    } catch (err) {
      if (err instanceof DOMException && err.name === 'NotFoundError') {
        return new Set()
      }
      throw new StorageError(
        `FSA failed to load meta`,
        { cause: err, adapter: 'fsa', kind: 'unknown' },
      )
    }
  }

  protected async writeMetaNow(
    root: FileSystemDirectoryHandle,
  ): Promise<void> {
    if (this.knownKeys === null) return
    const arr = JSON.stringify(Array.from(this.knownKeys))
    const fh = await root.getFileHandle(META_FILE, { create: true })
    const writable = await fh.createWritable()
    try {
      await writable.write(arr)
    } finally {
      await writable.close()
    }
  }

  protected enqueueMetaWrite(
    fn: (root: FileSystemDirectoryHandle) => Promise<void>,
  ): Promise<void> {
    const next = this.metaWriteQueue.then(async () => {
      const root = await this.rootHandlePromise
      await fn(root)
    })
    this.metaWriteQueue = next.catch(() => {})
    return next
  }

  // ============== StorageAdapter 实现 ==============

  async get<V>(key: string): Promise<V | undefined> {
    this.validateKey(key)
    const root = await this.rootHandlePromise
    try {
      const fileHandle = await root.getFileHandle(this.encodeKey(key), {
        create: false,
      })
      const file = await fileHandle.getFile()
      if (this.knownKeys !== null) this.knownKeys.add(key)
      return file as unknown as V
    } catch (err) {
      if (err instanceof DOMException && err.name === 'NotFoundError') {
        return undefined
      }
      if (err instanceof StorageError) throw err
      throw new StorageError(
        `FSA get failed for key "${key}"`,
        { cause: err, adapter: 'fsa', kind: 'unknown' },
      )
    }
  }

  async set(key: string, value: unknown): Promise<void> {
    this.validateKey(key)

    if (!(value instanceof Blob)) {
      throw new StorageError(
        `FSA adapter only accepts Blob or File values (got ${
          value === null ? 'null' : typeof value
        })`,
        { adapter: 'fsa', kind: 'unknown' },
      )
    }

    const root = await this.rootHandlePromise
    try {
      const fileHandle = await root.getFileHandle(this.encodeKey(key), {
        create: true,
      })
      const writable = await fileHandle.createWritable()
      try {
        await writable.write(value)
      } finally {
        await writable.close()
      }

      if (this.knownKeys === null) {
        this.knownKeys = await this.loadMeta(root)
      }
      const added = !this.knownKeys.has(key)
      this.knownKeys.add(key)
      if (added) {
        await this.enqueueMetaWrite((r) => this.writeMetaNow(r))
      }
    } catch (err) {
      if (
        err instanceof DOMException &&
        (err.name === 'QuotaExceededError' ||
          err.name === 'NS_ERROR_FILE_NO_DEVICE_SPACE')
      ) {
        throw new StorageError(
          `FSA quota exceeded for key "${key}"`,
          { cause: err, adapter: 'fsa', kind: 'quota' },
        )
      }
      // 权限被撤销
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        throw new StorageError(
          `FSA permission denied for key "${key}". User must re-authorize.`,
          { cause: err, adapter: 'fsa', kind: 'not-found' },
        )
      }
      if (err instanceof StorageError) throw err
      throw new StorageError(
        `FSA set failed for key "${key}"`,
        { cause: err, adapter: 'fsa', kind: 'unknown' },
      )
    }
  }

  async remove(key: string): Promise<void> {
    this.validateKey(key)
    const root = await this.rootHandlePromise
    try {
      await root.removeEntry(this.encodeKey(key))
    } catch (err) {
      if (err instanceof DOMException && err.name === 'NotFoundError') {
        if (this.knownKeys) this.knownKeys.delete(key)
        return
      }
      if (err instanceof StorageError) throw err
      throw new StorageError(
        `FSA remove failed for key "${key}"`,
        { cause: err, adapter: 'fsa', kind: 'unknown' },
      )
    }
    const existed = this.knownKeys?.delete(key) ?? false
    if (existed) {
      await this.enqueueMetaWrite((r) => this.writeMetaNow(r))
    }
  }

  async keys(): Promise<string[]> {
    const root = await this.rootHandlePromise
    if (this.knownKeys === null) {
      this.knownKeys = await this.loadMeta(root)
    }
    return Array.from(this.knownKeys)
  }

  async clear(): Promise<void> {
    const root = await this.rootHandlePromise
    const keys = this.knownKeys ? Array.from(this.knownKeys) : await this.keys()

    await Promise.all(
      keys.map((key) =>
        root
          .removeEntry(this.encodeKey(key))
          .catch((err: unknown) => {
            if (err instanceof DOMException && err.name === 'NotFoundError') return
            // 其它错误忽略,clear 是 best-effort
          }),
      ),
    )
    try {
      await root.removeEntry(META_FILE)
    } catch {
      // 忽略
    }
    this.knownKeys = new Set()
    this.metaWriteQueue = Promise.resolve()
  }

  // ============== 扩展 ==============

  // 当前已知 key 数
  size(): number {
    return this.knownKeys?.size ?? 0
  }

  // 估算整体 FSA 占用字节数(通过 navigator.storage.estimate)
  // 注意:FSA 写入的是用户磁盘真实目录,estimate() 返回的 usage 是整个 origin 的
  //   OPFS + IDB + 其它 storage 的总占用,**不含本 FSA 目录独占的真实磁盘字节数**
  //   - 与 OPFSAdapter.estimatedQuotaUsage 行为对称,便于上层做统一的配额预警
  //   - 真实 FSA 占用需遍历 rootHandle.values() 累加 File.size(),性能差,不在此处做
  //   - 不支持时(SSR / 老浏览器)返回 undefined
  async estimatedQuotaUsage(): Promise<number | undefined> {
    if (typeof navigator !== 'undefined' && navigator.storage?.estimate) {
      const est = await navigator.storage.estimate()
      return est.usage ?? 0
    }
    return undefined
  }
}
