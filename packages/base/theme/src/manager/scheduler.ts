/**
 * Manager · 调度层
 *
 * 提供两种自动调度能力：
 *   1) 系统主题（prefers-color-scheme）：跟随操作系统暗色偏好
 *   2) 跨标签同步（BroadcastChannel）：多标签页实时同步当前主题
 *
 * API：
 *   - subscribeSystemTheme()        → 监听系统主题变化，返回 unsubscribe
 *   - createScheduler()             → 创建可手动控制的调度器（manual / system / time）
 *   - broadcastThemeChange()        → 跨标签广播
 *   - onBroadcastMessage()          → 订阅广播消息（来自其他标签页）
 *   - bindBroadcastSync()           → 自动桥接广播到指定 handler（runtime.applySilently）
 *
 * 设计原则：
 *   - 全部 API 在不支持的环境（SSR / 老浏览器）下退化为 noop
 *   - 广播消息包含来源字段，runtime 可识别后避免回传循环
 *   - **不直接依赖 runtime**：通过 handler 参数注入应用逻辑，避免循环依赖
 */
import type {
  BroadcastMessage,
  SchedulerMode,
  ThemeChangeSource,
  ThemeRef,
  Unsubscribe,
} from './types';

/* ──────────────────────── 广播相关 ──────────────────────── */

/**
 * BroadcastChannel 实例（懒创建 + 能力检测）
 *
 * 使用 `BroadcastChannel` API（现代浏览器都支持）；
 * 不可用时返回 null，所有广播函数降级为 noop。
 */
const CHANNEL_NAME = 'theme-system:manager';

let _channel: BroadcastChannel | null = null;
let _channelProbed = false;

function getChannel(): BroadcastChannel | null {
  if (_channelProbed) return _channel;
  _channelProbed = true;
  if (typeof BroadcastChannel === 'undefined') {
    _channel = null;
    return null;
  }
  try {
    _channel = new BroadcastChannel(CHANNEL_NAME);
  } catch {
    _channel = null;
  }
  return _channel;
}

/**
 * 向其他标签页广播主题变更
 *
 * @param payload 含 themeRef / sn / source 的简化信息
 */
export function broadcastThemeChange(
  payload: Pick<BroadcastMessage, 'themeRef' | 'sn' | 'source'>,
): void {
  const ch = getChannel();
  if (!ch) return;
  try {
    const msg: BroadcastMessage = {
      v: 1,
      type: 'theme-changed',
      themeRef: payload.themeRef,
      sn: payload.sn,
      source: payload.source,
      at: Date.now(),
    };
    ch.postMessage(msg);
  } catch {
    /* swallow */
  }
}

/**
 * 订阅来自其他标签页的广播消息
 *
 * @param handler 处理函数，返回 false 表示"我自己就是发起的，请忽略"（按 source 判定）
 */
export function onBroadcastMessage(
  handler: (msg: BroadcastMessage) => void,
): Unsubscribe {
  const ch = getChannel();
  if (!ch) return () => undefined;
  const listener = (ev: MessageEvent) => {
    const msg = ev.data as BroadcastMessage;
    if (!msg || msg.v !== 1 || msg.type !== 'theme-changed') return;
    handler(msg);
  };
  ch.addEventListener('message', listener);
  return () => ch.removeEventListener('message', listener);
}

/**
 * 自动桥接：收到广播消息 → 转发给 handler（通常是 runtime.applySilently）。
 * 返回 unsubscribe。
 *
 * 默认行为：忽略自身发起的（source === 'broadcast' || 'init'）消息，
 * 其余消息原样转给 handler，handler 负责具体应用。
 *
 * @param handler 收到广播时的处理函数：(themeRef, source) => void
 *                推荐传 `(ref, src) => applySilently(ref, src)`
 */
export function bindBroadcastSync(
  handler: (themeRef: ThemeRef, source: 'broadcast') => void,
): Unsubscribe {
  return onBroadcastMessage((msg) => {
    // 只同步其他标签发起的，自己发起的忽略
    if (msg.source === 'broadcast' || msg.source === 'init') return;
    handler(msg.themeRef, 'broadcast');
  });
}

