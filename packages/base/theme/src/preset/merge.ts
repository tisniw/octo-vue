/**
 * 层级合并工具 · 主题自身 > 视觉 > 通用
 *
 * 三层覆盖规则：
 *   base  = defaultStyleToken               （通用层，全字段兜底）
 *   mid   = deepMerge(base, visual)          （视觉层，StylePatch）
 *   final = deepMerge(mid, theme)            （主题层，StylePatch）
 *
 * 设计要点：
 *   - 深合并只覆盖"实际传入"的字段，缺省字段保持原值
 *   - 不修改入参对象（每次合并生成新对象）
 *   - 数组/字符串等 primitive 直接替换
 *   - 提供 countLeaves 统计覆盖量（用于调试/单测）
 */
import { defaultStyleToken, type ThemeStyleToken } from '../core/token/style';
import { defaultThemeColorToken } from '../core/token/color-defaults';
import type { ThemeColorToken } from '../core/token/color';
import type {
  PresetTheme,
  PresetVisual,
  ResolvedStyle,
  StylePatch,
} from './types';

/* ──────────────────────────── 内部工具 ──────────────────────────── */

/**
 * 判断是否为"纯对象"（排除数组、Date、Map、Set 等）
 */
function isPlainObject(v: unknown): v is Record<string, unknown> {
  if (v === null || typeof v !== 'object') return false;
  if (Array.isArray(v)) return false;
  const proto = Object.getPrototypeOf(v);
  return proto === Object.prototype || proto === null;
}

/**
 * 深合并两个对象
 * - 后者（override）的字段优先级更高
 * - 双方都是 plain object 时递归合并
 * - 否则以后者为准（primitive/array 等直接替换）
 * - 不修改入参
 */
export function deepMerge<T extends Record<string, unknown>>(
  base: T,
  override: Record<string, unknown> | undefined,
): T {
  if (!override) return base;
  if (!isPlainObject(base)) {
    return (override as T);
  }
  const out: Record<string, unknown> = { ...base };
  for (const key of Object.keys(override)) {
    const baseVal = (base as Record<string, unknown>)[key];
    const overVal = override[key];
    if (isPlainObject(baseVal) && isPlainObject(overVal)) {
      out[key] = deepMerge(baseVal, overVal);
    } else if (overVal !== undefined) {
      out[key] = overVal;
    }
  }
  return out as T;
}

/**
 * 统计对象叶子节点数（用于调试覆盖量）
 *
 * 例：{ radius: { lg: '20px' } } → 1
 * 例：{ radius: { sm: '4px', lg: '12px' } } → 2
 */
export function countLeaves(patch: Record<string, unknown> | undefined): number {
  if (!patch) return 0;
  let n = 0;
  for (const v of Object.values(patch)) {
    if (isPlainObject(v)) n += countLeaves(v);
    else n += 1;
  }
  return n;
}

/* ────────────────────────── 核心 API ────────────────────────── */

/**
 * 三层合并：defaultStyleToken ← visualStyle ← themeStyle
 *
 * @param themePatch   主题自身样式（最高优先级）
 * @param visualPatch  视觉层样式（次级）
 * @returns            完整 ThemeStyleToken（无任何 undefined 字段）
 */
export function mergeStyle(
  themePatch?: StylePatch,
  visualPatch?: StylePatch,
): ThemeStyleToken {
  // 1. 通用默认（兜底层）
  const base = structuredClone(defaultStyleToken);
  // 2. 视觉层合并
  const visual = deepMerge(base as unknown as Record<string, unknown>, visualPatch);
  // 3. 主题层合并
  const final = deepMerge(visual as unknown as Record<string, unknown>, themePatch);
  return final as ThemeStyleToken;
}

/**
 * 解析主题：返回完整样式 + 覆盖统计
 *
 * 主要使用场景：
 *   const resolved = resolveStyle({
 *     theme:   blueTheme,
 *     visual:  commonVisualStyle,
 *   });
 *   applyThemeStyle(resolved.token);
 */
export function resolveStyle(args: {
  theme: PresetTheme;
  visual: PresetVisual;
  visualStyle?: StylePatch;
}): ResolvedStyle {
  const { theme, visual, visualStyle } = args;
  const token = mergeStyle(theme.style, visualStyle);
  return {
    visual,
    themeId: theme.meta.sn,
    token,
    coverage: {
      visual: countLeaves(visualStyle),
      theme: countLeaves(theme.style),
    },
  };
}

/**
 * 调试输出：把覆盖来源标记在每个字段上
 * 返回与 ThemeStyleToken 同构的对象，值为 { value, source }
 *
 * @example
 *   debugStyle(theme.style, visualStyle)
 *   // { radius: { lg: { value: '20px', source: 'theme' } } }
 */
export type DebugSource = 'default' | 'visual' | 'theme';

