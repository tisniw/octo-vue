const WORD_SPLIT_RE = /[\s-_]+|(?=[A-Z])/

function words(str: string): string[] {
  return str
    .replace(/[A-Z]+/g, (m) => ` ${m.toLowerCase()}`)
    .trim()
    .split(/[\s-_]+/)
    .filter(Boolean)
}

/** 短横线 → 驼峰 */
export function camelCase(str: string): string {
  return words(str)
    .map((w, i) => (i === 0 ? w.toLowerCase() : upperFirst(w.toLowerCase())))
    .join('')
}

/** 任意命名 → 短横线 */
export function kebabCase(str: string): string {
  return words(str).map((w) => w.toLowerCase()).join('-')
}

/** 任意命名 → 帕斯卡 */
export function pascalCase(str: string): string {
  return words(str)
    .map((w) => upperFirst(w.toLowerCase()))
    .join('')
}

/** 任意命名 → 蛇形 */
export function snakeCase(str: string): string {
  return words(str).map((w) => w.toLowerCase()).join('_')
}

/** 首字母大写 */
export function upperFirst(str: string): string {
  if (!str) return str
  return str[0].toUpperCase() + str.slice(1)
}

/** 首字母小写 */
export function lowerFirst(str: string): string {
  if (!str) return str
  return str[0].toLowerCase() + str.slice(1)
}

/** 全大写 */
export function upperCase(str: string): string {
  return str.toUpperCase()
}

/** 全小写 */
export function lowerCase(str: string): string {
  return str.toLowerCase()
}

/** 截断 + 省略号 */
export function truncate(str: string, maxLength: number, suffix = '...'): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength - suffix.length) + suffix
}

/** 模板字符串插值（支持 {{key}} 语法） */
export function template(
  str: string,
  data: Record<string, unknown>
): string {
  return str.replace(/\{\{(\w+)\}\}/g, (_, key) => String(data[key] ?? ''))
}

/** 去除两端空白（含全角空格） */
export function trim(str: string): string {
  return str.replace(/^[\s\u3000]+|[\s\u3000]+$/g, '')
}

/** 反转字符串 */
export function reverse(str: string): string {
  return Array.from(str).reverse().join('')
}

/** 重复 N 次 */
export function repeat(str: string, count: number): string {
  if (count <= 0) return ''
  return str.repeat(count)
}

/** 字符串前置填充 */
export function padStart(str: string, length: number, fill = ' '): string {
  return str.padStart(length, fill)
}

/** 字符串后置填充 */
export function padEnd(str: string, length: number, fill = ' '): string {
  return str.padEnd(length, fill)
}

const RANDOM_CHARSETS: Record<string, string> = {
  alphanumeric: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
  alpha: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  numeric: '0123456789',
  hex: '0123456789abcdef',
}

/** 生成随机字符串 */
export function randomString(length = 8, charset: keyof typeof RANDOM_CHARSETS | string = 'alphanumeric'): string {
  const chars = RANDOM_CHARSETS[charset] ?? charset
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}
