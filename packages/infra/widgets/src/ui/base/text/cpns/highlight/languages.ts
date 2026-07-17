/**
 * o-text 内置语法高亮 · 各语言匹配规则
 *
 * 设计原则：
 *   - 每条规则 pattern 必须能从位置 0 开始匹配（tokenize 用 match.index === 0 判断）
 *   - 规则顺序就是优先级：字符串 / 注释类先放，避免内部 token 被误识别
 *   - 关键字 / 内置函数等用 \b 边界
 *   - 函数调用通过前瞻 (?=\s*\() 捕获
 *
 * 内置语言：
 *   javascript / typescript / jsx / tsx / html / vue / css / scss
 *   json / bash / shell / markdown / yaml / sql / plain
 *
 * 注意：本文件只声明规则，不做匹配逻辑。
 */

import type { LanguageRule, HighlightLanguage } from './types'

// ────────────────────────────── 通用关键字集 ──────────────────────────────

const JS_KEYWORDS = [
  'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for',
  'while', 'do', 'switch', 'case', 'break', 'continue', 'default',
  'class', 'extends', 'new', 'this', 'super', 'import', 'export',
  'from', 'as', 'async', 'await', 'try', 'catch', 'finally', 'throw',
  'typeof', 'instanceof', 'in', 'of', 'yield', 'delete', 'void',
  'static', 'get', 'set',
].join('|')

const JS_BUILTINS = [
  'console', 'window', 'document', 'globalThis', 'process',
  'Array', 'Object', 'String', 'Number', 'Boolean', 'Math', 'Date',
  'JSON', 'Promise', 'Map', 'Set', 'WeakMap', 'WeakSet', 'Symbol',
  'Error', 'TypeError', 'RangeError', 'RegExp',
  'setTimeout', 'setInterval', 'clearTimeout', 'clearInterval',
  'parseInt', 'parseFloat', 'isNaN', 'isFinite',
  'require', 'module', 'exports', '__dirname', '__filename',
].join('|')

const TS_EXTRA_KEYWORDS = [
  'interface', 'type', 'enum', 'namespace', 'declare',
  'public', 'private', 'protected', 'readonly', 'abstract',
  'implements', 'satisfies', 'keyof', 'infer',
].join('|')

const TS_EXTRA_TYPES = [
  'any', 'unknown', 'never', 'string', 'number', 'boolean',
  'object', 'symbol', 'bigint', 'void', 'null', 'undefined',
  'true', 'false',
].join('|')

// 数字：hex / 二进制 / 八进制 / 浮点 / 科学计数 / BigInt 后缀
const NUMBER_RE =
  /\b(?:0x[0-9a-fA-F]+n?|0b[01]+n?|0o[0-7]+n?|\d+(?:\.\d+)?(?:[eE][+-]?\d+)?n?)\b/

// 函数调用 / 方法调用：name(   （含 $ _ 字母数字）
const FUNCTION_CALL_RE = /\b([A-Za-z_$][\w$]*)(?=\s*\()/

// 标识符（catch-all，命中后打 variable）
const IDENT_RE = /\b[A-Za-z_$][\w$]*\b/

// ────────────────────────────── JavaScript ──────────────────────────────

const javascript: LanguageRule[] = [
  { type: 'comment', pattern: /\/\/[^\n]*/ },
  { type: 'comment', pattern: /\/\*[\s\S]*?\*\// },
  { type: 'string', pattern: /'(?:\\.|[^'\\\n])*'/ },
  { type: 'string', pattern: /"(?:\\.|[^"\\\n])*"/ },
  { type: 'string', pattern: /`(?:\\.|[^`\\$]|\$\{(?:[^{}]|\{[^{}]*\})*\})*`/ },
  { type: 'regex', pattern: /\/(?:\\.|\[[^\]\n]*\]|[^\/\n\\])+\/[gimyus]*/ },
  { type: 'number', pattern: NUMBER_RE },
  { type: 'keyword', pattern: new RegExp(`\\b(?:${JS_KEYWORDS})\\b`) },
  { type: 'builtin', pattern: new RegExp(`\\b(?:${JS_BUILTINS})\\b`) },
  { type: 'boolean', pattern: /\b(?:true|false)\b/ },
  { type: 'null', pattern: /\b(?:null|undefined|NaN|Infinity)\b/ },
  { type: 'function', pattern: FUNCTION_CALL_RE },
  { type: 'variable', pattern: IDENT_RE },
]

// ────────────────────────────── TypeScript ──────────────────────────────

const typescript: LanguageRule[] = [
  { type: 'comment', pattern: /\/\/[^\n]*/ },
  { type: 'comment', pattern: /\/\*[\s\S]*?\*\// },
  { type: 'string', pattern: /'(?:\\.|[^'\\\n])*'/ },
  { type: 'string', pattern: /"(?:\\.|[^"\\\n])*"/ },
  { type: 'string', pattern: /`(?:\\.|[^`\\$]|\$\{(?:[^{}]|\{[^{}]*\})*\})*`/ },
  { type: 'number', pattern: NUMBER_RE },
  { type: 'keyword', pattern: new RegExp(`\\b(?:${JS_KEYWORDS}|${TS_EXTRA_KEYWORDS})\\b`) },
  { type: 'type', pattern: new RegExp(`\\b(?:${TS_EXTRA_TYPES})\\b`) },
  { type: 'builtin', pattern: new RegExp(`\\b(?:${JS_BUILTINS})\\b`) },
  { type: 'function', pattern: FUNCTION_CALL_RE },
  { type: 'variable', pattern: IDENT_RE },
]

