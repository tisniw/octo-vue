import { StorageError } from '../shared/error'
import type { StorageAdapter } from './types'

// OPFS 适配器构造函数选项
export interface OPFSAdapterOptions {
  // 根目录名(相对 navigator.storage.getDirectory() 的子目录),默认 'octovue-storage'
  // 不同业务方用不同 rootName 可隔离命名空间
  rootName?: string
}

// 索引文件名,内部使用,业务方 key 不会与此重名(因为 base64url 不含 __)
const META_FILE = '__meta__.json'

// OPFS 适配器,异步,基于 Origin Private File System
//
// 设计要点:
//   1. 任何 utf-8 key 都通过 base64url 编码映射为合法文件名
//      (OPFS 文件名不允许 / \ : * ? " < > | 等字符)
//   2. 只支持 Blob / File 值,其它类型抛 StorageError
//      (OPFS 的 fileHandle.createWritable() 只接受 Blob/File/BufferSource)
//   3. 维护 __meta__.json 索引文件记录 keys,避免 keys() 必须遍历目录
//      (TS 当前 lib.dom.d.ts 中 FileSystemDirectoryHandle 未声明 entries/values/keys,
//      只能依赖应用层维护的索引)
//   4. knownKeys 内存缓存,set/remove 同步更新索引,避免读写 __meta__ I/O
//   5. 索引丢失(用户从浏览器"清除站点数据"保留文件等)时,首次 save 会重建
export class OPFSAdapter implements StorageAdapter {
  readonly rootName: string

  // 根目录句柄,懒打开
  protected rootPromise: Promise<FileSystemDirectoryHandle>

  // 内存缓存:已知 key 集合
  // null 表示尚未初始化,需要 keys()/set/remove 触发首次加载
  protected knownKeys: Set<string> | null = null

  // 序列化写 meta 用的 Promise 链,避免并发 set 互相覆盖索引
  protected metaWriteQueue: Promise<void> = Promise.resolve()

  constructor(options: OPFSAdapterOptions = {}) {
    this.rootName = options.rootName ?? 'octovue-storage'
    this.rootPromise = this.openRoot()
  }

  // ============== 私有 ==============

