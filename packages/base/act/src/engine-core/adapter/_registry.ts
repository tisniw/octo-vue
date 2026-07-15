/**
 * engine-core/adapter · 注册表 (0.0.3 §5,补全 0.0.9 §5.5)
 *
 * 对外暴露:registerAdapter / getAdapter / hasAdapter / listAdapters /
 *          listAdapterIds / defineAdapter
 *
 * 与 _loader.ts 协作:_loader 在加载完成后回调 registry 注入实例
 */

import type {
  Adapter,
  AdapterCapability,
  AdapterConfig,
  AdapterFactory,
  AdapterSummary,
  DefineAdapterPartial,
  RegisterOptions,
} from './_adapter.js'

/**
 * Unsubscribe 占位类型(@octovue/utils 未导出 Unsubscribe,本地定义)
 * Stage 7 composables 实现时可能改为从 utils 导出
 */
type Unsubscribe = () => void
import {
  ADAPTER_CONFIGS,
  ADAPTER_FACTORIES,
  loadAdapterById,
  setRegistryPut,
} from './_loader.js'

/** 工厂表与实例表(单例) */
const INSTANCES = new Map<string, Adapter>()

/** 把 _loader 完成加载的实例注入 INSTANCES(由 _loader.loadAdapterById 调用) */
function registryPut(adapter: Adapter): void {
  const id = adapter.config.id
  INSTANCES.set(id, adapter)
}

// 注入 hook(解决循环依赖:_loader ↔ _registry)
setRegistryPut(registryPut)

/** 推断 kind:内置名映射,未匹配按 name 转 lowercase 归类为 'custom' */
function inferAdapterKind(name: string): AdapterConfig['kind'] {
  const KNOWN_KINDS: Record<string, AdapterConfig['kind']> = {
    gsap: 'gsap',
    motion: 'motion',
    anime: 'motion',
    css: 'css',
    native: 'native',
    three: 'custom', // three 是 3D 引擎,仍归 custom
    pixi: 'custom',
    konva: 'custom',
  }
  const key = name.toLowerCase()
  return KNOWN_KINDS[key] ?? 'custom'
}

/**
 * 注册 adapter
 * - 优先级语义:
 *   - 同 ID 已存在,且新注册 priority <= 旧 priority → 忽略(返回空 unsubscribe)
 *   - 同 ID 已存在,且新注册 priority > 旧 priority → 覆盖
 *   - 同 ID 已存在,优先级相同 → 后者覆盖(后注册优先)
 *   - override: true → 强制覆盖
 *
 * 返回反注册函数
 */
export function registerAdapter(
  factory: AdapterFactory,
  config: AdapterConfig,
  options: RegisterOptions = {},
): Unsubscribe {
  const lazy = options.lazy ?? false
  const override = options.override ?? false

  const existingConfig = ADAPTER_CONFIGS.get(config.id)
  const isOverriding = existingConfig !== undefined
  if (isOverriding && !override) {
    const newPriority = config.priority ?? 0
    const oldPriority = existingConfig?.priority ?? 0
    if (newPriority <= oldPriority) {
      // 低优先级,不覆盖
      return () => {
        /* noop */
      }
    }
  }

  ADAPTER_FACTORIES.set(config.id, factory)
  ADAPTER_CONFIGS.set(config.id, config)

  // 立即加载(lazy=false)
  if (!lazy) {
    loadAdapterById(config.id).catch((e) => {
      console.error(`[octovue/act:adapter] Failed to load ${config.id}:`, e)
    })
  }

  // 返回反注册函数
  return () => {
    ADAPTER_FACTORIES.delete(config.id)
    ADAPTER_CONFIGS.delete(config.id)
    const instance = INSTANCES.get(config.id)
    if (instance) {
      instance.dispose()
      INSTANCES.delete(config.id)
    }
  }
}

/**
 * 已实例化的同步查询
 * - 实例已存在 → 直接返回
 * - 未实例化但有 factory → 触发后台加载,返回 null
 * - 完全未注册 → 返回 null
 */
export function getAdapter(id: string): Adapter | null {
  const instance = INSTANCES.get(id)
  if (instance) return instance
  if (ADAPTER_FACTORIES.has(id)) {
    loadAdapterById(id).catch(() => {
      // 静默失败(已 emit error 事件)
    })
    return null
  }
  return null
}

/** 检查是否注册过 (factory 或 instance) */
export function hasAdapter(id: string): boolean {
  return ADAPTER_FACTORIES.has(id) || INSTANCES.has(id)
}

/**
 * 列出所有已注册 adapter 的元数据摘要
 * 按 priority 降序排序
 */
export function listAdapters(): AdapterSummary[] {
  const result: AdapterSummary[] = []
  for (const id of ADAPTER_FACTORIES.keys()) {
    const config = ADAPTER_CONFIGS.get(id)
    if (!config) continue
    const instance = INSTANCES.get(id)
    result.push({
      id,
      kind: config.kind,
      version: config.version,
      state: instance?.state ?? 'pending',
      capabilities: config.capabilities,
      priority: config.priority ?? 0,
      loading: false,
    })
  }
  return result.sort((a, b) => b.priority - a.priority)
}

/**
 * @deprecated 0.0.9 起改用 `listAdapters()` 返回 AdapterSummary[]
 * 仅返回 ID 数组
 */
export function listAdapterIds(): string[] {
  return [...ADAPTER_FACTORIES.keys()]
}

// ============================================================
// 公开类型 re-export(供 adapter 模块内类型构造)
// ============================================================
export type {
  Adapter,
  AdapterCapability,
  AdapterConfig,
  AdapterFactory,
  AdapterSummary,
  DefineAdapterPartial,
  RegisterOptions,
} from './_adapter.js'

// ============================================================
// defineAdapter 简写 API (0.0.9 §5.5)
// ============================================================

/** 注册选项 type 给上层 */
export type DefineAdapterOptions = DefineAdapterPartial

/**
 * 用户友好的 adapter 定义简写 API
 * @example
 *   defineAdapter('gsap', async (config) => {
 *     const { default: gsap } = await import('gsap');
 *     return createGsapAdapter(gsap, config);
 *   });
 */
export function defineAdapter(
  name: string,
  factory: AdapterFactory,
  partial: DefineAdapterPartial = {},
): Unsubscribe {
  const kind = inferAdapterKind(name)

  const config: AdapterConfig = {
    id: name,
    kind,
    version: partial.version ?? '1.0.0',
    pkg: partial.pkg ?? name,
    priority: partial.priority ?? 0,
    capabilities: partial.capabilities ?? (['tween'] as readonly AdapterCapability[]),
    options: partial.options,
  }

  return registerAdapter(factory, config, {
    lazy: partial.lazy ?? false,
    override: partial.override ?? false,
  })
}
