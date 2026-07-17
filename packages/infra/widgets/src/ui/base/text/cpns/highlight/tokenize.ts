/**
 * o-text 内置语法高亮 · 词法分析器
 *
 * 把源代码字符串切成一串 HighlightToken：
 *   - 从左到右扫描
 *   - 当前位置用所有规则依次试匹配，第一条匹配命中就生成 token 并推进游标
 *   - 没规则命中的字符累积为 plain token（直到下一个能匹配的位置）
 *
 * 复杂度：O(n × r)，其中 r = 规则条数。对于本组件的轻量场景完全够用。
 *
 * 性能注意：
 *   - 每次都重新构造 RegExp（用 lastIndex 复位）会导致全字符串扫描
 *   - 本实现用 String.slice + 全新 exec，每次只匹配当前窗口
 *   - 输入上限建议 < 200 KB；超出建议分块渲染
 */

import type { HighlightToken, LanguageRule } from './types'

/**
 * 把源代码切成 token 流
 *
 * @param source 原始代码字符串
 * @param rules  当前语言的匹配规则数组（顺序即优先级）
 * @returns      token 流（含尾部的 plain 兜底）
 */
export function tokenize(source: string, rules: LanguageRule[]): HighlightToken[] {
  if (!source) return []
  if (!rules || rules.length === 0) {
    return [{ type: 'plain', value: source }]
  }

  const tokens: HighlightToken[] = []
  const len = source.length
  let i = 0

  while (i < len) {
    const window = source.slice(i)
    let matched = false

    // 依次尝试每条规则，第一条命中即采纳
    for (let r = 0; r < rules.length; r++) {
      const rule = rules[r]
      // 重置 lastIndex，避免受全局正则的副作用影响
      rule.pattern.lastIndex = 0
      const m = rule.pattern.exec(window)
      if (m && m.index === 0 && m[0].length > 0) {
        tokens.push({ type: rule.type, value: m[0] })
        i += m[0].length
        matched = true
        break
      }
    }

    if (matched) continue

    // 没有规则命中 → 累计 plain 段，扫到下一个能命中规则的位置
    let bufStart = i
    i++

    while (i < len) {
      const peek = source.slice(i)
      let anyHit = false
      for (let r = 0; r < rules.length; r++) {
        rules[r].pattern.lastIndex = 0
        const m = rules[r].pattern.exec(peek)
        if (m && m.index === 0 && m[0].length > 0) {
          anyHit = true
          break
        }
      }
      if (anyHit) break
      i++
    }

    tokens.push({ type: 'plain', value: source.slice(bufStart, i) })
  }

  return tokens
}
