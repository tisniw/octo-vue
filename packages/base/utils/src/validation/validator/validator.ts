import { BuiltInRuleName, getRule, Validator } from '../rules/rules.js'

export type FieldRule =
  | BuiltInRuleName
  | {
      rule: BuiltInRuleName
      args?: any[]
      message?: string
    }
  | {
      rule: string
      args?: any[]
      message?: string
    }
  | Validator

export type Rules<T = Record<string, unknown>> = {
  [K in keyof T]?: FieldRule | FieldRule[]
}

export interface ValidationResult {
  valid: boolean
  errors: Record<string, string[]>
  warnings?: Record<string, string[]>
}

export class ValidationError extends Error {
  readonly errors: Record<string, string[]>
  readonly warnings?: Record<string, string[]>
  constructor(
    message: string,
    errors: Record<string, string[]>,
    options?: {
      warnings?: Record<string, string[]>
      cause?: unknown
    }
  ) {
    super(message, options)
    this.name = 'ValidationError'
    this.errors = errors
    this.warnings = options?.warnings
  }

  /** 获取字段第一个错误 */
  firstError(field: string): string | undefined {
    return this.errors[field]?.[0]
  }

  /** 是否包含字段错误 */
  hasError(field: string): boolean {
    return !!this.errors[field]?.length
  }

  /** 所有错误平铺 */
  flat(): string[] {
    return Object.values(this.errors).flat()
  }
}

function normalizeRule(rule: FieldRule): {
  validator: Validator
  args: any[]
  message?: string
} {
  if (typeof rule === 'function') {
    return { validator: rule, args: [] }
  }
  if (typeof rule === 'string') {
    const validator = getRule(rule)
    if (!validator) {
      throw new Error(`Unknown validation rule: ${rule}`)
    }
    return { validator, args: [] }
  }
  const validator = getRule(rule.rule)
  if (!validator) {
    throw new Error(`Unknown validation rule: ${rule.rule}`)
  }
  return { validator, args: rule.args ?? [], message: rule.message }
}

/** 单个字段校验 */
export function validateField(
  value: unknown,
  rule: FieldRule | FieldRule[]
): string[] {
  const rules = Array.isArray(rule) ? rule : [rule]
  const errors: string[] = []
  for (const r of rules) {
    const { validator, args, message } = normalizeRule(r)
    const result = validator(value, ...args)
    if (result !== true) {
      errors.push(typeof result === 'string' ? result : (message ?? 'Validation failed'))
    }
  }
  return errors
}

/** 整体校验 */
export function validate<T extends Record<string, unknown>>(
  data: T,
  rules: Rules<T>
): ValidationResult {
  const result: ValidationResult = { valid: true, errors: {} }
  for (const [field, fieldRules] of Object.entries(rules)) {
    if (fieldRules === undefined) continue
    const errors = validateField(data[field], fieldRules)
    if (errors.length) {
      result.valid = false
      result.errors[field] = errors
    }
  }
  return result
}

/** 校验并抛错 */
export function validateOrThrow<T extends Record<string, unknown>>(
  data: T,
  rules: Rules<T>
): asserts data is T {
  const result = validate(data, rules)
  if (!result.valid) {
    throw new ValidationError('Validation failed', result.errors)
  }
}

export type AggregateStrategy = 'first' | 'all'

export interface ValidateOptions {
  aggregate?: AggregateStrategy
  stopOn?: number
  warningRules?: (rule: FieldRule) => boolean
}

/** 带选项的校验 */
export function validateAdvanced<T extends Record<string, unknown>>(
  data: T,
  rules: Rules<T>,
  options: ValidateOptions = {}
): ValidationResult {
  const { aggregate = 'all', stopOn } = options
  const result: ValidationResult = { valid: true, errors: {} }
  let totalErrors = 0

  for (const [field, fieldRules] of Object.entries(rules)) {
    if (fieldRules === undefined) continue
    const rulesArray = Array.isArray(fieldRules) ? fieldRules : [fieldRules]
    const errors: string[] = []
    for (const r of rulesArray) {
      const { validator, args, message } = normalizeRule(r)
      const res = validator(data[field], ...args)
      if (res !== true) {
        errors.push(typeof res === 'string' ? res : (message ?? 'Validation failed'))
        if (aggregate === 'first') break
      }
    }
    if (errors.length) {
      result.valid = false
      result.errors[field] = aggregate === 'first' ? errors.slice(0, 1) : errors
      totalErrors += errors.length
      if (stopOn !== undefined && totalErrors >= stopOn) break
    }
  }

  return result
}

export interface FieldDependency {
  when: string
  condition: (data: any) => boolean
  rules: FieldRule | FieldRule[]
}

/** 整体校验（支持字段依赖） */
export function validateWithDependencies<T extends Record<string, unknown>>(
  data: T,
  rules: Rules<T>,
  dependencies: FieldDependency[] = []
): ValidationResult {
  const result = validate(data, rules)
  for (const dep of dependencies) {
    if (dep.condition(data)) {
      const errors = validateField(data[dep.when], dep.rules)
      if (errors.length) {
        result.valid = false
        result.errors[dep.when] = [...(result.errors[dep.when] ?? []), ...errors]
      }
    }
  }
  return result
}
