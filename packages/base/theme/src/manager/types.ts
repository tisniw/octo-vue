/**
 * Manager 应用层类型契约
 *
 * 职责分层：
 *   core/    契约（token 形态、CSS 变量派生规则）
 *   preset/  内容（视觉层 + 主题层 style 补丁）
 *   manager/ 应用（运行时编排：读 → 合并 → 派生 → 注入 → 通知）
 *
 * 本文件只放类型，不放实现。
 */
import type { PresetVisual, ResolvedStyle, StylePatch } from '../preset/types';
import type { ResolvedPresetColor } from '../preset';
import type { ThemeColorToken } from '../core/token/color';

// 把 preset 的核心类型在本层 re-export，让消费方只需从 `manager` 导入
export type { PresetVisual, StylePatch } from '../preset/types';

/* ────────────────────── preset 解析结果（本层扩展） ────────────────────── */

/**
 * preset 完整解析结果
 * - 扩展 `ResolvedStyle`，多出 `vars` 字段（拍平后的 CSS 变量）
 * - 与 `preset/index.ts` 中 `resolvePresetStyle` 的返回值一一对应
 */
export interface ResolvedPresetStyle extends ResolvedStyle {
  /** 拍平后的 CSS 变量，key 以 `--space-` / `--radius-` / `--shadow-` / ... 开头 */
  vars: Record<string, string>;
}

/* ────────────────────── 主题引用（结构化标识） ────────────────────── */

/**
 * 主题引用（结构化标识）
 *
 * 取代旧的"单一字符串 themeId"。一个完整的运行时引用由三部分构成：
 *   - visual  视觉层（如 'common' / 'cyber' / 'auto'），决定 token 的根基颜色族
 *   - type    主题类型（slug），决定主题独有的 style 补丁
 *   - config  可选：用户对该主题的自定义覆盖（任意 JSON）
 *
 * 持久化形态与运行时形态保持一致（直接 JSON 序列化即可）。
 *
 * @example
 *   // 默认主题
 *   { visual: 'common', type: 'blue' }
 *   // 带自定义覆盖
 *   { visual: 'common', type: 'blue', config: { '--space-1': '4px' } }
 *
 * 推导出 preset 内部 sn 的规则（见 utils.ts）：
 *   sn = `${visual}-${type}`，如 'common-blue' / 'cyber-neon'
 */
export interface ThemeRef {
  /** 视觉层 */
  visual: PresetVisual;
  /** 主题类型（slug，决定主题 style 补丁） */
  type: string;
  /** 可选：用户自定义覆盖（任意 JSON 对象） */
  config?: Record<string, unknown>;
}

/* ────────────────────── 应用选项 / 结果 ────────────────────── */

/**
 * resolveAndApply 的入参
 *
 * @example
 *   await resolveAndApply({ themeRef: { visual: 'common', type: 'blue' } });
 *   await resolveAndApply({
 *     themeRef: { visual: 'common', type: 'blue', config: { '--space-1': '4px' } },
 *     target: someEl,
 *     persist: true,
 *     broadcast: true,
 *   });
 */
export interface ApplyOptions {
  /**
   * 主题引用（结构化标识）
   * 必填；非法 ref（visual/type 未注册）会走兜底（仅用 visual 基线）
   */
  themeRef: ThemeRef;
  /**
   * 注入目标元素，默认 `document.documentElement`（即 :root）
   */
  target?: HTMLElement;
  /**
   * 是否写入 localStorage，默认 true
   */
  persist?: boolean;
  /**
   * 是否通过 BroadcastChannel 通知其他标签页，默认 true
   */
  broadcast?: boolean;
  /**
   * 是否触发本地 onThemeChange 监听器，默认 true
   */
  notify?: boolean;
}

/**
 * resolveAndApply 的返回值
 */
export interface ApplyResult {
  /** 主题引用（与入参一致） */
  themeRef: ThemeRef;
  /** 由 themeRef 推导出的 preset 内部 sn（visual-type） */
  sn: string;
  /**
   * preset 完整样式解析结果（token + vars + coverage）
   * - alias of `ResolvedStyle` in preset/types
   * - 同 preset/index.ts 中的 `ResolvedPresetStyle`（增强字段：vars）
   */
  resolved: ResolvedPresetStyle;
  /**
   * preset 完整颜色解析结果（token + vars + coverage）
   * - 与 resolved 同步计算，但独立存在
   * - vars 含 --oc-* / --or-* / --os-* / --osr-* / --ohl-* 五套前缀
   */
  resolvedColor: ResolvedPresetColor;
  /** 注入时间戳（毫秒） */
  appliedAt: number;
  /** 是否写入了 localStorage */
  persisted: boolean;
  /** 是否通过 BroadcastChannel 广播了 */
  broadcasted: boolean;
}

/* ────────────────────────── 主题快照 ────────────────────────── */

/**
 * 当前生效主题的快照（用于跨组件读、调试、回滚）
 */