/* ──────────────────────── 系统主题（prefers-color-scheme） ──────────────────────── */

export type SystemTheme = 'light' | 'dark';

/**
 * 检测 matchMedia 能力
 */
function matchMediaSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function'
  );
}

/**
 * 订阅系统主题变化（prefers-color-scheme: dark）
 *
 * @param handler (theme) => void
 * @returns unsubscribe
 */
export function subscribeSystemTheme(
  handler: (theme: SystemTheme) => void,
): Unsubscribe {
  if (!matchMediaSupported()) return () => undefined;
  const mql = window.matchMedia('(prefers-color-scheme: dark)');
  const fire = (e: MediaQueryList | MediaQueryListEvent) => {
    handler(e.matches ? 'dark' : 'light');
  };
  // 立即触发一次
  fire(mql);
  // addEventListener 是新 API；addListener 是旧 API（兼容 Safari < 14）
  if (typeof mql.addEventListener === 'function') {
    mql.addEventListener('change', fire);
    return () => mql.removeEventListener('change', fire);
  }
  // 兼容路径
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (mql as any).addListener(fire);
  return () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (mql as any).removeListener(fire);
  };
}

/* ──────────────────────── 调度器工厂 ──────────────────────── */

export interface SchedulerConfig {
  /** 调度模式 */
  mode: SchedulerMode;
  /**
   * 系统主题为 light/dark 时，分别要切换到哪个主题引用。
   * 例：{ light: { visual: 'common', type: 'sky' }, dark: { visual: 'cyber', type: 'night' } }
   */
  systemMap?: Record<SystemTheme, ThemeRef>;
  /**
   * time 模式下，白天 / 夜晚的主题引用
   * 默认白天 06:00-18:00 为 light，其余为 dark
   */
  timeMap?: Record<SystemTheme, ThemeRef>;
  /**
   * 自定义主题变更源（默认 'system' 或 'time'）
   */
  source?: ThemeChangeSource;
  /**
   * 收到系统主题变更时的应用回调
   * 推荐传 `(ref, src) => applySilently(ref, src)`
   */
  apply: (ref: ThemeRef, source: ThemeChangeSource) => void;
}

export interface ThemeScheduler {
  /** 当前调度模式 */
  readonly mode: SchedulerMode;
  /** 切换调度模式 */
  setMode(mode: SchedulerMode): void;
  /** 销毁：取消所有订阅 */
  destroy(): void;
}

/**
 * 创建主题调度器
 *
 * @example
 *   const scheduler = createScheduler({
 *     mode: 'system',
 *     systemMap: {
 *       light: { visual: 'common', type: 'sky' },
 *       dark:  { visual: 'cyber',  type: 'night' },
 *     },
 *     apply: (ref, src) => applySilently(ref, src),
 *   });
 *   // 用户改系统暗色 → 自动切到 cyber-night
 *   // 切回 manual → 停止自动跟随
 *   scheduler.destroy();
 */
export function createScheduler(config: SchedulerConfig): ThemeScheduler {
  let mode: SchedulerMode = config.mode;
  let unsubSystem: Unsubscribe = () => undefined;

  const applyByTheme = (theme: SystemTheme) => {
    const map = mode === 'system' ? config.systemMap : config.timeMap;
    if (!map) return;
    const ref = map[theme];
    if (!ref) return;
    // applySilently 接受的 source 不含 manual；需过滤
    const fallback: ThemeChangeSource =
      mode === 'system' ? 'system' : 'time';
    const valid: ThemeChangeSource =
      config.source && config.source !== 'manual' ? config.source : fallback;
    config.apply(ref, valid);
  };

  const enableAuto = () => {
    unsubSystem();
    unsubSystem = subscribeSystemTheme(applyByTheme);
  };
  const disableAuto = () => {
    unsubSystem();
    unsubSystem = () => undefined;
  };

  if (mode !== 'manual') enableAuto();

  return {
    get mode() {
      return mode;
    },
    setMode(next: SchedulerMode) {
      if (next === mode) return;
      mode = next;
      if (mode === 'manual') disableAuto();
      else enableAuto();
    },
    destroy() {
      disableAuto();
    },
  };
}