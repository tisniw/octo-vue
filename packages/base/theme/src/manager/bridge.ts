/**
 * Manager · Pinia store 桥接层
 *
 * 把 `runtime` 的应用能力接到 stores/theme.ts（或任何符合 ThemeStoreLike 的 store）。
 *
 * 两种使用方式：
 *   1) `bridgeToStore(store)` —— 显式桥接（推荐，可在 App.vue 启动时调用一次）
 *   2) `useThemeBridge()`      —— 组合式 API，自动在 setup 范围绑定，组件卸载时解绑
 *
 * 单向默认：store.currentRef 变化 → runtime.apply
 * 可选双向：runtime.apply → store.setTheme（用 twoWay 配置）
 */
import { onScopeDispose, getCurrentScope, watch } from 'vue';
import type { WatchStopHandle } from 'vue';
import {
  applySilently,
  getCurrentThemeRef,
  onThemeChange,
  resolveAndApply,
} from './runtime';
import type {
  BridgeOptions,
  BridgeTeardown,
  ThemeRef,
  ThemeStoreLike,
  Unsubscribe,
} from './types';
import { bindBroadcastSync } from './scheduler';
import {
  loadThemeState,
  migrateFromLegacyKey,
} from './persistence';
import { makeThemeRef, themeRefsEqual } from './utils';

/* ──────────────────────── 内部工具 ──────────────────────── */

/**
 * 把 ThemeStoreLike 适配成可被 watch 的"getter + setter"
 *
 * 注：ThemeStoreLike.currentRef 是 Ref<ThemeRef>，watch 第一参数可以是 Ref。
 */
function makeRefAdapter(store: ThemeStoreLike) {
  return {
    get value() {
      return store.currentRef.value;
    },
    set value(v: ThemeRef) {
      store.currentRef.value = v;
    },
  };
}

/* ──────────────────────── 核心：bridgeToStore ──────────────────────── */

/**
 * 把 store 桥接到 manager runtime
 *
 * 默认行为（单向）：
 *   - 监听 store.currentRef 变化
 *   - 触发 resolveAndApply({ themeRef, persist, broadcast, notify })
 *   - 返回 teardown
 *
 * 双向（twoWay = true）：
 *   - 在单向基础上，订阅 runtime.onThemeChange
 *   - 收到时调 store.setTheme(newRef)（避免循环：仅当 ref 不同时才同步）
 *
 * @example
 *   // main.ts 或 App.vue 的 setup 中：
 *   const store = useThemeStore();
 *   const teardown = bridgeToStore(store);
 *   onBeforeUnmount(teardown);
 */
export function bridgeToStore(
  store: ThemeStoreLike,
  options: BridgeOptions = {},
): BridgeTeardown {
  const {
    autoPersist = true,
    autoBroadcast = true,
    twoWay = false,
  } = options;

  const ref = makeRefAdapter(store);
  let unsubscribed = false;

  // 单向：store → runtime
  const stopWatch: WatchStopHandle = watch(
    () => ref.value,
    (newRef, _oldRef, onCleanup) => {
      if (unsubscribed) return;
      if (!newRef || !newRef.visual || !newRef.type) return;
      resolveAndApply({
        themeRef: newRef,
        persist: autoPersist,
        broadcast: autoBroadcast,
        notify: true,
      });
      // 注：resolveAndApply 内部已写入 localStorage / 广播
      onCleanup(() => {
        /* nothing */
      });
    },
    { immediate: true },
  );

  // 可选：runtime → store（双向）
  let unsubRuntime: Unsubscribe = () => undefined;
  if (twoWay) {
    unsubRuntime = onThemeChange((snapshot) => {
      if (!themeRefsEqual(snapshot.themeRef, store.currentRef.value)) {
        store.setTheme(snapshot.themeRef);
      }
    });
    void getCurrentThemeRef; // 标记为已使用
  }

  return () => {
    if (unsubscribed) return;
    unsubscribed = true;
    stopWatch();
    unsubRuntime();
  };
}

/* ──────────────────────── 组合式 API：useThemeBridge ──────────────────────── */

/**
 * 组合式 API：在 setup 或 effectScope 中调用，自动绑定 + 卸载
 *
 * @example
 *   // App.vue
 *   const store = useThemeStore();
 *   useThemeBridge(store);
 *
 *   // 子组件（嵌套 scope）
 *   useThemeBridge(store);  // 卸载时随父组件一起解绑
 */
export function useThemeBridge(
  store: ThemeStoreLike,
  options: BridgeOptions = {},
): void {
  const teardown = bridgeToStore(store, options);
  if (getCurrentScope()) {
    onScopeDispose(teardown);
  }
}

/* ──────────────────────── 一键迁移：replaceLegacyStore ──────────────────────── */

/**
 * 一键迁移：把 stores/theme.ts 的旧 apply 流程替换为 manager 的版本
 *
 * 适用场景：未来把旧 store 的 watch + localStorage 逻辑全部迁移到 manager 时调用。
 * 当前 stores/theme.ts 仍然独立工作，所以这个函数只是预留接口。
 */
export function replaceLegacyStore(store: ThemeStoreLike): BridgeTeardown {
  // 与 bridgeToStore 完全等价；语义化命名让迁移路径更清晰
  return bridgeToStore(store, {
    autoPersist: true,
    autoBroadcast: false,
    twoWay: false,
  });
}

/* ──────────────────────── 工厂：与 BroadcastChannel 联动 ──────────────────────── */

/**
 * 创建带跨标签同步的完整桥接
 *
 * 等价于：
 *   bridgeToStore(store, { autoPersist: true, autoBroadcast: false })
 *   + bindBroadcastSync((ref) => applySilently(ref, 'broadcast'))
 *
 * @returns 卸载函数（同时解绑 watch 和 BroadcastChannel）
 */
export function bridgeWithBroadcast(
  store: ThemeStoreLike,
  options: Omit<BridgeOptions, 'autoBroadcast'> = {},
): BridgeTeardown {
  const teardown = bridgeToStore(store, { ...options, autoBroadcast: false });
  let unsubBroadcast: Unsubscribe = () => undefined;
  unsubBroadcast = bindBroadcastSync((ref) => {
    applySilently(ref, 'broadcast');
  });
  return () => {
    teardown();
    unsubBroadcast();
  };
}

/* ──────────────────────── 启动：bootstrapManager ──────────────────────── */

/**
 * 应用启动时一次性调用：从 localStorage 还原 → 应用 → 开启跨标签同步
 *
 * @example
 *   // main.ts
 *   bootstrapManager();  // 阻塞程度低，不影响首屏
 *
 * @param fallbackRef 持久化无值时的兜底主题引用
 */
export async function bootstrapManager(
  fallbackRef: ThemeRef = makeThemeRef('common', 'blue'),
): Promise<void> {
  // 1) 一次性迁移（读旧 key → 写新 key → 删旧 key）
  migrateFromLegacyKey();

  // 2) 加载持久化状态
  const persisted = loadThemeState();
  const ref: ThemeRef = persisted?.themeRef ?? fallbackRef;

  // 3) 静默应用（source = 'init'，避免广播风暴）
  applySilently(ref, 'init');

  // 4) 启动跨标签同步
  bindBroadcastSync((r) => {
    applySilently(r, 'broadcast');
  });
}