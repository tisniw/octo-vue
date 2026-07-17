/**
 * Style 主题 CSS 变量派生器
 *
 * 输入：ThemeStyleToken（来自 preset/merge.ts 合并后的完整 token）
 * 输出：Record<string, string>   CSS 变量名 → 变量值
 *
 * 命名约定（与 composables/applyTheme.ts 保持一致）：
 *   --space-{xs|sm|md|lg|xl|2xl|3xl|4xl}            间距
 *   --radius-{none|sm|md|lg|xl|2xl|full}            圆角
 *   --shadow-{none|sm|md|lg|xl|2xl}                阴影
 *   --duration-{fast|normal|slow}                   动效时长
 *   --easing-{linear|ease|easeIn|easeOut|easeInOut} 动效缓动
 *   --font-{sans|serif|mono|display}                字体族
 *   --text-{xs|sm|base|lg|xl|2xl|3xl|4xl}           字号
 *   --weight-{thin|light|normal|medium|semibold|bold} 字重
 *   --leading-{tight|snug|normal|relaxed|loose}     行高
 *   --z-{hide|background|base|raised|...|max}       层级
 *   --opacity-{disabled|hover|active|overlay}       透明度
 */

import type { ThemeStyleToken } from '../token/style';

/* ────────────────────────── 命名构造器 ────────────────────────── */

const PREFIX = '--';

/** 递归把对象拍平为 [变量名, 变量值] 列表（不展开 string/number） */
function flatten(
  obj: Record<string, unknown>,
  prefix: string,
  out: Record<string, string>,
): void {
  for (const [k, v] of Object.entries(obj)) {
    const name = `${prefix}-${k}`;
    if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
      flatten(v as Record<string, unknown>, name, out);
    } else if (v !== undefined) {
      out[name] = String(v);
    }
  }
}

/* ────────────────────────── 主题入口 ────────────────────────── */

/**
 * 把 ThemeStyleToken 派生为完整 CSS 变量集合
 *
 * 使用：
 *   const vars = generateStyleVars(mergeStyle(theme.style, visual.style));
 *   for (const [k, v] of Object.entries(vars)) root.style.setProperty(k, v);
 */
export function generateStyleVars(token: ThemeStyleToken): Record<string, string> {
  const out: Record<string, string> = {};
  flatten(token as unknown as Record<string, unknown>, PREFIX, out);
  return out;
}

/* ────────────────────────── 单段派生器（可选） ────────────────────────── */

// 派生 spacing
export function generateSpacingVars(spacing: ThemeStyleToken['spacing']): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(spacing)) out[`--space-${k}`] = v;
  return out;
}

// 派生 radius
export function generateRadiusVars(radius: ThemeStyleToken['radius']): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(radius)) out[`--radius-${k}`] = v;
  return out;
}

// 派生 shadow
export function generateShadowVars(shadow: ThemeStyleToken['shadow']): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(shadow)) out[`--shadow-${k}`] = v;
  return out;
}

// 派生 motion
export function generateMotionVars(motion: ThemeStyleToken['motion']): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(motion.duration)) out[`--duration-${k}`] = v;
  for (const [k, v] of Object.entries(motion.easing)) out[`--easing-${k}`] = v;
  return out;
}

// 派生 font（family / size / weight / lineHeight）
export function generateFontVars(font: ThemeStyleToken['font']): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(font.family)) out[`--font-${k}`] = v;
  for (const [k, v] of Object.entries(font.size)) out[`--text-${k}`] = v;
  for (const [k, v] of Object.entries(font.weight)) out[`--weight-${k}`] = String(v);
  for (const [k, v] of Object.entries(font.lineHeight)) out[`--leading-${k}`] = String(v);
  return out;
}

// 派生 zIndex
export function generateZIndexVars(zIndex: ThemeStyleToken['zIndex']): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(zIndex)) out[`--z-${k}`] = String(v);
  return out;
}

// 派生 opacity
export function generateOpacityVars(opacity: ThemeStyleToken['opacity']): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(opacity)) out[`--opacity-${k}`] = String(v);
  return out;
}