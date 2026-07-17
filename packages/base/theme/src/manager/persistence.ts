/**
 * Manager · 持久化层
 *
 * 封装 localStorage 读写，对外暴露：
 *   - saveThemeState / loadThemeState / clearThemeState
 *   - loadThemeRef / saveThemeRef（便捷方法）
 *
 * 设计原则：
 *   - SSR 安全：所有访问 localStorage 的代码都被 `isStorageAvailable` 守卫
 *   - 异常安全：任意一步抛错都 swallow，不影响主流程
 *   - 类型安全：使用 `PersistedThemeState` 结构，单 key 存所有
 *   - 向下兼容：旧格式（纯字符串 / 旧 JSON）启动时一次性迁移
 */
import type { PersistedThemeState, ThemeRef } from './types';
import type { PresetVisual } from '../preset/types';
import {
  deserializeThemeRef,
  isThemeRef,
  serializeThemeRef,
  snToThemeRef,
} from './utils';

/* ──────────────────────── 常量 ──────────────────────── */

/**
 * localStorage 主 key
 *
 * 持久化格式（写入该 key 的字符串形态）：
 *   - 有 config：`{visual:common;type:blue;config:{"--space-1":"4px"};}`
 *   - 无 config：`{visual:common;type:blue;}`
 *
 * 兼容策略：
 *   - 旧 A：JSON 对象 `{ themeRef: { visual, type, config? }, savedAt, source }`
 *   - 旧 B：JSON 对象 `{ themeId: 'common-blue', visual: 'common', savedAt, source }`
 *   - 旧 C：纯字符串 `'common-blue'`（来自 stores/theme.ts）
 *   - 启动时一次性迁移并覆写为新格式
 */
export const STORAGE_KEY = 'theme-system:manager:state';

/* ──────────────────────── 能力检测 ──────────────────────── */

let _storageAvailable: boolean | null = null;

/**
 * 检测当前环境是否支持 localStorage（浏览器 + 非隐私模式）
 *
 * 通过"set + get + remove"完整路径验证，比单纯 `typeof localStorage` 更可靠
 * （Safari 隐私模式、iOS InApp 浏览器等场景下 localStorage 存在但写入会抛错）
 */
export function isStorageAvailable(): boolean {
  if (_storageAvailable !== null) return _storageAvailable;
  if (typeof window === 'undefined' || !window.localStorage) {
    _storageAvailable = false;
    return false;
  }
  try {
    const probe = '__theme_probe__';
    window.localStorage.setItem(probe, probe);
    window.localStorage.removeItem(probe);
    _storageAvailable = true;
  } catch {
    _storageAvailable = false;
  }
  return _storageAvailable;
}

/* ──────────────────────── 写入 ──────────────────────── */

/**
 * 保存当前主题状态到 localStorage（写入自定义字符串格式）。
 *
 * 实际写入形态：
 *   `{visual:common;type:blue;}`
 *   `{visual:common;type:blue;config:{"--space-1":"4px"};}`
 *
 * 与 `PersistedThemeState.raw` 字段保持一致。
 *
 * @returns 是否写入成功
 */
export function saveThemeState(state: PersistedThemeState): boolean {
  if (!isStorageAvailable()) return false;
  try {
    const raw = serializeThemeRef(state.themeRef);
    window.localStorage.setItem(STORAGE_KEY, raw);
    return true;
  } catch (err) {
    try {
      // eslint-disable-next-line no-console
      console.warn('[theme-manager] saveThemeState failed:', err);
    } catch {
      /* swallow */
    }
    return false;
  }
}

/**
 * 便捷：只写入主题引用
 */
export function saveThemeRef(ref: ThemeRef): boolean {
  return saveThemeState({
    themeRef: ref,
    raw: serializeThemeRef(ref),
    savedAt: Date.now(),
    source: 'manual',
  });
}

/* ──────────────────────── 读取 ──────────────────────── */

/**
 * 读取主题状态；不存在或解析失败返回 null。
 *
 * 识别顺序：
 *   1. **新格式**：以 `{visual:` 开头的自定义字符串 → deserializeThemeRef
 *   2. **旧 A**：以 `{` 开头且能 JSON.parse 为对象，且含 `themeRef` 字段
 *   3. **旧 B**：JSON 对象含 `themeId + visual` → 推导出 ThemeRef
 *   4. **旧 C**：纯字符串（'common-blue'）→ 当 sn 转换
 */
export function loadThemeState(): PersistedThemeState | null {
  if (!isStorageAvailable()) return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  const trimmed = raw.trim();

  // 1. 新格式：以 { 开头 + visual 标记
  if (trimmed.startsWith('{') && /\{visual:/.test(trimmed)) {
    const ref = deserializeThemeRef(trimmed);
    if (ref) {
      return {
        themeRef: ref,
        raw: trimmed,
        savedAt: 0,
        source: 'init',
      };
    }
  }

  // 2. 旧 JSON 格式
  if (trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed) as Record<string, unknown>;

      // 旧 A：themeRef 直接给出
      if (isThemeRef(parsed.themeRef)) {
        return {
          themeRef: parsed.themeRef,
          raw: serializeThemeRef(parsed.themeRef),
          savedAt: typeof parsed.savedAt === 'number' ? parsed.savedAt : 0,
          source:
            (parsed.source as PersistedThemeState['source'] | undefined) ?? 'init',
        };
      }

      // 旧 B：themeId + visual → 推导出 ThemeRef
      if (
        typeof parsed.themeId === 'string' &&
        typeof parsed.visual === 'string'
      ) {
        const visual = parsed.visual as PresetVisual;
        const type = parsed.themeId.startsWith(`${parsed.visual}-`)
          ? parsed.themeId.slice(parsed.visual.length + 1)
          : parsed.themeId;
        const ref: ThemeRef = { visual, type };
        return {
          themeRef: ref,
          raw: serializeThemeRef(ref),
          savedAt: typeof parsed.savedAt === 'number' ? parsed.savedAt : 0,
          source:
            (parsed.source as PersistedThemeState['source'] | undefined) ?? 'init',
        };
      }
    } catch {
      /* JSON 解析失败 → 当作旧 C 处理 */
    }
  }

  // 3. 旧 C：纯字符串（如 'common-blue'）
  const ref = snToThemeRef(trimmed);
  return {
    themeRef: ref,
    raw: serializeThemeRef(ref),
    savedAt: 0,
    source: 'init',
  };
}

/**
 * 便捷：只取主题引用
 */
export function loadThemeRef(): ThemeRef | null {
  return loadThemeState()?.themeRef ?? null;
}

/* ──────────────────────── 清除 ──────────────────────── */

/**
 * 删除已存储的主题状态
 *
 * @returns 是否删除成功
 */
export function clearThemeState(): boolean {
  if (!isStorageAvailable()) return false;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

/**
 * 旧 key 的清理（stores/theme.ts 写过的 'vue-theme-system:theme-id'）。
 *
 * 迁移路径：读旧 → 以新字符串格式写入 STORAGE_KEY → 删旧 key。
 * 当旧主题是 common-XX 格式时走 `snToThemeRef`；否则当纯 type 反推 visual=common。
 */
export function migrateFromLegacyKey(
  legacyKey: string = 'vue-theme-system:theme-id',
): boolean {
  if (!isStorageAvailable()) return false;
  try {
    const legacy = window.localStorage.getItem(legacyKey);
    if (!legacy) return false;
    const ref = snToThemeRef(legacy);
    window.localStorage.setItem(STORAGE_KEY, serializeThemeRef(ref));
    window.localStorage.removeItem(legacyKey);
    return true;
  } catch {
    return false;
  }
}