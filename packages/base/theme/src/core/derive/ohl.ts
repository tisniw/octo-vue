// OHL 代码高亮配色契约
// --ohl-{tokenType}        每个语法 token 的颜色    例：--ohl-keyword
// --ohl-background         代码块整体背景
//
// 与 OC/OS/OR/OSR 不同的点：
//   - 没有 11 阶色阶展开（每个 token 只有一个值）
//   - 没有状态/语义变体（代码块本身就是只读的，无 hover/active 状态）
//   - 直接 1:1 把 codeHighlight 字典拍平为 CSS 变量
//
// 设计动机：
//   组件层消费 --ohl-keyword 时,完全不需要知道"当前是什么主题"，
//   主题切换时 runtime 重新派发 --ohl-* 变量,组件自然跟随。

import type { CodeHighlightColor } from '../token/color';
import { codeHighlightTokenTypes } from '../token/color';
import { buildOhlVar } from './builder';

// OHL 派生器
// 输入：CodeHighlightColor（19 个 token 颜色 + background）
// 输出：{ '--ohl-keyword': '#xxx', ..., '--ohl-background': '#xxx' }
export function generateOhlVars(codeHighlight: CodeHighlightColor): Record<string, string> {
  const vars: Record<string, string> = {};

  // 18 个 token 类型
  for (const tokenType of codeHighlightTokenTypes) {
    vars[buildOhlVar(tokenType)] = codeHighlight[tokenType];
  }

  // 背景（语义上是代码高亮领域的一员，但不是某个具体 token）
  vars[buildOhlVar('background')] = codeHighlight.background;

  return vars;
}
