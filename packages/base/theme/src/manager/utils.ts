/**
 * Manager · 工具函数
 *
 * 提供 `ThemeRef` 与 preset 内部 `sn` 之间的相互转换，
 * 以及序列化/比较等通用工具。
 */
import type { ThemeRef } from './types';
import type { PresetVisual } from '../preset/types';

/* ────────────────────────── 构造 / 转换 ────────────────────────── */

/**
 * 由 visual + type 构造 ThemeRef
 *
 * @example
 *   makeThemeRef('common', 'blue')
 *   // → { visual: 'common', type: 'blue' }
 *
 *   makeThemeRef('common', 'blue', { '--space-1': '4px' })
 *   // → { visual: 'common', type: 'blue', config: { '--space-1': '4px' } }
 */
export function makeThemeRef(
  visual: PresetVisual,
  type: string,
  config?: Record<string, unknown>,
): ThemeRef {
  return config === undefined
    ? { visual, type }
    : { visual, type, config };
}

/**
 * ThemeRef → preset 内部 sn
 *
 * 推导规则：`sn = '${visual}-${type}'`
 *
 * @example
 *   themeRefToSn({ visual: 'common', type: 'blue' })  // 'common-blue'
 */
export function themeRefToSn(ref: ThemeRef): string {
  return `${ref.visual}-${ref.type}`;
}

/**
 * preset 内部 sn → ThemeRef
 *
 * 推导规则：
 *   - 取第一个 '-' 分段为 visual
 *   - 剩余拼接为 type
 *   - 可选地附带 config
 *
 * @example
 *   snToThemeRef('common-blue')              // { visual: 'common', type: 'blue' }
 *   snToThemeRef('cyber-neon', { foo: 1 })   // { visual: 'cyber', type: 'neon', config: { foo: 1 } }
 */
export function snToThemeRef(
  sn: string,
  config?: Record<string, unknown>,
): ThemeRef {
  const idx = sn.indexOf('-');
  const visual = (idx > 0 ? sn.slice(0, idx) : sn) as PresetVisual;
  const type = idx > 0 ? sn.slice(idx + 1) : '';
  return makeThemeRef(visual, type, config);
}

/* ────────────────────────── 类型守卫 ────────────────────────── */

/**
 * 运行时校验：value 是否为合法 ThemeRef
 *
 * - 新格式：从 localStorage 读到的 `themeRef` 字段
 * - 旧格式：plain themeId string（'common-blue'）也能被识别，调用方可选择
 *   是直接当 sn 转换，还是当非法值丢弃
 */
export function isThemeRef(value: unknown): value is ThemeRef {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.visual === 'string' &&
    typeof v.type === 'string' &&
    (v.config === undefined ||
      (typeof v.config === 'object' && v.config !== null))
  );
}

/* ────────────────────────── 比较 / 序列化 ────────────────────────── */

/**
 * 浅比较两个 ThemeRef 是否相等
 *
 * config 做 JSON.stringify 比较（深比较），足以覆盖常见用法。
 */
export function themeRefsEqual(a: ThemeRef, b: ThemeRef): boolean {
  if (a.visual !== b.visual || a.type !== b.type) return false;
  const aHas = a.config !== undefined;
  const bHas = b.config !== undefined;
  if (aHas !== bHas) return false;
  if (!aHas) return true;
  return JSON.stringify(a.config) === JSON.stringify(b.config);
}

/**
 * 从一段文本里提取最外层 JSON 对象（花括号配对，正确处理字符串/转义）。
 *
 * 用于本模块自创的 `{visual:common;type:blue;config:{...}}` 格式，
 * 因为 `config` 的值是嵌套 JSON，里头可能包含 `;`、空格、引号。
 *
 * @returns 最外层花括号包含的子串，找不到则返回 null
 */
function extractOuterJsonObject(input: string): string | null {
  const start = input.indexOf('{');
  if (start < 0) return null;
  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = start; i < input.length; i++) {
    const c = input[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (c === '\\') {
      escape = true;
      continue;
    }
    if (c === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (c === '{') depth++;
    else if (c === '}') {
      depth--;
      if (depth === 0) return input.slice(start, i + 1);
    }
  }
  return null;
}

/**
 * 序列化 ThemeRef → 自定义字符串格式
 *
 * 格式：
 *   - 无 config：`{visual:<visual>;type:<type>;}`
 *   - 有 config：`{visual:<visual>;type:<type>;config:<jsonObject>;}`
 *
 * 注意：JSON 内部本身的分号、引号、花括号都是合法字符；
 *       反序列化通过 `extractOuterJsonObject` 处理嵌套配对，不会与外部分隔符冲突。
 *
 * @example
 *   serializeThemeRef({ visual: 'common', type: 'blue' })
 *   // → '{visual:common;type:blue;}'
 *
 *   serializeThemeRef({ visual: 'common', type: 'blue', config: { '--space-1': '4px' } })
 *   // → '{visual:common;type:blue;config:{"--space-1":"4px"};}'
 */
export function serializeThemeRef(ref: ThemeRef): string {
  const head = `{visual:${ref.visual};type:${ref.type};`;
  if (ref.config === undefined) {
    return head + `}`;
  }
  return head + `config:${JSON.stringify(ref.config)};}`;
}

/**
 * 反序列化自定义格式字符串 → ThemeRef
 *
 * 容错策略：
 *   - 整体不以 `{` 开头或以 `}` 结尾 → null
 *   - 缺 visual / type → null
 *   - 有 `config:` 前缀但解析失败 → 丢弃 config，仅返回基础 ref
 *
 * @example
 *   deserializeThemeRef('{visual:common;type:blue;}')                 // { visual: 'common', type: 'blue' }
 *   deserializeThemeRef('{visual:common;type:blue;config:{"a":1};}') // { visual: 'common', type: 'blue', config: { a: 1 } }
 */
export function deserializeThemeRef(raw: string): ThemeRef | null {
  if (typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  if (!trimmed.startsWith('{') || !trimmed.endsWith('}')) return null;

  const body = trimmed.slice(1, -1);

  // 抽 visual（值到下一个分号为止）
  const visualMatch = body.match(/visual:([^;]+);?/);
  const typeMatch = body.match(/type:([^;]+);?/);
  if (!visualMatch || !typeMatch) return null;

  const visual = visualMatch[1] as PresetVisual;
  const type = typeMatch[1];

  // 抽 config（按花括号配对截取嵌套 JSON）
  const configIdx = body.indexOf('config:');
  if (configIdx < 0) {
    return { visual, type };
  }
  const after = body.slice(configIdx + 'config:'.length);
  const jsonStr = extractOuterJsonObject(after);
  if (!jsonStr) {
    return { visual, type };
  }
  try {
    const parsed = JSON.parse(jsonStr);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return { visual, type, config: parsed as Record<string, unknown> };
    }
    return { visual, type };
  } catch {
    return { visual, type };
  }
}