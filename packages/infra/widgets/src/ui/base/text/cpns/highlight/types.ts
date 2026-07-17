/**
 * o-text 内置语法高亮 · 类型定义
 *
 * 零依赖、纯 TS 实现。设计原则：
 *   - token 类型全部用单一字符串字面量（'keyword' / 'string' ...），保持扁平
 *   - 不区分 token 优先级，匹配顺序由 languages.ts 里的规则数组顺序决定
 *   - 每个 token 对应一个 SCSS 类（o-text__hl-{type}），颜色完全交给主题
 *
 * 注意：本模块不依赖任何外部库（无 hljs / prism / shiki），不输出运行时副作用。
 */

/** 内置支持的语言清单 */
export type HighlightLanguage =
  | 'javascript'
  | 'typescript'
  | 'jsx'
  | 'tsx'
  | 'html'
  | 'vue'
  | 'css'
  | 'scss'
  | 'json'
  | 'bash'
  | 'shell'
  | 'markdown'
  | 'yaml'
  | 'sql'
  // 主流后端语言
  | 'python'
  | 'java'
  | 'go'
  | 'rust'
  // 主流脚本 / Web 语言
  | 'ruby'
  | 'php'
  // 主流移动端 / 系统语言
  | 'kotlin'
  | 'swift'
  // C 系
  | 'c'
  | 'cpp'
  | 'plain'

/**
 * token 类型（决定渲染时打哪个 SCSS 类）
 * - keyword / string / number / comment / regex / function / variable / type
 * - tag / attr / operator / punctuation / property / builtin / boolean / null
 * - selector / plain
 */
export type HighlightTokenType =
  | 'keyword'
  | 'string'
  | 'number'
  | 'comment'
  | 'regex'
  | 'function'
  | 'variable'
  | 'type'
  | 'tag'
  | 'attr'
  | 'operator'
  | 'punctuation'
  | 'property'
  | 'builtin'
  | 'boolean'
  | 'null'
  | 'selector'
  | 'plain'

/** 单个 token */
export interface HighlightToken {
  type: HighlightTokenType
  value: string
}

/** 单条匹配规则：正则命中后命中段打上对应 type 类名 */
export interface LanguageRule {
  type: HighlightTokenType
  pattern: RegExp
}

/**
 * 高亮配置（传给 <o-text pre :highlight="{...}">）
 *
 * - 传 boolean true 等价于 { language: 'javascript' }
 * - 传 string 等价于 { language: string as HighlightLanguage }
 *   （沿用 codeLanguage prop 的简写语义，避免重复声明两个 prop）
 *
 * 设计说明：组件层不持有任何主题状态。
 * token 配色完全由 theme 主题组件包按当前激活视觉×主题注入 --ohl-* 变量。
 * 想要覆盖配色，只需要在局部元素上覆写 --ohl-* 变量即可。
 */
export interface HighlightConfig {
  /** 目标语言；'plain' 表示不高亮（只走 escape） */
  language?: HighlightLanguage
}

/**
 * prop 接收的"是否启用"判定
 *
 *   undefined        → 不启用
 *   true             → 启用（默认 javascript）
 *   false            → 显式关闭
 *   HighlightConfig  → 启用并应用配置
 *   string           → 启用，并把这个字符串当作 language（与 codeLanguage 语义一致）
 */
export type HighlightProp = boolean | HighlightConfig | HighlightLanguage | undefined