export interface ThemeSnapshot {
  /** 主题引用 */
  themeRef: ThemeRef;
  /** 由 themeRef 推导出的 preset 内部 sn */
  sn: string;
  /** 拍平后的 CSS 变量（style + color 全部） */
  vars: Record<string, string>;
  /** 主题自身的 style 覆盖（仅调试用，可能为空对象） */
  patch: StylePatch;
  /**
   * 颜色解析结果快照（含完整 ThemeColorToken + 派生出的 vars）
   * - 订阅者可以从中读取 codeHighlight / background 等 token
   * - 遵同一主题切换时同步刷新
   */
  color: {
    token: ThemeColorToken;
    vars: Record<string, string>;
  };
  /** 捕获时间戳 */
  capturedAt: number;
}

/* ────────────────────────── 监听器 ────────────────────────── */

/**
 * 主题变化监听器签名
 */
export type ThemeListener = (snapshot: ThemeSnapshot) => void;

/**
 * 取消订阅函数
 */
export type Unsubscribe = () => void;

/* ────────────────────── 持久化相关类型 ────────────────────── */

/**
 * localStorage 存储结构（一个 key 存所有）
 *
 * 持久化格式（推荐新格式）：
 *   - `{visual:common;type:blue;}`
 *   - `{visual:common;type:blue;config:{"--space-1":"4px"};}`
 *
 * 该 raw 字符串会原样写入 localStorage 的 `theme-system:manager:state` key。
 *
 * 兼容读取：启动时 `loadThemeState` 也能解析以下旧格式并一次性迁移：
 *   - 旧 A：JSON 对象 `{ themeRef: { visual, type, config? }, savedAt, source }`
 *   - 旧 B：JSON 对象 `{ themeId: 'common-blue', visual: 'common', savedAt, source }`
 *   - 旧 C：纯字符串 `'common-blue'`
 */
export interface PersistedThemeState {
  /**
   * 主题引用（结构化标识）
   * - 新数据：必有
   * - 旧数据：从 themeId / 字符串推导出
   */
  themeRef: ThemeRef;
  /**
   * 原始持久化字符串。
   * - 新数据：等价于 `serializeThemeRef(themeRef)`，也可能包含尾随 `savedAt/source` 元信息
   * - 内存中只读：save 时重新生成
   */
  raw?: string;
  /** 保存时间戳 */
  savedAt: number;
  /** 来源（manual / system / time / broadcast），用于诊断 */
  source: ThemeChangeSource;
}

/* ────────────────────── 调度模式 / 源 ────────────────────── */

/**
 * 调度模式
 *  - manual: 用户手动切换（默认）
 *  - system: 跟随系统 prefers-color-scheme
 *  - time:   按时段（白天 light / 夜晚 dark）
 */
export type SchedulerMode = 'manual' | 'system' | 'time';

/**
 * 主题变更来源（用于追踪与避免循环广播）
 */
export type ThemeChangeSource = 'manual' | 'system' | 'time' | 'broadcast' | 'init';

/* ────────────────────── BroadcastChannel 消息 ────────────────────── */

/**
 * 跨标签同步的广播消息格式
 *
 * 跨标签收到消息后，runtime 应当：
 *   1) 调用 resolveAndApply({ themeRef, source: 'broadcast', broadcast: false })
 *   2) 避免再次回传（通过 broadcast: false + source 区分）
 */
export interface BroadcastMessage {
  /** 消息协议版本（未来字段演进用） */
  v: 1;
  /** 消息类型 */
  type: 'theme-changed';
  /** 新主题引用（结构化） */
  themeRef: ThemeRef;
  /** 由 themeRef 推导出的 preset 内部 sn（visual-type） */
  sn: string;
  /** 来源 */
  source: ThemeChangeSource;
  /** 时间戳 */
  at: number;
}

/* ────────────────────── Bridge 桥接相关类型 ────────────────────── */

/**
 * Pinia store 桥接的最小契约
 *
 * 任何提供 currentRef (Ref<ThemeRef>) 与 setTheme(ref) 的对象都能桥接，
 * 不必强依赖具体 store 类型。
 */
export interface ThemeStoreLike {
  /** 当前主题引用（响应式） */
  currentRef: { value: ThemeRef };
  /** 设置主题（不触发广播） */
  setTheme(ref: ThemeRef): void;
}

/**
 * Bridge 配置
 */
export interface BridgeOptions {
  /**
   * 是否在 bridge 内自动 persist，默认 true
   */
  autoPersist?: boolean;
  /**
   * 是否在 bridge 内自动 broadcast，默认 true
   */
  autoBroadcast?: boolean;
  /**
   * 是否同时反向同步（runtime 主动调 setTheme），默认 false
   * - true:  runtime.apply → store.currentRef
   * - false: 仅单向 store → runtime
   */
  twoWay?: boolean;
}

/**
 * Bridge 卸载函数
 */
export type BridgeTeardown = () => void;