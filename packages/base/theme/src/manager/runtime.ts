/**
 * Manager · 运行时核心
 *
 * 把 `preset/` 的解析结果翻译成 CSS 变量并注入目标元素，
 * 同时维护"当前主题快照"与"变更订阅"，是 manager 对外暴露的最主要 API。
 *
 * 不依赖 Vue、不依赖 Pinia，可独立测试；
 * 与 stores/composables 协作通过 `bridge.ts` 完成。
 */
import {
  applyResolvedVars,
  hasThemeStyle,
  resolvePresetColor,
  resolvePresetStyle,
} from '../preset';
import type { ResolvedPresetColor } from '../preset';
import type {
  PresetVisual,
  ResolvedPresetStyle,
  StylePatch,
  ThemeListener,
  ThemeRef,
  ThemeSnapshot,
  Unsubscribe,
  ApplyOptions,
  ApplyResult,
} from './types';
import { saveThemeState } from './persistence';
import { broadcastThemeChange } from './scheduler';
import { themeRefToSn } from './utils';

/* ──────────────────────── 私有全局状态 ──────────────────────── */

/** 当前主题快照（最近一次 resolveAndApply 的结果） */
let _currentSnapshot: ThemeSnapshot | null = null;

/** 已注册的监听器 */
const _listeners = new Set<ThemeListener>();

/** 静默标记：是否正在处理广播回传（用于避免循环通知） */
let _suppressNotify = false;

/* ────────────────────────── 校验与解析 ────────────────────────── */

/**
 * 校验主题 ref 是否已注册；未注册时打印 warning 但不抛错。
 * 返回 boolean 供上层决定是否继续。
 *
 * 判定依据：preset 是否存在 `${visual}-${type}` 风格的 sn。
 */
export function isValidThemeRef(ref: ThemeRef): boolean {
  return hasThemeStyle(themeRefToSn(ref));
}

/**
 * 应用前解析：合并三层 token + 派生 CSS 变量。
 * 不做任何 DOM 写入，方便单元测试和预览面板复用。
 */
export function resolveTheme(ref: ThemeRef): ResolvedPresetStyle {
  if (!isValidThemeRef(ref)) {
    try {
      // eslint-disable-next-line no-console
      console.warn(
        `[theme-manager] Unknown themeRef {visual: "${ref.visual}", type: "${ref.type}"}, falling back to visual baseline only.`,
      );
    } catch {
      /* swallow */
    }
  }
  return resolvePresetStyle({
    visual: ref.visual,
    themeId: themeRefToSn(ref),
  });
}

/* ────────────────────────── 注入到 DOM ────────────────────────── */

/**
 * 把 vars 注入到目标元素的 inline style。
 *
 * 与 `preset/applyResolvedVars` 的区别：
 *   - 多了一个 `clearBefore` 选项（默认 true，避免历史残留）
 *   - 不重复读取 preset 的实现，避免循环依赖
 */
export function injectVars(
  vars: Record<string, string>,
  target: HTMLElement = document.documentElement,
  clearBefore: boolean = true,
): void {
  if (clearBefore) {
    // 清除所有由本主题写入的 --* 变量；保留其他 inline style
    const prev = target.getAttribute('style') ?? '';
    target.setAttribute(
      'style',
      prev
        .split(';')
        .map((s) => s.trim())
        .filter((s) => s && !/^\s*--/.test(s))
        .join('; ') + (prev ? '; ' : ''),
    );
  }
  const css = Object.entries(vars)
    .map(([k, v]) => `${k}: ${v};`)
    .join(' ');
  // append（clearBefore 已经把 --xxx 清掉了），与旧 applyTheme 实现保持一致
  const prev = target.getAttribute('style') ?? '';
  target.setAttribute('style', (prev ? prev + ' ' : '') + css);
}

/**
 * 在 :root 上设置 data 属性（方便 CSS 选择器）
 */
function setDataAttrs(ref: ThemeRef, sn: string): void {
  const root = document.documentElement;
  root.dataset.theme = sn;
  root.dataset.themeVisual = ref.visual;
}

/* ──────────────────────── 核心 API：resolveAndApply ──────────────────────── */

/**
 * 一站式应用主题：解析 → 注入 → 持久化 → 广播 → 通知
 *
 * 设计原则：
 *   - 默认全开（persist + broadcast + notify），单次调用即生效
 *   - 显式传 false 可关闭某一环，方便 scheduler/broadcast 回调用
 *   - 静默标记 `_suppressNotify` 用于屏蔽广播回传引发的二次通知
 */