// ────────────────────────────── JSX / TSX ──────────────────────────────

const JSX_TAG_OPEN = /<\/?[A-Za-z][\w.-]*/
const JSX_TAG_ATTR_NAME = /\b[A-Za-z_][\w-]*(?=\s*=)/
const JSX_STRING = /'(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"/

const jsx: LanguageRule[] = [
  { type: 'comment', pattern: /\/\*[\s\S]*?\*\// },
  { type: 'tag', pattern: JSX_TAG_OPEN },
  { type: 'attr', pattern: JSX_TAG_ATTR_NAME },
  { type: 'string', pattern: JSX_STRING },
  { type: 'punctuation', pattern: /[{}()<>;.,=]/ },
  { type: 'keyword', pattern: new RegExp(`\\b(?:${JS_KEYWORDS})\\b`) },
  { type: 'function', pattern: FUNCTION_CALL_RE },
  { type: 'variable', pattern: IDENT_RE },
]

const tsx: LanguageRule[] = [
  ...typescript,
  { type: 'tag', pattern: JSX_TAG_OPEN },
  { type: 'attr', pattern: JSX_TAG_ATTR_NAME },
]

// ────────────────────────────── HTML ──────────────────────────────

const html: LanguageRule[] = [
  { type: 'comment', pattern: /<!--[\s\S]*?-->/ },
  // CDATA 块（Vue SFC / XML 里常见）
  { type: 'string', pattern: /<!\[CDATA\[[\s\S]*?\]\]>/ },
  { type: 'tag', pattern: /<!DOCTYPE[^>]*>/i }, // doctype 借用 tag 类
  { type: 'string', pattern: JSX_STRING },
  { type: 'tag', pattern: JSX_TAG_OPEN },
  { type: 'attr', pattern: JSX_TAG_ATTR_NAME },
  { type: 'punctuation', pattern: /[<>=/]/ },
]

// ────────────────────────────── Vue SFC ──────────────────────────────

const vue: LanguageRule[] = [
  ...html,
  // Vue 插值表达式：{{ ... }}
  { type: 'string', pattern: /\{\{[^}]*\}\}/ },
  // Vue 指令：v-if / v-for / @click / :src 等
  { type: 'attr', pattern: /\b(?:v-[a-zA-Z-]+|@[a-zA-Z-]+|:[a-zA-Z-]+|#\[[a-zA-Z-]+\])/ },
  { type: 'punctuation', pattern: /[{}()\[\];,.]/ },
]

// ────────────────────────────── CSS / SCSS ──────────────────────────────

const CSS_AT_RULE = /@[a-zA-Z-]+/
const CSS_SELECTOR = /[.#][A-Za-z_-][\w-]*|::?[a-zA-Z-][\w-]*|[a-zA-Z][\w-]*(?=\s*\{)/

const css: LanguageRule[] = [
  { type: 'comment', pattern: /\/\*[\s\S]*?\*\// },
  { type: 'string', pattern: JSX_STRING },
  { type: 'keyword', pattern: CSS_AT_RULE },
  { type: 'property', pattern: /\b[a-zA-Z-]+(?=\s*:)/ },
  { type: 'selector', pattern: CSS_SELECTOR },
  // hex 颜色：#fff / #ffff / #ffffff / #ffffffff
  { type: 'number', pattern: /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b/ },
  { type: 'number', pattern: /-?\b\d+(?:\.\d+)?(?:px|em|rem|%|vh|vw|s|ms|deg|rgb|rgba)?\b/ },
  // !important 关键字
  { type: 'keyword', pattern: /!important\b/i },
  { type: 'punctuation', pattern: /[{}();:,.]/ },
]

const scss: LanguageRule[] = [
  ...css,
  { type: 'variable', pattern: /\$[A-Za-z_-][\w-]*/ },
  // SCSS 嵌套规则选择器
  { type: 'selector', pattern: /%[A-Za-z_-][\w-]*/ },
]

// ────────────────────────────── JSON ──────────────────────────────

const json: LanguageRule[] = [
  { type: 'string', pattern: /"(?:\\.|[^"\\\n])*"(?=\s*:)/ }, // 属性名
  { type: 'string', pattern: /"(?:\\.|[^"\\\n])*"/ },
  { type: 'number', pattern: /-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/ },
  { type: 'boolean', pattern: /\b(?:true|false)\b/ },
  { type: 'null', pattern: /\bnull\b/ },
  { type: 'punctuation', pattern: /[{}()\[\],:]/ },
]

// ────────────────────────────── Bash / Shell ──────────────────────────────

const bash: LanguageRule[] = [
  // heredoc：<<EOF ... EOF（表端 EOF 可被 EOT / 'EOF' / "EOF" 包围）
  { type: 'string', pattern: /<<-?\s*['"]?(\w+)['"]?\n[\s\S]*?(?:\n\1\b|\Z)/ },
  { type: 'comment', pattern: /#[^\n]*/ },
  { type: 'string', pattern: /'(?:\\.|[^'\\])*'/ },
  { type: 'string', pattern: /"(?:\\.|[^"\\])*"/ },
  { type: 'variable', pattern: /\$\{?[A-Za-z_][\w]*\}?/ },
  { type: 'keyword', pattern: /\b(?:if|then|else|elif|fi|for|in|do|done|while|case|esac|function|return|exit|export|source|alias|cd|echo|set|unset|local)\b/ },
  { type: 'builtin', pattern: /\b(?:npm|node|git|yarn|pnpm|docker|kubectl|cd|ls|mkdir|rm|cp|mv|cat|grep|sed|awk|curl|wget|ssh|scp|tar|zip|unzip|chmod|chown|sudo|apt|brew|systemctl)\b/ },
  { type: 'number', pattern: /\b\d+\b/ },
  { type: 'operator', pattern: /[|&;<>=]/ },
  { type: 'punctuation', pattern: /[(){}\[\].,]/ },
]

const shell = bash

// ────────────────────────────── Markdown ──────────────────────────────

const markdown: LanguageRule[] = [
  { type: 'comment', pattern: /<!--[\s\S]*?-->/ },
  // 围栏代码块（``` 或 ~~~,优先在 heading 之前,避免 # 被误认为 heading）
  { type: 'string', pattern: /^(`{3,}|~{3,})[^\n]*\n[\s\S]*?(?:\n\1(?=\n|$)|\Z)/m },
  { type: 'keyword', pattern: /^#{1,6}\s+/m },
  { type: 'keyword', pattern: /^>\s+/m },
  { type: 'keyword', pattern: /^[-*+]\s+/m },
  { type: 'keyword', pattern: /^\d+\.\s+/m },
  { type: 'keyword', pattern: /^---+/m },
  { type: 'string', pattern: /`[^`\n]+`/ },
  { type: 'string', pattern: /\[([^\]]+)\]\([^)]*\)/ },
  { type: 'string', pattern: /\*\*[^*\n]+\*\*/ },
  { type: 'string', pattern: /\*[^*\n]+\*/ },
  { type: 'variable', pattern: /!\[[^\]]*\]\([^)]*\)/ }, // 图片
]

// ────────────────────────────── YAML ──────────────────────────────

const yaml: LanguageRule[] = [
  { type: 'comment', pattern: /#[^\n]*/ },
  { type: 'string', pattern: /'(?:[^'\n])*'/ },
  { type: 'string', pattern: /"(?:\\.|[^"\\\n])*"/ },
  { type: 'attr', pattern: /^[ \t-]*[A-Za-z_][\w-]*(?=:)/m },
  { type: 'keyword', pattern: /^(?:---|true|false|null)\b/m },
  { type: 'number', pattern: /-?\b\d+(?:\.\d+)?\b/ },
  { type: 'punctuation', pattern: /[:{}\[\],&*|>!%@`]/ },
]

// ────────────────────────────── SQL ──────────────────────────────

const SQL_KEYWORDS = [
  'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'NOT', 'IN', 'AS', 'ON',
  'JOIN', 'INNER', 'LEFT', 'RIGHT', 'OUTER', 'FULL', 'CROSS',
  'GROUP', 'BY', 'ORDER', 'HAVING', 'LIMIT', 'OFFSET',
  'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE',
  'CREATE', 'TABLE', 'INDEX', 'VIEW', 'DROP', 'ALTER', 'ADD',
  'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES', 'UNIQUE', 'DEFAULT',
  'NULL', 'IS', 'LIKE', 'BETWEEN', 'EXISTS', 'CASE', 'WHEN', 'THEN',
  'ELSE', 'END', 'DISTINCT', 'UNION', 'ALL', 'WITH',
  'ASC', 'DESC',
].join('|')

const sql: LanguageRule[] = [
  { type: 'comment', pattern: /--[^\n]*/ },
  { type: 'comment', pattern: /\/\*[\s\S]*?\*\// },
  { type: 'string', pattern: /'(?:''|[^'\n])*'/ },
  { type: 'number', pattern: /\b\d+(?:\.\d+)?\b/ },
  { type: 'keyword', pattern: new RegExp(`\\b(?:${SQL_KEYWORDS})\\b`, 'i') },
  { type: 'function', pattern: /\b([A-Za-z_]\w*)(?=\s*\()/ },
  { type: 'punctuation', pattern: /[(),;.]/ },
]

// ────────────────────────────── Python ──────────────────────────────

const python: LanguageRule[] = [
  { type: 'comment', pattern: /#[^\n]*/ },
  { type: 'string', pattern: /"""[\s\S]*?"""|'''[\s\S]*?'''/ },
  { type: 'string', pattern: /[fFrRbBuU]?"(?:\\.|[^"\\\n])*"|[fFrRbBuU]?'(?:\\.|[^'\\\n])*'/ },
  { type: 'attr', pattern: /@[A-Za-z_][\w.]*/ }, // decorator
  { type: 'number', pattern: NUMBER_RE },
  { type: 'keyword', pattern: /\b(?:def|class|if|elif|else|for|while|return|import|from|as|try|except|finally|with|lambda|pass|break|continue|yield|global|nonlocal|assert|raise|async|await|del|is|in|not|and|or)\b/ },
  { type: 'builtin', pattern: /\b(?:True|False|None|print|len|range|list|dict|set|tuple|str|int|float|bool|type|isinstance|object|self|cls|open|input|super|staticmethod|classmethod|property|enumerate|zip|map|filter|sorted|reversed|abs|round|min|max|sum|hash|repr|iter|next|hasattr|getattr|setattr|delattr|callable|issubclass)\b/ },
  { type: 'function', pattern: FUNCTION_CALL_RE },
  { type: 'variable', pattern: IDENT_RE },
]

// ────────────────────────────── Java ──────────────────────────────

const java: LanguageRule[] = [
  { type: 'comment', pattern: /\/\/[^\n]*/ },
  { type: 'comment', pattern: /\/\*[\s\S]*?\*\// },
  { type: 'string', pattern: /"(?:\\.|[^"\\\n])*"/ },
  { type: 'string', pattern: /'(?:\\.|[^'\\])'/ }, // char literal
  { type: 'attr', pattern: /@[A-Za-z_][\w.]*/ }, // annotation
  { type: 'number', pattern: NUMBER_RE },
  { type: 'keyword', pattern: /\b(?:public|private|protected|static|final|abstract|synchronized|volatile|transient|native|class|interface|extends|implements|enum|record|sealed|package|import|new|this|super|return|if|else|for|while|do|switch|case|default|break|continue|try|catch|finally|throw|throws|instanceof|void|var|assert|strictfp)\b/ },
  { type: 'type', pattern: /\b(?:int|long|float|double|boolean|char|byte|short|String|Object|List|Map|Set|Collection|ArrayList|HashMap|HashSet|LinkedList|TreeMap|TreeSet|Optional|Stream|Integer|Long|Float|Double|Boolean|Byte|Short|Character|Number|Throwable|Exception|RuntimeException|Error)\b/ },
  { type: 'boolean', pattern: /\b(?:true|false)\b/ },
  { type: 'null', pattern: /\bnull\b/ },
  { type: 'function', pattern: FUNCTION_CALL_RE },
  { type: 'variable', pattern: IDENT_RE },
]

// ────────────────────────────── Go ──────────────────────────────

const go: LanguageRule[] = [
  { type: 'comment', pattern: /\/\/[^\n]*/ },
  { type: 'comment', pattern: /\/\*[\s\S]*?\*\// },
  { type: 'string', pattern: /"(?:\\.|[^"\\\n])*"/ },
  { type: 'string', pattern: /`(?:\\.|[^`\\])*`/ }, // raw string
  { type: 'number', pattern: NUMBER_RE },
  { type: 'keyword', pattern: /\b(?:package|import|func|var|const|type|struct|interface|map|chan|go|defer|select|case|default|switch|for|range|if|else|break|continue|return|goto|fallthrough)\b/ },
  { type: 'builtin', pattern: /\b(?:true|false|nil|iota|append|len|cap|make|new|copy|delete|panic|recover|print|println|int|int8|int16|int32|int64|uint|uint8|uint16|uint32|uint64|uintptr|float32|float64|complex64|complex128|byte|rune|string|bool|error|any|comparable)\b/ },
  { type: 'function', pattern: FUNCTION_CALL_RE },
  { type: 'variable', pattern: IDENT_RE },
]

// ────────────────────────────── Rust ──────────────────────────────

const rust: LanguageRule[] = [
  { type: 'comment', pattern: /\/\/[^\n]*/ },
  { type: 'comment', pattern: /\/\*[\s\S]*?\*\// },
  { type: 'string', pattern: /r#?"(?:[^"\\]|\\.)*"#/ }, // raw string with #
  { type: 'string', pattern: /r"(?:[^"\\]|\\.)*"/ },
  { type: 'string', pattern: /"(?:\\.|[^"\\\n])*"/ },
  { type: 'number', pattern: NUMBER_RE },
  { type: 'attr', pattern: /'[a-zA-Z_][\w]*/ }, // lifetime: 'a, 'static
  { type: 'keyword', pattern: /[a-z_][\w]*!/ }, // macro call:println!, vec!
  { type: 'keyword', pattern: /\b(?:fn|let|mut|const|static|pub|use|mod|crate|self|super|impl|trait|struct|enum|union|match|if|else|for|while|loop|return|break|continue|as|where|type|async|await|move|ref|dyn|box|unsafe|extern|in)\b/ },
  { type: 'builtin', pattern: /\b(?:true|false|Self|Option|Some|None|Result|Ok|Err|String|Vec|HashMap|HashSet|BTreeMap|BTreeSet|Box|Rc|Arc|Cell|RefCell|Mutex|RwLock|println|eprintln|format|vec|panic|unimplemented|unreachable|todo)\b/ },
  { type: 'function', pattern: FUNCTION_CALL_RE },
  { type: 'variable', pattern: IDENT_RE },
]

// ────────────────────────────── Ruby ──────────────────────────────

const ruby: LanguageRule[] = [
  { type: 'comment', pattern: /#[^\n]*/ },
  { type: 'comment', pattern: /=begin[\s\S]*?=end/ },
  // heredoc
  { type: 'string', pattern: /<<-?['"]?(\w+)['"]?\n[\s\S]*?(?:\n\1\b|\Z)/ },
  // symbol
  { type: 'string', pattern: /:(?:\\.|[^\\\n])+/ },
  { type: 'string', pattern: /"(?:\\.|[^"\\\n])*"/ },
  { type: 'string', pattern: /'(?:\\.|[^'\\])*'/ },
  { type: 'string', pattern: /%[qwiQWI]?\[[^\]]*\]|%[qwiQWI]?\{[^}]*\}|%[qwiQWI]?\([^)]*\)/ },
  { type: 'number', pattern: NUMBER_RE },
  { type: 'keyword', pattern: /\b(?:def|class|module|if|elsif|else|unless|while|until|for|in|do|end|return|break|next|redo|retry|yield|begin|rescue|ensure|raise|then|when|case|super|self|nil|true|false|and|or|not|alias|undef|BEGIN|END|require|include|extend|attr_accessor|attr_reader|attr_writer)\b/ },
  { type: 'variable', pattern: /@[a-zA-Z_]\w*|@@[a-zA-Z_]\w*/ }, // 实例/类变量
  { type: 'function', pattern: FUNCTION_CALL_RE },
  { type: 'variable', pattern: IDENT_RE },
]

// ────────────────────────────── PHP ──────────────────────────────

const php: LanguageRule[] = [
  { type: 'comment', pattern: /#[^\n]*/ },
  { type: 'comment', pattern: /\/\/[^\n]*/ },
  { type: 'comment', pattern: /\/\*[\s\S]*?\*\// },
  // heredoc / nowdoc
  { type: 'string', pattern: /<<<\s*['"]?(\w+)['"]?\n[\s\S]*?\n\1\b/ },
  { type: 'string', pattern: /"(?:\\.|[^"\\\n])*"/ },
  { type: 'string', pattern: /'(?:\\.|[^'\\])*'/ },
  { type: 'number', pattern: NUMBER_RE },
  { type: 'keyword', pattern: /\b(?:function|class|interface|trait|abstract|final|public|private|protected|static|const|var|echo|print|return|if|else|elseif|for|foreach|while|do|switch|case|break|continue|yield|try|catch|finally|throw|new|clone|instanceof|use|namespace|extends|implements|match|enum|readonly|require|require_once|include|include_once|declare|goto|list|array|isset|unset|empty|fn)\b/ },
  { type: 'builtin', pattern: /\b(?:true|false|null|__FILE__|__LINE__|__DIR__|__FUNCTION__|__CLASS__|__TRAIT__|__METHOD__|__NAMESPACE__|int|string|float|bool|array|object|mixed|void|never|stdClass|Exception|RuntimeException|TypeError|Throwable|Error|InvalidArgumentException)\b/ },
  { type: 'variable', pattern: /\$[a-zA-Z_][\w]*/ },
  { type: 'function', pattern: FUNCTION_CALL_RE },
]

// ────────────────────────────── Kotlin ──────────────────────────────

const kotlin: LanguageRule[] = [
  { type: 'comment', pattern: /\/\/[^\n]*/ },
  { type: 'comment', pattern: /\/\*[\s\S]*?\*\// },
  { type: 'string', pattern: /"""[\s\S]*?"""/ }, // triple-quote raw string
  { type: 'string', pattern: /"(?:\\.|[^"\\\n])*"/ },
  { type: 'string', pattern: /'(?:\\.|[^'\\])'/ }, // char literal
  { type: 'number', pattern: NUMBER_RE },
  { type: 'keyword', pattern: /\b(?:fun|val|var|class|interface|object|if|else|when|for|while|do|return|break|continue|in|is|as|typealias|import|package|public|private|protected|internal|open|final|abstract|override|data|sealed|enum|companion|lateinit|const|suspend|inline|noinline|crossinline|out|where|by|get|set|field|receiver|init|constructor|to|operator|infix|tailrec|external|actual|expect|super|this|null|true|false|try|catch|finally|throw)\b/ },
  { type: 'builtin', pattern: /\b(?:Int|Long|Float|Double|Boolean|String|Char|Byte|Short|Unit|Any|Nothing|Array|List|MutableList|Map|MutableMap|Set|MutableSet|Collection|Iterable|Pair|Triple|Sequence|Lazy|Result|Throwable|Exception|Error)\b/ },
  { type: 'function', pattern: FUNCTION_CALL_RE },
  { type: 'variable', pattern: IDENT_RE },
]

// ────────────────────────────── Swift ──────────────────────────────

const swift: LanguageRule[] = [
  { type: 'comment', pattern: /\/\/[^\n]*/ },
  { type: 'comment', pattern: /\/\*[\s\S]*?\*\// },
  { type: 'string', pattern: /"""[\s\S]*?"""/ },
  { type: 'string', pattern: /"(?:\\.|[^"\\\n])*"/ },
  { type: 'number', pattern: /\b\d[\d_]*(?:\.[\d_]+)?(?:[eE][+-]?\d+)?\b/ },
  { type: 'number', pattern: /\b0x[0-9a-fA-F_]+\b/ },
  { type: 'number', pattern: /\b0b[01_]+\b/ },
  { type: 'number', pattern: /\b0o[0-7_]+\b/ },
  { type: 'keyword', pattern: /\b(?:func|var|let|class|struct|enum|protocol|extension|public|private|fileprivate|internal|open|static|final|if|else|guard|switch|case|default|for|while|repeat|return|break|continue|fallthrough|where|as|is|in|do|try|catch|throw|throws|async|await|init|deinit|self|super|nil|true|false|import|typealias|associatedtype|inout|mutating|nonmutating|indirect|lazy|weak|unowned|convenience|required|override|subscript|willSet|didSet|get|set|dynamic|some|rethrows|any)\b/ },
  { type: 'function', pattern: FUNCTION_CALL_RE },
  { type: 'variable', pattern: IDENT_RE },
]

// ────────────────────────────── C ──────────────────────────────

const c: LanguageRule[] = [
  { type: 'comment', pattern: /\/\/[^\n]*/ },
  { type: 'comment', pattern: /\/\*[\s\S]*?\*\// },
  { type: 'string', pattern: /"(?:\\.|[^"\\\n])*"/ },
  { type: 'string', pattern: /'(?:\\.|[^'\\])'/ }, // char literal
  { type: 'keyword', pattern: /#[a-zA-Z_][\w]*/ }, // 预处理器
  { type: 'number', pattern: NUMBER_RE },
  { type: 'keyword', pattern: /\b(?:int|char|float|double|void|long|short|signed|unsigned|struct|union|enum|typedef|sizeof|return|if|else|for|while|do|break|continue|switch|case|default|goto|const|volatile|register|auto|extern|static|inline|restrict|_Bool|_Complex|_Imaginary)\b/ },
  { type: 'function', pattern: FUNCTION_CALL_RE },
  { type: 'type', pattern: /\b[A-Z][A-Za-z0-9_]*\b/ }, // 大写开头一般是类型名（typedef）
  { type: 'variable', pattern: IDENT_RE },
]

// ────────────────────────────── C++ ──────────────────────────────

const CPP_EXTRA_KEYWORDS = /\b(?:class|public|private|protected|namespace|using|template|typename|virtual|override|final|nullptr|true|false|noexcept|constexpr|decltype|explicit|mutable|friend|operator|new|delete|this|try|catch|throw|wchar_t|char8_t|char16_t|char32_t|bool|int|long|short|signed|unsigned|float|double|void|size_t|ptrdiff_t|std|nullptr_t|concept|requires|co_await|co_return|co_yield|export|module|import)\b/

const cpp: LanguageRule[] = [
  ...c,
  // C++ raw string:R"(...)"
  { type: 'string', pattern: /R"([^(]*)\([\s\S]*?\)\1"/ },
  { type: 'keyword', pattern: CPP_EXTRA_KEYWORDS },
]

// ────────────────────────────── Plain（无高亮） ──────────────────────────────

const plain: LanguageRule[] = []

// ────────────────────────────── 导出 ──────────────────────────────

export const languages: Record<HighlightLanguage, LanguageRule[]> = {
  javascript,
  typescript,
  jsx,
  tsx,
  html,
  vue,
  css,
  scss,
  json,
  bash,
  shell,
  markdown,
  yaml,
  sql,
  // 主流后端语言
  python,
  java,
  go,
  rust,
  // 主流脚本 / Web 语言
  ruby,
  php,
  // 移动 / 系统语言
  kotlin,
  swift,
  // C 系
  c,
  cpp,
  plain,
}

/** 是否为内置支持的语言 */
export function isKnownLanguage(lang: string): lang is HighlightLanguage {
  return Object.prototype.hasOwnProperty.call(languages, lang)
}
