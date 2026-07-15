/**
 * engine-core/adapter · 公开 loader API (0.0.9 §10)
 *
 * `loadAdapter` / `loadAdapters` / `onAdapterLoadProgress`
 * 封装 _loader 的内部能力,面向业务方 / 预热场景
 */
import { AdapterLoadError } from '../../types.js'
import type { LoadAdapterOptions, LoadProgressEvent, LoaderResult } from './_adapter.js'
import { addProgressListener, loadAdapterById } from './_loader.js'
import { getAdapter } from './_registry.js'

type Unsubscribe = () => void

const DEFAULT_BLOCKING = true

/**
 * 显式加载 adapter
 *
 * - 已加载 → 立即返回 ok=true
 * - blocking: true (默认) → await 等待完成,返回 LoaderResult
 * - blocking: false → 后台异步加载,立即返回 ok=false + LOAD_DEFERRED
 */
export async function loadAdapter(
  id: string,
  options: LoadAdapterOptions = {},
): Promise<LoaderResult> {
  const blocking = options.blocking ?? DEFAULT_BLOCKING
  // 内部 loader 选项(过滤掉 blocking)
  const internalOpts = {
    timeout: options.timeout,
    retries: options.retries,
  }

  // 1. 已加载 → 立即返回
  const existing = getAdapter(id)
  if (existing && existing.state === 'ready') {
    return { ok: true, adapter: existing, duration: 0 }
  }

  // 2. blocking=false:后台加载并立即返回 LOAD_DEFERRED
  if (!blocking) {
    loadAdapterById(id, internalOpts).catch(() => {
      // 静默失败(已 emit error 事件)
    })
    return {
      ok: false,
      error: new AdapterLoadError(id, 'LOAD_DEFERRED'),
      duration: 0,
    }
  }

  // 3. blocking=true:复用 _loader 内部逻辑
  return loadAdapterById(id, internalOpts)
}

/**
 * 批量并发加载多个 adapter
 * 任一失败不中断整体 — 每条单独返回 LoaderResult
 */
export async function loadAdapters(
  ids: string[],
  options: LoadAdapterOptions = {},
): Promise<Record<string, LoaderResult>> {
  const entries = await Promise.all(
    ids.map(
      async (id) => [id, await loadAdapter(id, options)] as const,
    ),
  )
  return Object.fromEntries(entries)
}

/**
 * 订阅加载进度事件(0.0.9 §10.4)
 * 事件联合:`start` / `progress` / `complete` / `error`
 */
export function onAdapterLoadProgress(
  listener: (event: LoadProgressEvent) => void,
): Unsubscribe {
  return addProgressListener(listener)
}

// 重导出适配器加载结果类型,保证 typecheck 链接
export type { LoadAdapterOptions, LoadProgressEvent, LoaderResult } from './_adapter.js'
