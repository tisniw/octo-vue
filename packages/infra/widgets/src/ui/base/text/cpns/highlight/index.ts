/**
 * o-text 内置语法高亮 · 入口
 *
 * 对外暴露：
 *   - highlight(source, config)   主函数
 *   - escapeHtml(input)           HTML 转义（外部可能想用）
 *   - tokenize(source, rules)     词法分析（高级用法）
 *   - TOKEN_TYPES                 所有 token 类型列表
 *   - languages                   全部语言规则表（高级定制用）
 *   - isKnownLanguage(lang)       是否为内置支持语言
 *
 * 设计：组件层不持有任何主题状态，token 配色完全由 theme 主题组件包
 *      按当前激活视觉×主题在 :root 下注入 --ohl-* 变量。
 *
 * 默认用法（在 index.vue 中）：
 *   import { highlight } from './cpns/highlight'
 *
 *   const highlightedHtml = computed(() => highlight(source, { language: 'typescript' }))
 */

export { highlight, escapeHtml, TOKEN_TYPES } from './highlight'
export { tokenize } from './tokenize'
export { languages, isKnownLanguage } from './languages'

export type {
  HighlightLanguage,
  HighlightTokenType,
  HighlightToken,
  HighlightConfig,
  HighlightProp,
  LanguageRule,
} from './types'
