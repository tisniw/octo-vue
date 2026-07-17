// 变量命名构造器
// 4 个 prefix 各一个构造器
// 集中管理命名规则 派生器只调用不拼字符串

import type {
  BaseColorType,
  ColorScaleLevel,
  ColorState,
  CodeHighlightTokenType,
  SemanticColor,
} from '../token/color';

// prefix 常量
export const PREFIX_OC = '--oc';
export const PREFIX_OS = '--os';
export const PREFIX_OR = '--or';
export const PREFIX_OSR = '--osr';
/**
 * OHL = Object Highlight
 * 代码高亮配色命名空间，由主题包统一派发 CSS 变量
 * 命名规则：--ohl-{tokenType}        例：--ohl-keyword
 *       或  --ohl-background         代码块背景
 */
export const PREFIX_OHL = '--ohl';

// OC 基础 3 段 或 4 段（带 scale）
export function buildOcVar(
  type: BaseColorType,
  field: string,
  scale?: ColorScaleLevel,
): string {
  return scale
    ? `${PREFIX_OC}-${type}-${field}-${scale}`
    : `${PREFIX_OC}-${type}-${field}`;
}

// OS 状态 4 段 或 5 段（带 scale）
export function buildOsVar(
  type: BaseColorType,
  field: string,
  state: ColorState,
  scale?: ColorScaleLevel,
): string {
  return scale
    ? `${PREFIX_OS}-${type}-${field}-${state}-${scale}`
    : `${PREFIX_OS}-${type}-${field}-${state}`;
}

// OR 语义 4 段 或 5 段（带 scale）
export function buildOrVar(
  type: BaseColorType,
  field: string,
  role: keyof SemanticColor,
  scale?: ColorScaleLevel,
): string {
  return scale
    ? `${PREFIX_OR}-${type}-${field}-${role}-${scale}`
    : `${PREFIX_OR}-${type}-${field}-${role}`;
}

// OSR 状态+语义 5 段 或 6 段（带 scale）
export function buildOsrVar(
  type: BaseColorType,
  field: string,
  role: keyof SemanticColor,
  state: ColorState,
  scale?: ColorScaleLevel,
): string {
  return scale
    ? `${PREFIX_OSR}-${type}-${field}-${role}-${state}-${scale}`
    : `${PREFIX_OSR}-${type}-${field}-${role}-${state}`;
}

// OC 速查 2 段
export function buildOcShortcut(type: BaseColorType): string {
  return `${PREFIX_OC}-${type}`;
}

// OHL 代码高亮 2 段
// --ohl-{tokenType}        例：--ohl-keyword
// --ohl-background         代码块背景（语义上属于代码高亮领域，不是某个 token）
export function buildOhlVar(tokenType: CodeHighlightTokenType | 'background'): string {
  return `${PREFIX_OHL}-${tokenType}`;
}