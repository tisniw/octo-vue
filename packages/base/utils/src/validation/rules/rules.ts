import { isEmpty } from '../../function/object/object.js'

/** 单个校验规则 */
export type Validator<T = unknown> = (
  value: T,
  ...args: any[]
) => boolean | string

function isFilled(value: unknown): boolean {
  if (value == null) return false
  if (typeof value === 'string') return value.trim() !== ''
  if (Array.isArray(value)) return value.length > 0
  return !isEmpty(value as any)
}

export const builtInRules = {
  /** 必填（非空字符串 / 非空数组 / 非 null/undefined） */
  required: (value: unknown) => isFilled(value),

  /** 字符串最小长度 */
  minLength: (value: string, min: number) =>
    typeof value === 'string' && value.length >= min,

  /** 字符串最大长度 */
  maxLength: (value: string, max: number) =>
    typeof value === 'string' && value.length <= max,

  /** 数值最小值 */
  min: (value: number, min: number) =>
    typeof value === 'number' && value >= min,

  /** 数值最大值 */
  max: (value: number, max: number) =>
    typeof value === 'number' && value <= max,

  /** 数值范围 */
  between: (value: number, min: number, max: number) =>
    typeof value === 'number' && value >= min && value <= max,

  /** 邮箱 */
  email: (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),

  /** 手机号（中国大陆） */
  phone: (value: string) => /^1[3-9]\d{9}$/.test(value),

  /** 身份证号（中国大陆） */
  idCard: (value: string) =>
    /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(value),

  /** URL */
  url: (value: string) => {
    try {
      new URL(value)
      return true
    } catch {
      return false
    }
  },

  /** IPv4 */
  ipv4: (value: string) =>
    /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d?\d)$/.test(value),

  /** IPv6 */
  ipv6: (value: string) =>
    /^([\da-fA-F]{1,4}:){7}[\da-fA-F]{1,4}$/.test(value) ||
    /^(([\da-fA-F]{1,4}:){0,6}[\da-fA-F]{1,4})?::(([\da-fA-F]{1,4}:){0,6}[\da-fA-F]{1,4})?$/.test(value),

  /** 正则匹配 */
  pattern: (value: string, regex: RegExp | string) =>
    new RegExp(regex).test(value),

  /** 数字字符串 */
  numeric: (value: string) => /^\d+$/.test(value),

  /** 整数 */
  integer: (value: number) =>
    typeof value === 'number' && Number.isInteger(value),

  /** 字母 */
  alpha: (value: string) => /^[a-zA-Z]+$/.test(value),

  /** 字母数字 */
  alphanumeric: (value: string) => /^[a-zA-Z0-9]+$/.test(value),

  /** 自定义校验 */
  custom: (value: unknown, validator: (value: unknown) => boolean) =>
    validator(value),

  /** 多选全部满足（AND） */
  allOf: (value: unknown, validators: Validator[]) =>
    validators.every((v) => v(value) === true),

  /** 多选满足其一（OR） */
  anyOf: (value: unknown, validators: Validator[]) =>
    validators.some((v) => v(value) === true),

  /** 多选全部不满足（NOT） */
  not: (value: unknown, validator: Validator) =>
    validator(value) !== true,
} as const

export type BuiltInRuleName = keyof typeof builtInRules

export type RuleArgs = {
  required: []
  minLength: [number]
  maxLength: [number]
  min: [number]
  max: [number]
  between: [number, number]
  email: []
  phone: []
  idCard: []
  url: []
  ipv4: []
  ipv6: []
  pattern: [RegExp | string]
  numeric: []
  integer: []
  alpha: []
  alphanumeric: []
  custom: [(value: unknown) => boolean]
  allOf: [Validator[]]
  anyOf: [Validator[]]
  not: [Validator]
}

const customRules: Record<string, Validator> = {}

/** 注册自定义规则（全局生效） */
export function defineRule<K extends string>(name: K, validator: Validator): void {
  customRules[name] = validator
}

/** 批量注册 */
export function defineRules(rules: Record<string, Validator>): void {
  Object.assign(customRules, rules)
}

/** 获取规则（包含内置 + 自定义） */
export function getRule(name: string): Validator | undefined {
  return (builtInRules as Record<string, Validator>)[name] ?? customRules[name]
}

/** 列出所有已注册规则 */
export function listRules(): string[] {
  return [...Object.keys(builtInRules), ...Object.keys(customRules)]
}
