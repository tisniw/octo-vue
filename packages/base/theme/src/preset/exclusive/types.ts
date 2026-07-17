/**
 * Exclusive 扫描层 · 类型契约
 *
 * 职责范围：
 *   - 定义自动视觉（auto）策略组的元信息结构
 *   - 定义普通视觉/主题扫描模块的导出形态
 *   - 区分"组骨架"（默认对外可见）和"组细节"（custom，仅按需暴露）
 *
 * 与 preset/types.ts 的关系：
 *   - 复用 PresetVisual / StylePatch / PresetTheme
 *   - 新增的是扫描层的私有类型（AutoStrategy*）
 */

/* ──────────────────────────── 模块导出形态 ──────────────────────────── */

/**
 * StylePatch 模块的 default 导出形态
 *
 * @example
 *   // visual/bright/style.ts
 *   const s: StylePatch = { motion: {...} };
 *   export default s;
 */
export interface StylePatchModule {
  default?: import('../types').StylePatch;
}

/**
 * PresetTheme 模块的可选导出形态
 *
 * 一个主题的 theme.ts 可能导出多种形式的 PresetTheme：
 *   - default export
 *   - {slug}PresetTheme 命名导出（bluePresetTheme / neonPresetTheme / ...）
 *   - presetTheme 通用命名导出
 *   - meta 命名导出
 *
 * 扫描器会按优先级逐一尝试
 */
export interface PresetThemeModule {
  default?: import('../types').PresetTheme;
  presetTheme?: import('../types').PresetTheme;
  meta?: import('../types').PresetTheme['meta'];
  /** 命名导出兜底：{slug}PresetTheme（如 bluePresetTheme / neonPresetTheme） */
  [namedExport: string]: unknown;
}

/**
 * 自动视觉策略组的可选导出形态
 *
 * 策略目录下的 index.ts（用户自定义入口）可以：
 *   - 仅 export default 一个 AutoStrategyMeta（仅修改元信息）
 *   - export default 一个含 config 的扩展对象（提供策略细节）
 *   - export named 字段（name / description / config 等）
 *
 * 不存在 index.ts 也合法：扫描器会用 DEFAULT_STRATEGY_META 兜底
 */
export interface AutoStrategyModule {
  default?: AutoStrategyMeta | (AutoStrategyMeta & { config?: unknown });
  name?: string;
  description?: string;
  config?: unknown;
  [namedExport: string]: unknown;
}

/* ──────────────────────── 自动视觉策略组类型 ──────────────────────── */

/**
 * 自动视觉策略组的元信息（对外暴露）
 *
 * 命名规则：id = `auto-{slug}`（slug = 策略子目录名）
 */
export interface AutoStrategyMeta {
  /** 策略 id：`auto-dusk-dawn` / `auto-seasons` / ... */
  id: string;
  /** 中文名（用于 UI 展示） */
  name: string;
  /** 英文/拉丁化名（来自 slug） */
  enName: string;
  /** 一句话描述（用于 UI 提示） */
  description: string;
  /** 所属视觉（恒为 'auto'） */
  visual: 'auto';
}

/**
 * 自动视觉策略组完整结构（含内部细节）
 *
 * - meta 部分默认对外可见（list/get API 返回的就是它）
 * - custom 字段仅在用户显式调用 `getAutoStrategyDetail(id)` 时返回
 *
 * 设计动机：策略组是个"组"，注册时只暴露组级信息，
 *   组内部的具体配置（时段表 / 触发阈值 / 调色板等）属于实现细节，
 *   默认不展示，除非用户主动展开。
 */
export interface AutoStrategy extends AutoStrategyMeta {
  /** 策略目录路径（相对 preset/exclusive） */
  dir: string;
  /** 策略细节（用户自定义入口的导出；不存在则为 undefined） */
  custom?: unknown;
}

/**
 * 策略组目录扫描的原始结果（内部使用）
 */
export interface AutoStrategyScanResult {
  meta: AutoStrategyMeta;
  dir: string;
  custom: unknown;
}

/* ──────────────────────────── 扫描结果聚合 ──────────────────────────── */

/**
 * exclusive 扫描的最终对外形态
 *
 * preset/index.ts 可以一次性消费这个聚合对象，
 * 也可以单独 import 某个子集（visualStyles / themeStyles / themePresets / autoStrategies）
 */
/**
 * 视觉层 style.ts 模块的可选导出形态
 *
 * 一个视觉目录的 style.ts 可以导出两种形态:
 *   - 老形态：default export 一个 StylePatch（仅提供风格基线）
 *   - 新形态：default export 一个 PresetVisualStyle（同时提供 style + color + description）
 *
 * 扫描器会按优先级逐一尝试，兼容老主题目录。
 *
 * @example
 *   // 老形态：仅风格基线
 *   // visual/tech/style.ts
 *   const s: StylePatch = { motion: { duration: { fast: '60ms' } } };
 *   export default s;
 *
 * @example
 *   // 新形态：风格 + 颜色基线
 *   // visual/tech/style.ts
 *   const v: PresetVisualStyle = {
 *     visual: 'tech',
 *     style: { ... },
 *     color: { text: { primary: '#e4e4e7' } },
 *   };
 *   export default v;
 */
export interface PresetVisualStyleModule {
  default?: import('../types').StylePatch | import('../types').PresetVisualStyle;
  /** 顶型导出兑底：直接是 PresetVisualStyle 字段 */
  style?: import('../types').StylePatch;
  color?: Partial<import('../../core/token/color').ThemeColorToken>;
  description?: string;
  [namedExport: string]: unknown;
}

/**
 * ExclusiveScanResult 补充字段：视觉层颜色基线字典
 */
export interface ExclusiveScanResult {
  /** 普通视觉 + auto 视觉的 StylePatch 字典（key = PresetVisual） */
  visualStyles: Record<import('../types').PresetVisual, import('../types').StylePatch>;
  /** 视觉层颜色基线字典（key = PresetVisual），老形态则为空对象 {} */
  visualColors: Record<import('../types').PresetVisual, Partial<import('../../core/token/color').ThemeColorToken>>;
  /** 视觉层中文描述（UI 展示） */
  visualDescriptions: Record<import('../types').PresetVisual, string>;
  /** 普通主题 StylePatch 字典（key = `${visual}-${slug}`） */
  themeStyles: Record<string, import('../types').StylePatch>;
  /** 普通主题完整 PresetTheme 字典（key = `${visual}-${slug}`） */
  themePresets: Record<string, import('../types').PresetTheme>;
  /** 主题 id → 所属 visual 反向映射（仅普通主题，不含 auto-*） */
  themeVisualMap: Record<string, import('../types').PresetVisual>;
  /** 自动视觉策略组字典（key = `auto-{slug}`） */
  autoStrategies: Record<string, AutoStrategy>;
  /** 自动视觉的 StylePatch 基线（来自 auto/style.ts） */
  autoBaseStyle: import('../types').StylePatch;
}