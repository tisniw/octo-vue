import { StorageError } from '../shared/error'

// FSA 目录 handle 持久化工具
//
// 用 IDB 把用户授权的 FileSystemDirectoryHandle 存起来,
// 下次启动可以免 picker 直接恢复(只要权限还在)。
//
// 设计要点:
//   1. 单条记录,固定 key 'current',多业务方共享同一目录
//   2. FileSystemDirectoryHandle 支持 structured clone,IDB 可直接存
//   3. 不做 schema 版本,handle 协议变了就清掉重来
//   4. 与 FSAAdapter 解耦 —— 这是独立的轻量工具

// 持久化的记录结构
export interface PersistedDirectoryHandle {
  // 用户授权的目录 handle
  handle: FileSystemDirectoryHandle
  // 用户给我们的命名空间子目录名
  rootName: string
  // 持久化时间,用于 UI 显示"上次绑定:xxx"
  savedAt: number
}

const DB_NAME = 'octovue-fsa'
const STORE = 'handles'
const KEY = 'current'
const VERSION = 1

// 打开/创建 IDB
// 任何错误转 StorageError(adapter: 'fsa' 标识)
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(
        new StorageError('IndexedDB is not available', {
          adapter: 'fsa',
          kind: 'not-found',
        }),
      )
      return
    }
    const req = indexedDB.open(DB_NAME, VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE)
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () =>
      reject(
        new StorageError(
          `Failed to open FSA handle DB: ${req.error?.message ?? 'unknown'}`,
          { cause: req.error, adapter: 'fsa', kind: 'unknown' },
        ),
      )
    req.onblocked = () =>
      reject(
        new StorageError(
          'FSA handle DB is blocked by another tab',
          { adapter: 'fsa', kind: 'unknown' },
        ),
      )
  })
}

// 保存目录 handle
// 覆盖式:同一 key 多次保存只保留最新
export async function saveDirectoryHandle(
  handle: FileSystemDirectoryHandle,
  rootName: string,
): Promise<void> {
  const db = await openDB()
  try {
    const record: PersistedDirectoryHandle = {
      handle,
      rootName,
      savedAt: Date.now(),
    }
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite')
      tx.objectStore(STORE).put(record, KEY)
      tx.oncomplete = () => resolve()
      tx.onerror = () =>
        reject(
          new StorageError(
            `Failed to save FSA handle: ${tx.error?.message ?? 'unknown'}`,
            { cause: tx.error, adapter: 'fsa', kind: 'unknown' },
          ),
        )
      tx.onabort = () =>
        reject(
          new StorageError(
            `FSA handle save aborted: ${tx.error?.message ?? 'unknown'}`,
            { cause: tx.error, adapter: 'fsa', kind: 'unknown' },
          ),
        )
    })
  } finally {
    db.close()
  }
}

// 读取上次保存的目录 handle
// 返回 undefined 表示没有记录,或 IDB 不可用
export async function loadDirectoryHandle(): Promise<
  PersistedDirectoryHandle | undefined
> {
  let db: IDBDatabase
  try {
    db = await openDB()
  } catch {
    return undefined
  }
  try {
    return await new Promise<PersistedDirectoryHandle | undefined>(
      (resolve, reject) => {
        const tx = db.transaction(STORE, 'readonly')
        const req = tx.objectStore(STORE).get(KEY)
        req.onsuccess = () => {
          const v = req.result as PersistedDirectoryHandle | undefined
          if (!v || typeof v !== 'object') {
            resolve(undefined)
            return
          }
          // 兜底:防止历史脏数据
          if (!v.handle || typeof v.handle !== 'object') {
            resolve(undefined)
            return
          }
          resolve(v)
        }
        req.onerror = () =>
          reject(
            new StorageError(
              `Failed to load FSA handle: ${req.error?.message ?? 'unknown'}`,
              { cause: req.error, adapter: 'fsa', kind: 'unknown' },
            ),
          )
      },
    )
  } catch {
    return undefined
  } finally {
    db.close()
  }
}

// 清除持久化的 handle(用户主动解除绑定 / 切换目录前)
export async function clearDirectoryHandle(): Promise<void> {
  const db = await openDB()
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite')
      tx.objectStore(STORE).delete(KEY)
      tx.oncomplete = () => resolve()
      tx.onerror = () =>
        reject(
          new StorageError(
            `Failed to clear FSA handle: ${tx.error?.message ?? 'unknown'}`,
            { cause: tx.error, adapter: 'fsa', kind: 'unknown' },
          ),
        )
    })
  } finally {
    db.close()
  }
}

// 是否可用
// 检查 IDB 可用 + 平台是 Chromium 系(FSA 必须)
export function isFSAHandlePersistenceAvailable(): boolean {
  return (
    typeof indexedDB !== 'undefined' &&
    typeof globalThis !== 'undefined' &&
    // FSA 必须在 Chromium 系
    typeof (globalThis as { showDirectoryPicker?: unknown })
      .showDirectoryPicker === 'function'
  )
}