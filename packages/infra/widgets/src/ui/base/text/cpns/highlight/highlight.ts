/**
 * o-text 内置语法高亮 · 主入口
 *
 * 把源代码字符串 → tokenize → 拼接为带 <span class="o-text__hl-xxx"> 的 HTML 字符串
 *
 * 调用示例：
 *   highlight(source, { language: 'typescript' })
 *
 * 注意：本函数生成的 HTML 默认就是安全的（token value 全部 escapeHtml），
 * 可以直接交给 v-html。唯一的潜在风险是 source 自身——用户传给组件的源代码
 * 是用户自己的内容，本组件不背书。
 */

import type { HighlightConfig, HighlightToken, HighlightTokenType } from './types'
import { tokenize } from './tokenize'
import { languages, isKnownLanguage } from './languages'

// ==================== HTML 转义 ====================

const ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

/** 把可能含 HTML 特殊字符的字符串转成安全的文本 */
export function escapeHtml(input: string): string {
  return input.replace(/[&<>"']/g, c => ESCAPE_MAP[c])
}

// ==================== 规范化配置 ====================

/**
 * 默认 language：与 index.vue 的 highlightResolved 默认 'javascript' 保持一致
 * （避免直接调用 highlight(source) 时走 plain 分支导致行为不一致）
 */
const DEFAULT_LANGUAGE: keyof typeof languages = 'javascript'

function normalizeLanguage(lang: HighlightConfig['language']): keyof typeof languages {
  if (lang && isKnownLanguage(lang)) return lang
  // 未指定或未知语言 → 兜底为默认 language（javascript），
  // 只有用户显式传 plain 才走纯 escape 不分类
  if (lang === 'plain') return 'plain'
  return DEFAULT_LANGUAGE
}

// ==================== 单 token 转 HTML ====================

function renderToken(token: HighlightToken): string {
  const escaped = escapeHtml(token.value)
  if (token.type === 'plain') return escaped
  return `<span class="o-text__hl-${token.type}">${escaped}</span>`
}

// ==================== 主函数 ====================

/**
 * 把源代码字符串转成高亮后的 HTML 字符串
 *
 * @param source 源代码
 * @param config 配置（language）；未传则视作 javascript
 * @returns      可直接 v-html 的 HTML 字符串
 */
export function highlight(
  source: string,
  config: HighlightConfig = {},
): string {
  if (!source) return ''

  const lang = normalizeLanguage(config.language)
  const rules = languages[lang]

  // plain：直接 escape，不分类
  if (lang === 'plain' || rules.length === 0) {
    return escapeHtml(source)
  }

  const tokens = tokenize(source, rules)
  return tokens.map(renderToken).join('')
}

/** 所有已知 token 类型（用于 SCSS 生成对应类时参考） */
export const TOKEN_TYPES: HighlightTokenType[] = [
  'keyword', 'string', 'number', 'comment', 'regex',
  'function', 'variable', 'type', 'tag', 'attr',
  'operator', 'punctuation', 'property', 'builtin',
  'boolean', 'null', 'selector', 'plain',
]
