// Preset 总入口
//
// 内容构成：
//   1) 扫描产物（来自 ./exclusive/index.ts）：
//      - visualStyles / themeStyles / themePresets / themeVisualMap
//      - visualDescriptions / autoStrategies / autoBaseStyle
//   2) 合并工具（来自 ./merge.ts）
//   3) CSS 变量派生器（来自 ../core/derive/style）
//   4) 一键解析 + 批量应用工具（resolvePresetStyle / applyResolvedVars）
//
// 与历史版本的差异：
//   - 不再硬编码 9 个视觉的 import，由 exclusive 动态扫描
//   - 新增 themePresets / autoStrategies 字典（之前未暴露）
//   - PRESET_VISUAL_DESCRIPTION 改名为 visualDescriptions（更直观）

import type { ThemeStyleToken } from '../core/token/style';
import type { ThemeColorToken } from '../core/token/color';
import type {
  PresetVisual,
  ResolvedStyle,
  StylePatch,
} from './types';
import {
  countLeaves,
  debugStyle,
  deepMerge,
  mergeStyle,
  resolveStyle,
  mergeColor,
  resolveColor,
  debugColor,
  type ResolvedColor,
} from './merge';
import {
  generateFontVars,
  generateMotionVars,
  generateOpacityVars,
  generateRadiusVars,
  generateShadowVars,
  generateSpacingVars,
  generateStyleVars,
  generateZIndexVars,
} from '../core/derive/style';
import {
  generateOhlVars,
  generateColorVars,
} from '../core/derive';

// ─────────────────────────── 扫描层（来源：exclusive/index.ts）───────────────────────────
//

import {
  autoBaseStyle,
  autoStrategies,
  hasThemePreset,
  listAutoStrategies,
  listAutoStrategyDetails,
  listAutoStrategyIds,
  themePresets,
  themeStyles,
  themeVisualMap,
  visualColors,
  visualDescriptions,
  visualStyles,
} from './exclusive';

// ─────────────────────────── 视觉层（兼容别名）───────────────────────────

/**
 * 视觉层中文描述（供 UI 展示）
 *
 * 兼容旧名：原 preset/index.ts 里的 PRESET_VISUAL_DESCRIPTION
 * 实际数据来自 exclusive 扫描层的 visualDescriptions
 */
export const PRESET_VISUAL_DESCRIPTION: Record<PresetVisual, string> = visualDescriptions;

// ─────────────────────────── 便捷查询函数 ───────────────────────────

/**
 * 获取某个 visual 的 StylePatch
 *
 * @example
 *   const patch = getVisualStyle('common'); // { motion: { duration: {...} } }
 */
export function getVisualStyle(visual: PresetVisual): StylePatch {
  return visualStyles[visual];
}

/**
 * 获取某个主题的 StylePatch（仅该主题自身的覆盖）
 *
 * @example
 *   const patch = getThemeStyle('common-blue');
 */
export function getThemeStyle(themeId: string): StylePatch | undefined {
  return themeStyles[themeId];
}

/**
 * 判断主题是否存在（防止误传）
 */
export function hasThemeStyle(themeId: string): boolean {
  return Object.prototype.hasOwnProperty.call(themeStyles, themeId);
}

/**
 * 获取所有主题 id 列表（按字母序）
 */
export function listThemeIds(): string[] {
  return Object.keys(themeStyles).sort();
}

/**
 * 获取主题的完整 PresetTheme（含颜色 token + meta + style）
 *
 * 注意：未导出 theme.ts 的主题返回 undefined
 */
export function getThemePreset(themeId: string): import('./types').PresetTheme | undefined {
  return themePresets[themeId];
}

// ─────────────────────────── 一键解析 ───────────────────────────

export interface ResolvePresetStyleOptions {
  /** 视觉层枚举（必填） */
  visual: PresetVisual;
  /** 主题 id（可选）；缺省则只合并"通用层 + 视觉层" */
  themeId?: string;
}

/**
 * 一键解析结果：包含完整 token、CSS 变量、覆盖统计
 */
export interface ResolvedPresetStyle {
  /** 视觉层 */
  visual: PresetVisual;
  /** 主题 id（若传入） */
  themeId?: string;
  /** 完整样式 token（所有层合并后的最终结果） */
  token: ThemeStyleToken;
  /** 拍平后的 CSS 变量（key 以 --space- / --radius- / --shadow- / ... 开头） */
  vars: Record<string, string>;
  /** 调试：各层覆盖了多少字段路径 */
  coverage: {
    visual: number;
    theme: number;
  };
}

/**
 * 一站式解析：合并三层 + 派生 CSS 变量
 *
 * @example
 *   const { token, vars } = resolvePresetStyle({
 *     visual: 'cyber',
 *     themeId: 'cyber-neon',
 *   });
 *
 * 合并顺序：
 *   1) 通用层 defaultStyleToken（兜底）
 *   2) 视觉层 visualStyles[visual]
 *   3) 主题层 themeStyles[themeId]（若提供）
 */
export function resolvePresetStyle(
  options: ResolvePresetStyleOptions,
): ResolvedPresetStyle {
  const { visual, themeId } = options;
  const visualPatch = visualStyles[visual];
  const themePatch = themeId ? themeStyles[themeId] : undefined;
  const token = mergeStyle(themePatch, visualPatch);
  const vars = generateStyleVars(token);
  return {
    visual,
    themeId,
    token,
    vars,
    coverage: {
      visual: countLeaves(visualPatch),
      theme: countLeaves(themePatch),
    },
  };
}