export function debugStyle(
  themePatch?: StylePatch,
  visualPatch?: StylePatch,
): Record<string, unknown> {
  function walk(
    base: unknown,
    visual: unknown,
    theme: unknown,
  ): { value: unknown; source: DebugSource } {
    if (!isPlainObject(base)) {
      // primitive：取最高优先级非 undefined
      if (theme !== undefined) return { value: theme, source: 'theme' };
      if (visual !== undefined) return { value: visual, source: 'visual' };
      return { value: base, source: 'default' };
    }
    const result: Record<string, { value: unknown; source: DebugSource }> = {};
    for (const key of Object.keys(base)) {
      result[key] = walk(
        (base as Record<string, unknown>)[key],
        isPlainObject(visual) ? (visual as Record<string, unknown>)[key] : undefined,
        isPlainObject(theme) ? (theme as Record<string, unknown>)[key] : undefined,
      );
    }
    return result as unknown as { value: unknown; source: DebugSource };
  }
  return walk(defaultStyleToken, visualPatch, themePatch) as Record<string, unknown>;
}

/* ──────────────────────── 颜色三层合并 API ──────────────────────── */

/**
 * 颜色解析结果
 *
 * 流程：defaultThemeColorToken ← visualColorPatch ← themeColorPatch
 * 最终得到的完整 ThemeColorToken, 可直接交给 derive/color 生成 CSS 变量
 */
export interface ResolvedColor {
  /** 解析后的视觉 */
  visual: PresetVisual;
  /** 解析后的主题 id（仅主题层有 id） */
  themeId?: string;
  /** 完整颜色 token（继承 + 覆盖后的最终结果） */
  token: ThemeColorToken;
  /** 调试：各层覆盖了多少字段 */
  coverage: {
    /** 视觉层覆盖的字段路径计数 */
    visual: number;
    /** 主题层覆盖的字段路径计数 */
    theme: number;
  };
}

/**
 * 三层合并颜色 token：defaultThemeColorToken ← visualColorPatch ← themeColorPatch
 *
 * @param themePatch   主题自身颜色覆盖（最高优先级）
 * @param visualPatch  视觉层颜色基线（次级）
 * @returns            完整 ThemeColorToken（含 codeHighlight / state 等 13 字段）
 *
 * 设计动机：
 *   - 与 mergeStyle 保持同构设计, 让上层调用心智一致
 *   - 即使 theme.color 是完整 ThemeColorToken, deepMerge 也会安全处理
 *   - 视觉层只需要写 Partial, 缺省字段从 defaultThemeColorToken 兑底
 */
export function mergeColor(
  themePatch?: Partial<ThemeColorToken>,
  visualPatch?: Partial<ThemeColorToken>,
): ThemeColorToken {
  // 1. 通用默认兑底层
  const base = structuredClone(defaultThemeColorToken);
  // 2. 视觉层合并
  const visual = deepMerge(base as unknown as Record<string, unknown>, visualPatch);
  // 3. 主题层合并
  const final = deepMerge(visual as unknown as Record<string, unknown>, themePatch);
  return final as ThemeColorToken;
}

/**
 * 解析主题颜色：返回完整颜色 token + 覆盖统计
 *
 * 使用场景：
 *   const resolved = resolveColor({
 *     theme:   blueTheme,
 *     visual:  'common',
 *     visualColorPatch: commonVisualStyle.color,
 *   });
 *   applyThemeColor(resolved.token);
 */
export function resolveColor(args: {
  theme: PresetTheme;
  visual: PresetVisual;
  visualColorPatch?: Partial<ThemeColorToken>;
}): ResolvedColor {
  const { theme, visual, visualColorPatch } = args;
  const token = mergeColor(theme.color as Partial<ThemeColorToken>, visualColorPatch);
  return {
    visual,
    themeId: theme.meta.sn,
    token,
    coverage: {
      visual: countLeaves(visualColorPatch as unknown as Record<string, unknown>),
      theme: countLeaves(theme.color as unknown as Record<string, unknown>),
    },
  };
}

/**
 * 调试颜色覆盖来源：同 debugStyle
 * 返回与 ThemeColorToken 同构的对象，值为 { value, source }
 */
export function debugColor(
  themePatch?: Partial<ThemeColorToken>,
  visualPatch?: Partial<ThemeColorToken>,
): Record<string, unknown> {
  function walk(
    base: unknown,
    visual: unknown,
    theme: unknown,
  ): { value: unknown; source: DebugSource } {
    if (!isPlainObject(base)) {
      if (theme !== undefined) return { value: theme, source: 'theme' };
      if (visual !== undefined) return { value: visual, source: 'visual' };
      return { value: base, source: 'default' };
    }
    const result: Record<string, { value: unknown; source: DebugSource }> = {};
    for (const key of Object.keys(base)) {
      result[key] = walk(
        (base as Record<string, unknown>)[key],
        isPlainObject(visual) ? (visual as Record<string, unknown>)[key] : undefined,
        isPlainObject(theme) ? (theme as Record<string, unknown>)[key] : undefined,
      );
    }
    return result as unknown as { value: unknown; source: DebugSource };
  }
  return walk(defaultThemeColorToken, visualPatch, themePatch) as Record<string, unknown>;
}