// 主题 CSS 变量派生器 对外入口
// 一站式 generateColorVars 合并 OC OS OR OSR OHL 五套契约
// 分层 generateXxxVars 选择性使用
//
// 命名空间总览：
//   --oc-*   基础原色(Object Color)
//   --os-*   状态(Object State)
//   --or-*   语义(Object Reference)
//   --osr-*  状态+语义(Object State + Reference)
//   --ohl-*  代码高亮(Object Highlight)

import type { SemanticColor, ThemeColorToken } from '../token/color';
import { defaultSemanticColor } from '../token/color';

import { generateOcVars } from './oc';
import { generateOrVars } from './or';
import { generateOsVars } from './os';
import { generateOsrVars } from './osr';
import { generateOhlVars } from './ohl';

// 一站式：合并所有契约
export function generateColorVars(
  token: ThemeColorToken,
  semantic: SemanticColor = defaultSemanticColor,
): Record<string, string> {
  return {
    ...generateOcVars(token),
    ...generateOsVars(token),
    ...generateOrVars(semantic),
    ...generateOsrVars(semantic),
    ...generateOhlVars(token.codeHighlight),
  };
}

// 分层导出
export { generateOcVars } from './oc';
export { generateOsVars } from './os';
export { generateOrVars } from './or';
export { generateOsrVars } from './osr';
export { generateOhlVars } from './ohl';