  // 打开根目录,环境不支持时直接 reject
  protected openRoot(): Promise<FileSystemDirectoryHandle> {
    if (
      typeof navigator === 'undefined' ||
      typeof navigator.storage?.getDirectory !== 'function'
    ) {
      return Promise.reject(
        new StorageError(
          'OPFS is not available in this environment',
          { kind: 'not-found', adapter: 'opfs' },
        ),
      )
    }

    return navigator.storage
      .getDirectory()
      .then((root) => root.getDirectoryHandle(this.rootName, { create: true }))
      .catch((err) => {
        if (err instanceof StorageError) throw err
        throw new StorageError(
          `Failed to open OPFS root "${this.rootName}"`,
          { cause: err, adapter: 'opfs', kind: 'unknown' },
        )
      })
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

  // base64url 文件名 -> 原 utf-8 key,失败返回 null 表示非本适配器写入
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

  // 校验 key 合法,空字符串不允许(防止 getFileHandle('') 行为未定义)
  protected validateKey(key: string): void {
    if (typeof key !== 'string' || key.length === 0) {
      throw new StorageError(
        `OPFS adapter requires non-empty string key`,
        { adapter: 'opfs', kind: 'unknown' },
      )
    }
  }

  // 串行化 meta 写入:把 fn 排到当前队列尾部,fn 执行时它的 prev 已完成
  protected enqueueMetaWrite(
    fn: (root: FileSystemDirectoryHandle) => Promise<void>,
  ): Promise<void> {
    const next = this.metaWriteQueue.then(async () => {
      const root = await this.rootPromise
      await fn(root)
    })
    // 链上 .catch 防止单个写失败导致后续全部 reject
    this.metaWriteQueue = next.catch(() => {})
    return next
  }

  // 立即把 knownKeys 持久化到 __meta__.json
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

  // 首次加载 knownKeys:读 __meta__.json;不存在则为空集合
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
        `OPFS failed to load meta`,
        { cause: err, adapter: 'opfs', kind: 'unknown' },
      )
    }
  }

  // ============== StorageAdapter 实现 ==============

  async get<V>(key: string): Promise<V | undefined> {
    this.validateKey(key)
    const root = await this.rootPromise
    try {
      const fileHandle = await root.getFileHandle(this.encodeKey(key), {
        create: false,
      })
      const file = await fileHandle.getFile()
      // 读成功则记入缓存(若有)
      if (this.knownKeys !== null) this.knownKeys.add(key)
      return file as unknown as V
    } catch (err) {
      if (err instanceof DOMException && err.name === 'NotFoundError') {
        return undefined
      }
      if (err instanceof StorageError) throw err
      throw new StorageError(
        `OPFS get failed for key "${key}"`,
        { cause: err, adapter: 'opfs', kind: 'unknown' },
      )
    }
  }

  async set(key: string, value: unknown): Promise<void> {
    this.validateKey(key)

    // OPFS 只能写 Blob/File/BufferSource,业务方传其它类型直接抛错
    if (!(value instanceof Blob)) {
      throw new StorageError(
        `OPFS adapter only accepts Blob or File values (got ${
          value === null ? 'null' : typeof value
        })`,
        { adapter: 'opfs', kind: 'unknown' },
      )
    }

    const root = await this.rootPromise
    try {
      const fileHandle = await root.getFileHandle(this.encodeKey(key), {
        create: true,
      })
      // createWritable 默认 truncate:true,等价于覆盖写
      const writable = await fileHandle.createWritable()
      try {
        await writable.write(value)
      } finally {
        await writable.close()
      }

      // 首次 set 时初始化缓存
      if (this.knownKeys === null) {
        this.knownKeys = await this.loadMeta(root)
      }
      const added = !this.knownKeys.has(key)
      this.knownKeys.add(key)

      // 串行写索引,新增 key 时持久化
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
          `OPFS quota exceeded for key "${key}"`,
          { cause: err, adapter: 'opfs', kind: 'quota' },
        )
      }
      if (err instanceof StorageError) throw err
      throw new StorageError(
        `OPFS set failed for key "${key}"`,
        { cause: err, adapter: 'opfs', kind: 'unknown' },
      )
    }
  }

  async remove(key: string): Promise<void> {
    this.validateKey(key)
    const root = await this.rootPromise
    try {
      await root.removeEntry(this.encodeKey(key))
    } catch (err) {
      // key 本来就不存在,幂等成功
      if (err instanceof DOMException && err.name === 'NotFoundError') {
        if (this.knownKeys) this.knownKeys.delete(key)
        return
      }
      if (err instanceof StorageError) throw err
      throw new StorageError(
        `OPFS remove failed for key "${key}"`,
        { cause: err, adapter: 'opfs', kind: 'unknown' },
      )
    }

    // 文件删成功才更新缓存和索引
    const existed = this.knownKeys?.delete(key) ?? false
    if (existed) {
      await this.enqueueMetaWrite((r) => this.writeMetaNow(r))
    }
  }

  async keys(): Promise<string[]> {
    const root = await this.rootPromise
    if (this.knownKeys === null) {
      this.knownKeys = await this.loadMeta(root)
    }
    return Array.from(this.knownKeys)
  }

  async clear(): Promise<void> {
    const root = await this.rootPromise

    // 收所有已知 key
    const keys = this.knownKeys ? Array.from(this.knownKeys) : await this.keys()

    // 并发删,每个失败不阻塞其它
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
    // 索引也清掉
    try {
      await root.removeEntry(META_FILE)
    } catch {
      // 可能本来就不存在,忽略
    }
    this.knownKeys = new Set()
    this.metaWriteQueue = Promise.resolve()
  }

  // ============== 扩展能力 ==============

  // 当前已知 key 数(走内存缓存,不读 OPFS)
  size(): number {
    return this.knownKeys?.size ?? 0
  }

  // 估算整体 OPFS 占用字节数(通过 navigator.storage.estimate)
  // 注意:返回的是整个 origin 在 OPFS+IDB+其它 storage 的总占用,非本 root 独占
  async estimatedQuotaUsage(): Promise<number | undefined> {
    if (typeof navigator !== 'undefined' && navigator.storage?.estimate) {
      const est = await navigator.storage.estimate()
      return est.usage ?? 0
    }
    return undefined
  }
}