// ─────────────────────────── 批量应用工具 ───────────────────────────

/**
 * 把解析结果中的 CSS 变量一次性注入 :root
 *
 * @example
 *   applyResolvedVars(resolvePresetStyle({ visual: 'common', themeId: 'common-blue' }));
 *
 * @param resolved   resolvePresetStyle 的返回值
 * @param target     目标元素（默认 document.documentElement）
 */
export function applyResolvedVars(
  resolved: ResolvedPresetStyle,
  target: HTMLElement = document.documentElement,
): void {
  // 一次性写入，避免多次 reflow
  const css = Object.entries(resolved.vars)
    .map(([k, v]) => k + ': ' + v + ';')
    .join(' ');
  target.style.cssText = css;
}

// ─────────────────────────── 颜色层 API ───────────────────────────

/**
 * 视觉层颜色基线字典（key = PresetVisual）
 *
 * 设计动机：
 *   - visual/style.ts 可选定义 color: Partial<ThemeColorToken>
 *   - 老形态（仅 style）此处为空 {}，mergeColor 会从 defaultThemeColorToken 兑底
 *   - 与 visualStyles 同构，调用者心智一致
 */
export const visualColorPatches: Record<PresetVisual, Partial<ThemeColorToken>> = visualColors;

/**
 * 获取某个 visual 的颜色基线
 *
 * @example
 *   const patch = getVisualColor('common'); // Partial<ThemeColorToken> 可能为空 {}
 */
export function getVisualColor(visual: PresetVisual): Partial<ThemeColorToken> {
  return visualColors[visual] ?? {};
}

export interface ResolvePresetColorOptions {
  /** 视觉层枚举（必填） */
  visual: PresetVisual;
  /** 主题 id（可选）；缺省则只合并"通用层 + 视觉层" */
  themeId?: string;
}

/**
 * 颜色一键解析结果：完整颜色 token + 拍平的 CSS 变量 + 覆盖统计
 */
export interface ResolvedPresetColor {
  visual: PresetVisual;
  themeId?: string;
  /** 完整颜色 token（含 13 字段：background / component / ... / codeHighlight） */
  token: ThemeColorToken;
  /** 拍平后的 CSS 变量（含 --oc-* / --or-* / --os-* / --osr-* / --ohl-*） */
  vars: Record<string, string>;
  coverage: {
    visual: number;
    theme: number;
  };
}

/**
 * 一站式颜色解析：合并三层 + 派生 CSS 变量（含 --ohl-* 代码高亮）
 *
 * 合并顺序：
 *   1) 通用层 defaultThemeColorToken（兑底）
 *   2) 视觉层 visualColors[visual]
 *   3) 主题层 themePresets[themeId].color（若提供）
 */
export function resolvePresetColor(
  options: ResolvePresetColorOptions,
): ResolvedPresetColor {
  const { visual, themeId } = options;
  const visualPatch = visualColors[visual];
  const themePatch = themeId ? themePresets[themeId]?.color : undefined;
  const token = mergeColor(
    themePatch as Partial<ThemeColorToken> | undefined,
    visualPatch,
  );
  const vars = generateColorVars(token);
  return {
    visual,
    themeId,
    token,
    vars,
    coverage: {
      visual: countLeaves(visualPatch as unknown as Record<string, unknown>),
      theme: countLeaves(themePatch as unknown as Record<string, unknown>),
    },
  };
}

/**
 * 把颜色解析结果中的 CSS 变量一次性注入 :root
 * （与 applyResolvedVars 同构，但专用于颜色）
 */
export function applyResolvedColorVars(
  resolved: ResolvedPresetColor,
  target: HTMLElement = document.documentElement,
): void {
  const css = Object.entries(resolved.vars)
    .map(([k, v]) => k + ': ' + v + ';')
    .join(' ');
  target.style.cssText = css;
}

// ─────────────────────────── 类型/工具再导出 ───────────────────────────

// ── 类型 ──
export type {
  PresetVisual,
  StylePatch,
  StylePath,
  PresetTheme,
  PresetThemeMeta,
  PresetVisualStyle,
  ResolvedStyle,
  MergeStyleOptions,
  DeepPartial,
} from './types';

// ── 枚举 / 字典 ──
export { PRESET_VISUAL_LABEL } from './types';

// ── 合并工具 ──
export {
  countLeaves,
  debugStyle,
  deepMerge,
  mergeStyle,
  resolveStyle,
  mergeColor,
  resolveColor,
  debugColor,
} from './merge';
export type { DebugSource, ResolvedColor } from './merge';

// ── CSS 变量派生器 ──
export {
  generateFontVars,
  generateMotionVars,
  generateOpacityVars,
  generateRadiusVars,
  generateShadowVars,
  generateSpacingVars,
  generateStyleVars,
  generateZIndexVars,
} from '../core/derive/style';
export {
  generateOhlVars,
  generateColorVars,
} from '../core/derive';

// ── 扫描层 re-export（auto 视觉）───
export {
  autoBaseStyle,
  autoStrategies,
  hasThemePreset,
  listAutoStrategies,
  listAutoStrategyDetails,
  listAutoStrategyIds,
  themePresets,
  themeStyles,
  themeVisualMap,
  visualColors,
  visualDescriptions,
  visualStyles,
};
export type { AutoStrategy, AutoStrategyMeta } from './exclusive/types';