export function resolveAndApply(options: ApplyOptions): ApplyResult {
  const {
    themeRef,
    target = document.documentElement,
    persist = true,
    broadcast = true,
    notify = true,
  } = options;

  const sn = themeRefToSn(themeRef);
  const resolved = resolvePresetStyle({ visual: themeRef.visual, themeId: sn });
  const resolvedColor = resolvePresetColor({ visual: themeRef.visual, themeId: sn });

  // 1. 注入 DOM（style + color vars 一锅出, data 属性）
  //    合并两套 vars, 后写覆盖先写（同 key 选后顺序中的后者）
  const mergedVars = { ...resolved.vars, ...resolvedColor.vars };
  injectVars(mergedVars, target);
  setDataAttrs(themeRef, sn);

  // 2. 写 localStorage
  let persisted = false;
  if (persist) {
    try {
      saveThemeState({
        themeRef,
        savedAt: Date.now(),
        source: 'manual',
      });
      persisted = true;
    } catch (err) {
      tryPersistLog(err);
    }
  }

  // 3. 广播
  let broadcasted = false;
  if (broadcast) {
    try {
      broadcastThemeChange({ themeRef, sn, source: 'manual' });
      broadcasted = true;
    } catch (err) {
      tryPersistLog(err);
    }
  }

  // 4. 更新快照 + 通知监听器
  const snapshot = buildSnapshot(themeRef, sn, resolved, resolvedColor);
  _currentSnapshot = snapshot;
  if (notify && !_suppressNotify) {
    for (const fn of _listeners) {
      try {
        fn(snapshot);
      } catch (err) {
        console.error('[theme-manager] listener error:', err);
      }
    }
  }

  return {
    themeRef,
    sn,
    resolved,
    resolvedColor,
    appliedAt: Date.now(),
    persisted,
    broadcasted,
  };
}

/* ────────────────────────── 快照 / 订阅 ────────────────────────── */

/**
 * 构建快照（私有）：从 resolved 中提取 vars + patch + color
 */
function buildSnapshot(
  ref: ThemeRef,
  sn: string,
  resolved: ResolvedPresetStyle,
  resolvedColor: ResolvedPresetColor,
): ThemeSnapshot {
  const patch: StylePatch = (resolved.token as unknown as StylePatch) ?? {};
  return {
    themeRef: ref,
    sn,
    vars: { ...resolved.vars, ...resolvedColor.vars },
    patch,
    color: {
      token: resolvedColor.token,
      vars: { ...resolvedColor.vars },
    },
    capturedAt: Date.now(),
  };
}

/**
 * 获取当前主题快照；从未应用过则返回 null
 */
export function getCurrentSnapshot(): ThemeSnapshot | null {
  return _currentSnapshot;
}

/**
 * 同步获取当前主题引用；从未应用过返回 null
 */
export function getCurrentThemeRef(): ThemeRef | null {
  return _currentSnapshot?.themeRef ?? null;
}

/**
 * 同步获取当前主题 sn；从未应用过返回 null
 */
export function getCurrentSn(): string | null {
  return _currentSnapshot?.sn ?? null;
}

/**
 * 订阅主题变化；返回 unsubscribe
 */
export function onThemeChange(fn: ThemeListener): Unsubscribe {
  _listeners.add(fn);
  return () => _listeners.delete(fn);
}

/**
 * 静默应用：用于 BroadcastChannel 回传 / scheduler 自动调度的场景，
 * 避免 listener 误以为是"用户主动切换"。
 */
export function applySilently(
  ref: ThemeRef,
  source: 'broadcast' | 'system' | 'time' | 'init',
): ApplyResult {
  _suppressNotify = true;
  try {
    const result = resolveAndApply({
      themeRef: ref,
      persist: source !== 'broadcast', // 广播回传不重复写
      broadcast: false, // 广播回传不再回传
      notify: source !== 'broadcast', // 广播回传也通知本地（确保 UI 同步）
    });
    void source; // 占位，未来可记日志
    return result;
  } finally {
    _suppressNotify = false;
  }
}

/**
 * 重置内部状态（仅测试用；正式代码无需调用）
 */
export function __resetManagerState(): void {
  _currentSnapshot = null;
  _listeners.clear();
  _suppressNotify = false;
}

/**
 * 日志小工具：把 console.warn 包裹在 try/catch 里，避免运行环境没有 console 时崩溃
 */
function tryPersistLog(err: unknown): void {
  try {
    // eslint-disable-next-line no-console
    console.warn('[theme-manager] side effect failed:', err);
  } catch {
    /* swallow */
  }
}