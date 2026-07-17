/**
 * Manager · 对外统一门面
 *
 * 用法：
 *
 *   // 1. 应用启动（main.ts）
 *   import { bootstrapManager } from '@/core/theme/manager';
 *   bootstrapManager('common-blue');
 *
 *   // 2. 用户切换主题（任意组件）
 *   import { resolveAndApply } from '@/core/theme/manager';
 *   resolveAndApply({ themeId: 'cyber-neon' });
 *
 *   // 3. Pinia 桥接（App.vue setup）
 *   import { useThemeBridge } from '@/core/theme/manager';
 *   const store = useThemeStore();
 *   useThemeBridge(store);
 *
 *   // 4. 自动模式（监听系统暗色）
 *   import { createScheduler } from '@/core/theme/manager';
 *   const scheduler = createScheduler({
 *     mode: 'system',
 *     systemMap: { light: 'bright-sky', dark: 'dim-night' },
 *   });
 *
 * 完整模块划分：
 *   ./types        应用层类型契约（ApplyOptions / ApplyResult / ThemeSnapshot / ...）
 *   ./runtime      核心：resolve + inject + snapshot + listener
 *   ./persistence  localStorage 读写（兼容旧 stores/theme.ts）
 *   ./scheduler    系统主题监听 + BroadcastChannel 跨标签
 *   ./bridge       与 Pinia store 的双向桥接
 *
 * 设计原则：
 *   - 单向依赖：types ← {runtime, persistence, scheduler} ← bridge
 *   - runtime 与 scheduler 之间存在 ES 模块循环 import，但只在函数调用时才求值，
 *     所以运行无碍（TypeScript 类型解析也能容忍）
 *   - 所有副作用（persist / broadcast）都包在 try/catch + 静默日志里，
 *     不会因为环境不支持就阻塞主题应用
 */

/* ─────────────────────────── 类型 ─────────────────────────── */
export type {
  ThemeRef,
  ApplyOptions,
  ApplyResult,
  ThemeSnapshot,
  ThemeListener,
  Unsubscribe,
  PersistedThemeState,
  SchedulerMode,
  ThemeChangeSource,
  BroadcastMessage,
  ThemeStoreLike,
  BridgeOptions,
  BridgeTeardown,
  ResolvedPresetStyle,
} from './types';
// 类型 re-export（让 manager 消费方无需触碰 preset/types）
export type { PresetVisual, StylePatch } from './types';

/* ────────────────────── utils ────────────────────── */
export {
  makeThemeRef,
  themeRefToSn,
  snToThemeRef,
  isThemeRef,
  themeRefsEqual,
  serializeThemeRef,
  deserializeThemeRef,
} from './utils';

/* ─────────────────────────── runtime ─────────────────────────── */
export {
  isValidThemeRef,
  resolveTheme,
  injectVars,
  resolveAndApply,
  getCurrentSnapshot,
  getCurrentThemeRef,
  getCurrentSn,
  onThemeChange,
  applySilently,
  __resetManagerState,
} from './runtime';

/* ─────────────────────────── persistence ─────────────────────────── */
export {
  STORAGE_KEY,
  isStorageAvailable,
  saveThemeState,
  loadThemeState,
  loadThemeRef,
  saveThemeRef,
  clearThemeState,
  migrateFromLegacyKey,
} from './persistence';

/* ─────────────────────────── scheduler ─────────────────────────── */
export {
  broadcastThemeChange,
  onBroadcastMessage,
  bindBroadcastSync,
  subscribeSystemTheme,
  createScheduler,
} from './scheduler';
export type { SystemTheme, SchedulerConfig, ThemeScheduler } from './scheduler';

/* ─────────────────────────── bridge ─────────────────────────── */
export {
  bridgeToStore,
  useThemeBridge,
  replaceLegacyStore,
  bridgeWithBroadcast,
  bootstrapManager,
} from './bridge';