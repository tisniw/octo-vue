/** @internal */
/**
 * engine-core/adapter · 动态加载器 (0.0.3 §4 + 0.0.9 §10)
 *
 * - 内部 `loadAdapterById`:被 _registry 与 _public 共同调用
 * - 重试 + 超时 + 退避机制
 * - 加载进度事件订阅(供 onAdapterLoadProgress)
 */
import { AdapterLoadError } from '../../types.js'
import type { Adapter, AdapterFactory, LoaderOptions, LoaderResult } from './_adapter.js'

/** 加载策略常量 */
const DEFAULT_TIMEOUT = 5000
const DEFAULT_RETRIES = 2
/** 重试退避基数 (1s, 2s, 3s, ...) */
const BACKOFF_BASE_MS = 1000

/** 加载进度事件(本文件独立定义,避免循环依赖 _public) */
export type LoadProgressEvent =
  | { type: 'start'; id: string; total: number }
  | { type: 'progress'; id: string; completed: number; total: number }
  | { type: 'complete'; id: string; duration: number }
  | { type: 'error'; id: string; error: AdapterLoadError }

type ProgressListener = (e: LoadProgressEvent) => void

/** 在加载的 Promise map(供并发去重) */
const LOADING = new Map<string, Promise<LoaderResult>>()

/**
 * 内部存储:factories 与 configs(由 _registry 写入,本模块读取)
 */
export const ADAPTER_FACTORIES = new Map<string, AdapterFactory>()
export const ADAPTER_CONFIGS = new Map<string, import('./_adapter.js').AdapterConfig>()

/** 加载进度订阅列表 */
const PROGRESS_LISTENERS = new Set<ProgressListener>()

/** 添加进度监听 */
export function addProgressListener(listener: ProgressListener): () => void {
  PROGRESS_LISTENERS.add(listener)
  return () => {
    PROGRESS_LISTENERS.delete(listener)
  }
}

/** Emit 进度事件 */
function emit(event: LoadProgressEvent): void {
  for (const l of PROGRESS_LISTENERS) {
    try {
      l(event)
    } catch (e) {
      console.error('[octovue/act:adapter] progress listener error:', e)
    }
  }
}

/** 内部:从 loader 流向 registry 注入(adapter 已就绪)— 由 registry 实现 */
let registryPut: ((adapter: Adapter) => void) | null = null
/** 由 _registry.ts 注入,避免本文件循环依赖 registry */
export function setRegistryPut(fn: (adapter: Adapter) => void): void {
  registryPut = fn
}

/**
 * 内部 loadAdapterById
 * - 已加载 → 立即返回
 * - 正在加载 → 复用 inflight Promise
 * - 否则启动新加载,带超时 + 重试 + 退避
 */
export async function loadAdapterById(
  id: string,
  opts: LoaderOptions = {},
): Promise<LoaderResult> {
  const timeout = opts.timeout ?? DEFAULT_TIMEOUT
  const retries = opts.retries ?? DEFAULT_RETRIES

  // 1. inflight 去重
  const inflight = LOADING.get(id)
  if (inflight) return inflight

  const startTime = Date.now()
  // 总数占位:实际进度由外部 preloader 提供
  let totalSteps = 1
  let completedSteps = 0

  const promise = (async (): Promise<LoaderResult> => {
    emit({ type: 'start', id, total: totalSteps })

    const factory = ADAPTER_FACTORIES.get(id)
    if (!factory) {
      const error = new AdapterLoadError(id, 'ADAPTER_NOT_REGISTERED')
      emit({ type: 'error', id, error })
      const result: LoaderResult = {
        ok: false,
        error,
        duration: Date.now() - startTime,
      }
      LOADING.delete(id)
      return result
    }

    const config = ADAPTER_CONFIGS.get(id)
    if (!config) {
      const error = new AdapterLoadError(id, 'CONFIG_MISSING')
      emit({ type: 'error', id, error })
      const result: LoaderResult = {
        ok: false,
        error,
        duration: Date.now() - startTime,
      }
      LOADING.delete(id)
      return result
    }

    let lastError: unknown

    // 2. 重试循环
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const adapter = await Promise.race([
          factory(config),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('LOAD_TIMEOUT')), timeout),
          ),
        ])
        await adapter.init()
        completedSteps++
        emit({ type: 'progress', id, completed: completedSteps, total: totalSteps })

        // 注入 registry(由 registry 提供 hook)
        if (registryPut) registryPut(adapter)

        const duration = Date.now() - startTime
        emit({ type: 'complete', id, duration })

        LOADING.delete(id)
        return { ok: true, adapter, duration }
      } catch (e) {
        lastError = e
        // 退避(最后一次不睡)
        if (attempt < retries) {
          await new Promise((r) =>
            setTimeout(r, BACKOFF_BASE_MS * (attempt + 1)),
          )
        }
      }
    }

    const error = new AdapterLoadError(id, lastError)
    emit({ type: 'error', id, error })
    const result: LoaderResult = {
      ok: false,
      error,
      duration: Date.now() - startTime,
    }
    LOADING.delete(id)
    return result
  })()

  LOADING.set(id, promise)
  return promise
}

/** 标记加载进度(由 preloader 调用)— 当前未被使用,保留扩展 */
export function markProgress(id: string, completed: number, total: number): void {
  emit({ type: 'progress', id, completed, total })
}

// 向 _adapter.ts 引用 types 确保在 _loader 引用类型
void (null as AdapterFactory | null)
