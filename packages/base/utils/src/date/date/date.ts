export type DateInput = Date | string | number

export type DateUnit =
  | 'year' | 'quarter' | 'month' | 'week'
  | 'day' | 'hour' | 'minute' | 'second' | 'millisecond'

export class InvalidDateError extends Error {
  constructor(input: unknown) {
    super(`Invalid date: ${input}`)
    this.name = 'InvalidDateError'
  }
}

/** 将任意输入归一为 Date（失败返回 undefined） */
export function toDate(input: DateInput): Date | undefined {
  if (input instanceof Date) {
    return Number.isNaN(input.getTime()) ? undefined : new Date(input)
  }
  if (typeof input === 'number') {
    return new Date(input)
  }
  const d = new Date(input)
  return Number.isNaN(d.getTime()) ? undefined : d
}

/** 将任意输入归一为 Date（失败抛 InvalidDateError） */
export function toDateStrict(input: DateInput): Date {
  const d = toDate(input)
  if (!d) throw new InvalidDateError(input)
  return d
}

const formatterCache = new Map<string, Intl.DateTimeFormat>()

function cacheKey(locale: string | undefined, options: Intl.DateTimeFormatOptions): string {
  return `${locale ?? ''}:${JSON.stringify(options)}`
}

/**
 * 取 Intl.DateTimeFormat（懒加载 + 缓存）。
 */
export function getFormatter(
  locale?: string,
  options: Intl.DateTimeFormatOptions = {}
): Intl.DateTimeFormat {
  const key = cacheKey(locale, options)
  if (!formatterCache.has(key)) {
    formatterCache.set(key, new Intl.DateTimeFormat(locale, options))
  }
  return formatterCache.get(key)!
}

/** 标准日期格式常量（字符串模板） */
export const DateFormat = {
  DATE: 'YYYY-MM-DD',
  TIME: 'HH:mm:ss',
  DATETIME: 'YYYY-MM-DD HH:mm:ss',
  DATETIME_MS: 'YYYY-MM-DD HH:mm:ss.SSS',
  ISO: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
  COMPACT_DATE: 'YYYYMMDD',
  COMPACT_DATETIME: 'YYYYMMDDHHmmss',
} as const

/**
 * 将 DateFormat 模板映射为 Intl.DateTimeFormatOptions。
 * 公开辅助函数，供需要自定义 format 的高级用户调用。
 */
export function resolveIntlOptions(pattern: string): Intl.DateTimeFormatOptions {
  const options: Intl.DateTimeFormatOptions = {}
  const parts: Intl.DateTimeFormatPartTypes[] = []
  if (pattern.includes('YYYY')) {
    options.year = 'numeric'
    parts.push('year')
  }
  if (pattern.includes('MM')) {
    options.month = '2-digit'
    parts.push('month')
  }
  if (pattern.includes('DD')) {
    options.day = '2-digit'
    parts.push('day')
  }
  if (pattern.includes('HH')) {
    options.hour = '2-digit'
    options.hour12 = false
    parts.push('hour')
  }
  if (pattern.includes('mm')) {
    options.minute = '2-digit'
    parts.push('minute')
  }
  if (pattern.includes('ss')) {
    options.second = '2-digit'
    parts.push('second')
  }
  if (pattern.includes('SSS')) {
    options.fractionalSecondDigits = 3
    parts.push('fractionalSecond')
  }
  return options
}

/**
 * 格式化日期。
 * pattern 支持：YYYY / MM / DD / HH / mm / ss / SSS / ISO 等。
 */
export function formatDate(
  date: DateInput,
  pattern: string = DateFormat.DATETIME,
  locale?: string
): string {
  const d = toDateStrict(date)

  if (pattern === DateFormat.ISO) {
    return d.toISOString()
  }

  const pad = (n: number, len: number) => String(n).padStart(len, '0')
  const tokens: Record<string, string | number> = {
    YYYY: d.getFullYear(),
    MM: pad(d.getMonth() + 1, 2),
    DD: pad(d.getDate(), 2),
    HH: pad(d.getHours(), 2),
    mm: pad(d.getMinutes(), 2),
    ss: pad(d.getSeconds(), 2),
    SSS: pad(d.getMilliseconds(), 3),
  }

  return pattern.replace(/YYYY|MM|DD|HH|mm|ss|SSS/g, (match) => String(tokens[match]))
}

/** 解析日期字符串（返回 Date，失败 undefined） */
export function parseDate(
  date: string,
  pattern: string = DateFormat.DATETIME,
  locale?: string
): Date | undefined {
  if (pattern === DateFormat.ISO) return parseISO(date)

  const now = new Date()
  const values: Record<string, number> = {
    year: now.getFullYear(),
    month: 1,
    day: 1,
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0,
  }

  const tokenMap: Record<string, keyof typeof values> = {
    YYYY: 'year',
    MM: 'month',
    DD: 'day',
    HH: 'hour',
    mm: 'minute',
    ss: 'second',
    SSS: 'millisecond',
  }

  const regex = pattern.replace(/YYYY|MM|DD|HH|mm|ss|SSS/g, (token) => {
    const lengths: Record<string, string> = {
      YYYY: '\\d{4}',
      MM: '\\d{2}',
      DD: '\\d{2}',
      HH: '\\d{2}',
      mm: '\\d{2}',
      ss: '\\d{2}',
      SSS: '\\d{3}',
    }
    return `(${lengths[token]})`
  })

  const match = date.match(new RegExp(`^${regex}$`))
  if (!match) return undefined

  const tokenList = pattern.match(/YYYY|MM|DD|HH|mm|ss|SSS/g) ?? []
  let groupIndex = 1
  for (const token of tokenList) {
    values[tokenMap[token]] = Number.parseInt(match[groupIndex], 10)
    groupIndex++
  }

  const parsed = new Date(
    values.year,
    values.month - 1,
    values.day,
    values.hour,
    values.minute,
    values.second,
    values.millisecond
  )

  return Number.isNaN(parsed.getTime()) ? undefined : parsed
}

/** 解析失败抛错（InvalidDateError） */
export function parseDateStrict(
  date: string,
  pattern?: string,
  locale?: string
): Date {
  const d = parseDate(date, pattern, locale)
  if (!d) throw new InvalidDateError(date)
  return d
}

/** ISO 8601 字符串解析 */
export function parseISO(iso: string): Date {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) throw new InvalidDateError(iso)
  return d
}

/** ISO 8601 序列化 */
export function toISO(date: DateInput): string {
  return toDateStrict(date).toISOString()
}

/** RFC 2822 字符串解析 */
export function parseRFC2822(str: string): Date {
  const d = new Date(str)
  if (Number.isNaN(d.getTime())) throw new InvalidDateError(str)
  return d
}

/** RFC 2822 序列化 */
export function toRFC2822(date: DateInput): string {
  return toDateStrict(date).toUTCString()
}

/**
 * Unix 时间戳 → Date
 * @param s 秒（ms=false）或毫秒（ms=true）
 * @param ms 默认 false
 */
export function fromUnix(s: number, ms = false): Date {
  return new Date(ms ? s : s * 1000)
}

/**
 * Date → Unix 时间戳
 * @param ms 默认 false 返回秒
 */
export function toUnix(date: DateInput = new Date(), ms = false): number {
  const ts = toDateStrict(date).getTime()
  return ms ? ts : Math.floor(ts / 1000)
}

/** 智能格式化：今天 HH:mm / 昨天 / 本年 MM-DD / 跨年 YYYY-MM-DD */
export function formatDateSmart(date: DateInput, locale?: string): string {
  const d = toDateStrict(date)
  if (isToday(d)) return formatDate(d, 'HH:mm', locale)
  if (isYesterday(d)) return locale?.startsWith('zh') ? '昨天' : 'Yesterday'
  if (d.getFullYear() === new Date().getFullYear()) return formatDate(d, 'MM-DD', locale)
  return formatDate(d, 'YYYY-MM-DD', locale)
}

function normalize(date: DateInput): Date {
  return toDateStrict(date)
}

function add(date: DateInput, value: number, unit: DateUnit): Date {
  const d = new Date(normalize(date))
  switch (unit) {
    case 'year':
      d.setFullYear(d.getFullYear() + value)
      break
    case 'quarter':
      d.setMonth(d.getMonth() + value * 3)
      break
    case 'month':
      d.setMonth(d.getMonth() + value)
      break
    case 'week':
      d.setDate(d.getDate() + value * 7)
      break
    case 'day':
      d.setDate(d.getDate() + value)
      break
    case 'hour':
      d.setHours(d.getHours() + value)
      break
    case 'minute':
      d.setMinutes(d.getMinutes() + value)
      break
    case 'second':
      d.setSeconds(d.getSeconds() + value)
      break
    case 'millisecond':
      d.setMilliseconds(d.getMilliseconds() + value)
      break
  }
  return d
}

/** 加 N 年 */
export function addYears(date: DateInput, years: number): Date {
  return add(date, years, 'year')
}

/** 加 N 月 */
export function addMonths(date: DateInput, months: number): Date {
  return add(date, months, 'month')
}

/** 加 N 天 */
export function addDays(date: DateInput, days: number): Date {
  return add(date, days, 'day')
}

/** 加 N 小时 */
export function addHours(date: DateInput, hours: number): Date {
  return add(date, hours, 'hour')
}

/** 加 N 分 */
export function addMinutes(date: DateInput, minutes: number): Date {
  return add(date, minutes, 'minute')
}

/** 加 N 秒 */
export function addSeconds(date: DateInput, seconds: number): Date {
  return add(date, seconds, 'second')
}

/** 加 N 毫秒 */
export function addMilliseconds(date: DateInput, ms: number): Date {
  return add(date, ms, 'millisecond')
}

/** 减 N 年 */
export function subYears(date: DateInput, years: number): Date {
  return add(date, -years, 'year')
}

/** 减 N 月 */
export function subMonths(date: DateInput, months: number): Date {
  return add(date, -months, 'month')
}

/** 减 N 天 */
export function subDays(date: DateInput, days: number): Date {
  return add(date, -days, 'day')
}

/** 减 N 小时 */
export function subHours(date: DateInput, hours: number): Date {
  return add(date, -hours, 'hour')
}

/** 减 N 分 */
export function subMinutes(date: DateInput, minutes: number): Date {
  return add(date, -minutes, 'minute')
}

/** 减 N 秒 */
export function subSeconds(date: DateInput, seconds: number): Date {
  return add(date, -seconds, 'second')
}

/** 减 N 单位（通用版本） */
export function subtract(date: DateInput, value: number, unit: DateUnit): Date {
  return add(date, -value, unit)
}

function unitToMs(unit: DateUnit): number {
  switch (unit) {
    case 'millisecond':
      return 1
    case 'second':
      return 1000
    case 'minute':
      return 60 * 1000
    case 'hour':
      return 60 * 60 * 1000
    case 'day':
    case 'week':
      return 24 * 60 * 60 * 1000
    case 'month':
    case 'quarter':
    case 'year':
      return 30 * 24 * 60 * 60 * 1000
  }
}

/** 两个日期相差的整数单位数（向下取整） */
export function dateDiff(
  date1: DateInput,
  date2: DateInput,
  unit: DateUnit = 'day'
): number {
  const a = normalize(date1)
  const b = normalize(date2)
  if (unit === 'week') return Math.floor((a.getTime() - b.getTime()) / (7 * unitToMs('day')))
  if (unit === 'quarter') return Math.floor(dateDiff(date1, date2, 'month') / 3)
  if (unit === 'year') return a.getFullYear() - b.getFullYear()
  if (unit === 'month') return (a.getFullYear() - b.getFullYear()) * 12 + (a.getMonth() - b.getMonth())
  return Math.floor((a.getTime() - b.getTime()) / unitToMs(unit))
}

/** 相差完整单位数（向下取整） */
export function diffFloor(
  date1: DateInput,
  date2: DateInput,
  unit: DateUnit
): number {
  return dateDiff(date1, date2, unit)
}

/** 相差精确值（浮点毫秒 / 秒） */
export function diffPrecise(
  date1: DateInput,
  date2: DateInput,
  unit: 'millisecond' | 'second'
): number {
  const diff = normalize(date1).getTime() - normalize(date2).getTime()
  return unit === 'second' ? diff / 1000 : diff
}

/** 相差天数（浮点，可负） */
export function dateDiffInDays(date1: DateInput, date2: DateInput): number {
  return diffPrecise(date1, date2, 'second') / 86400
}

/** 相差小时数（浮点，可负） */
export function dateDiffInHours(date1: DateInput, date2: DateInput): number {
  return diffPrecise(date1, date2, 'second') / 3600
}

/** 相差分钟数（浮点，可负） */
export function dateDiffInMinutes(date1: DateInput, date2: DateInput): number {
  return diffPrecise(date1, date2, 'second') / 60
}

/** 是否为今天 */
export function isToday(date: DateInput): boolean {
  return isSameDay(date, new Date())
}

/** 是否为昨天 */
export function isYesterday(date: DateInput): boolean {
  return isSameDay(date, subDays(new Date(), 1))
}

/** 是否为明天 */
export function isTomorrow(date: DateInput): boolean {
  return isSameDay(date, addDays(new Date(), 1))
}

/** 是否闰年 */
export function isLeapYear(date: DateInput | number): boolean {
  const year = typeof date === 'number' ? date : normalize(date).getFullYear()
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

/** 指定年总天数 */
export function daysInYear(date: DateInput | number): number {
  const year = typeof date === 'number' ? date : normalize(date).getFullYear()
  return isLeapYear(year) ? 366 : 365
}

/** 指定年月总天数 */
export function daysInMonth(date: DateInput | number, month?: number): number {
  const d = typeof date === 'number' ? new Date(date, (month ?? 1) - 1, 1) : normalize(date)
  const y = d.getFullYear()
  const m = month ?? d.getMonth() + 1
  return new Date(y, m, 0).getDate()
}

/** 是否周末 */
export function isWeekend(date: DateInput): boolean {
  const day = normalize(date).getDay()
  return day === 0 || day === 6
}

/** 是否为有效日期 */
export function isValidDate(date: unknown): boolean {
  if (!(date instanceof Date)) return false
  return !Number.isNaN(date.getTime())
}

/** 一日起始 */
export function startOfDay(date: DateInput): Date {
  const d = normalize(date)
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

/** 一日结束 */
export function endOfDay(date: DateInput): Date {
  const d = normalize(date)
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999)
}

/** 一周起始（周日） */
export function startOfWeek(date: DateInput): Date {
  const d = normalize(date)
  const day = d.getDay()
  return addDays(startOfDay(d), -day)
}

/** 一周结束（周六） */
export function endOfWeek(date: DateInput): Date {
  return addDays(startOfWeek(date), 6)
}

/** 一周起始（周一，ISO） */
export function startOfISOWeek(date: DateInput): Date {
  const d = normalize(date)
  const day = d.getDay() || 7
  return addDays(startOfDay(d), 1 - day)
}

/** 一月起始 */
export function startOfMonth(date: DateInput): Date {
  const d = normalize(date)
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

/** 一月结束 */
export function endOfMonth(date: DateInput): Date {
  const d = normalize(date)
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999)
}

/** 一年起始 */
export function startOfYear(date: DateInput): Date {
  const d = normalize(date)
  return new Date(d.getFullYear(), 0, 1)
}

/** 一年结束 */
export function endOfYear(date: DateInput): Date {
  const d = normalize(date)
  return new Date(d.getFullYear(), 11, 31, 23, 59, 59, 999)
}

/** 是否同日 */
export function isSameDay(date1: DateInput, date2: DateInput): boolean {
  const a = normalize(date1)
  const b = normalize(date2)
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

/** 比较粒度截断 */
function startOf(date: DateInput, unit: DateUnit): Date {
  switch (unit) {
    case 'year': return startOfYear(date)
    case 'month': return startOfMonth(date)
    case 'week': return startOfWeek(date)
    case 'day': return startOfDay(date)
    case 'hour': return new Date(normalize(date).setMinutes(0, 0, 0))
    case 'minute': return new Date(normalize(date).setSeconds(0, 0))
    case 'second': return new Date(normalize(date).setMilliseconds(0))
    case 'millisecond': return normalize(date)
    case 'quarter': return startOfMonth(subMonths(date, (normalize(date).getMonth() % 3)))
  }
}

/** date1 是否早于 date2 */
export function isBefore(
  date1: DateInput,
  date2: DateInput,
  unit: DateUnit = 'millisecond'
): boolean {
  return startOf(date1, unit).getTime() < startOf(date2, unit).getTime()
}

/** date1 是否晚于 date2 */
export function isAfter(
  date1: DateInput,
  date2: DateInput,
  unit: DateUnit = 'millisecond'
): boolean {
  return startOf(date1, unit).getTime() > startOf(date2, unit).getTime()
}

/** date 是否在 [start, end] 区间内 */
export function isBetween(
  date: DateInput,
  start: DateInput,
  end: DateInput,
  options: { inclusive?: boolean; unit?: DateUnit } = {}
): boolean {
  const { inclusive = true, unit = 'millisecond' } = options
  const a = startOf(date, unit).getTime()
  const s = startOf(start, unit).getTime()
  const e = startOf(end, unit).getTime()
  return inclusive ? a >= s && a <= e : a > s && a < e
}

/** 当前时区 */
export function getCurrentTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

/** 指定时区的当前时间 */
export function nowInTimezone(tz: string): Date {
  return toTimezone(new Date(), tz)
}

/** 当前 UTC 时间 */
export function nowUtc(): Date {
  return new Date(Date.now())
}

/**
 * 转为指定时区显示的 Date（等价的"wall clock"）。
 * 返回的 Date 对象使用本地时区表示，但数值对应目标时区的 wall clock。
 */
export function toTimezone(date: DateInput, tz: string): Date {
  const d = normalize(date)
  const formatter = getFormatter('en-US', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
  const parts = formatter.formatToParts(d)
  const values: Record<string, string> = {}
  for (const part of parts) {
    values[part.type] = part.value
  }
  return new Date(
    Number.parseInt(values.year, 10),
    Number.parseInt(values.month, 10) - 1,
    Number.parseInt(values.day, 10),
    Number.parseInt(values.hour, 10),
    Number.parseInt(values.minute, 10),
    Number.parseInt(values.second, 10)
  )
}

/** 在指定时区按 pattern 格式化 */
export function formatInTimezone(
  date: DateInput,
  pattern: string,
  tz: string,
  locale?: string
): string {
  return formatDate(toTimezone(date, tz), pattern, locale)
}

let defaultLocale = ''

/** 当前默认 locale（只读） */
export function getDateLocale(): string {
  return defaultLocale
}

/** 设置默认 locale（模块级状态） */
export function setDateLocale(locale: string): string {
  const old = defaultLocale
  defaultLocale = locale
  return old
}

/** 动态加载并注册 locale 数据 */
export function loadDateLocale(locale: string): void {
  getFormatter(locale, {})
}

function getRelativeFormatter(locale?: string): Intl.RelativeTimeFormat {
  return new Intl.RelativeTimeFormat(locale || defaultLocale || undefined, { numeric: 'auto' })
}

function fromImpl(
  date: DateInput,
  ref: DateInput,
  options: { withoutSuffix?: boolean; locale?: string } = {}
): string {
  const { locale } = options
  const diffMs = normalize(date).getTime() - normalize(ref).getTime()
  const formatter = getRelativeFormatter(locale)

  const seconds = Math.round(diffMs / 1000)
  const minutes = Math.round(seconds / 60)
  const hours = Math.round(minutes / 60)
  const days = Math.round(hours / 24)
  const months = Math.round(days / 30)
  const years = Math.round(days / 365)

  if (Math.abs(years) >= 1) return formatter.format(years, 'year')
  if (Math.abs(months) >= 1) return formatter.format(months, 'month')
  if (Math.abs(days) >= 1) return formatter.format(days, 'day')
  if (Math.abs(hours) >= 1) return formatter.format(hours, 'hour')
  if (Math.abs(minutes) >= 1) return formatter.format(minutes, 'minute')
  return formatter.format(seconds, 'second')
}

/** 相对当前时间（过去方向） */
export function fromNow(
  date: DateInput,
  options: { withoutSuffix?: boolean; locale?: string } = {}
): string {
  return fromImpl(date, new Date(), options)
}

/** 相对指定时间 */
export function from(
  date: DateInput,
  ref: DateInput,
  options: { withoutSuffix?: boolean; locale?: string } = {}
): string {
  return fromImpl(date, ref, options)
}

/** 相对当前时间（未来方向） */
export function toNow(
  date: DateInput,
  options: { withoutSuffix?: boolean; locale?: string } = {}
): string {
  return fromImpl(new Date(), date, options)
}

export type CronSegment =
  | number
  | '*'
  | { start: number; end: number; step?: number }
  | number[]

export interface CronExpression5 {
  raw: string
  segments: 5
  minute: CronSegment
  hour: CronSegment
  dayOfMonth: CronSegment
  month: CronSegment
  dayOfWeek: CronSegment
}

export interface CronExpression6 {
  raw: string
  segments: 6
  minute: CronSegment
  hour: CronSegment
  dayOfMonth: CronSegment
  month: CronSegment
  dayOfWeek: CronSegment
  year: CronSegment
}

export type CronExpression = CronExpression5 | CronExpression6

export class InvalidCronError extends Error {
  readonly expression: string
  readonly reason: string
  constructor(expression: string, reason: string) {
    super(`Invalid cron "${expression}": ${reason}`)
    this.name = 'InvalidCronError'
    this.expression = expression
    this.reason = reason
  }
}

function parseCronSegment(segment: string, min: number, max: number): CronSegment {
  if (segment === '*') return '*'
  if (segment.includes(',')) {
    return segment
      .split(',')
      .map((s) => Number.parseInt(s, 10))
      .filter((n) => !Number.isNaN(n))
  }
  if (segment.includes('/')) {
    const [range, step] = segment.split('/')
    const stepValue = Number.parseInt(step, 10)
    if (range === '*') return { start: min, end: max, step: stepValue }
    const [start, end] = range.split('-').map((s) => Number.parseInt(s, 10))
    return { start, end, step: stepValue }
  }
  if (segment.includes('-')) {
    const [start, end] = segment.split('-').map((s) => Number.parseInt(s, 10))
    return { start, end }
  }
  const value = Number.parseInt(segment, 10)
  if (Number.isNaN(value)) throw new Error(`Invalid segment value: ${segment}`)
  return value
}

function cronSegmentToString(segment: CronSegment): string {
  if (segment === '*') return '*'
  if (Array.isArray(segment)) return segment.join(',')
  if (typeof segment === 'number') return String(segment)
  if ('step' in segment) return `${segment.start}-${segment.end}/${segment.step}`
  return `${segment.start}-${segment.end}`
}

/** 解析 cron 表达式 */
export function parseCron(expression: string): CronExpression {
  if (expression.startsWith('@')) {
    throw new InvalidCronError(expression, 'Aliases are not supported')
  }
  const parts = expression.trim().split(/\s+/)
  if (parts.length !== 5 && parts.length !== 6) {
    throw new InvalidCronError(expression, 'Expected 5 or 6 segments')
  }
  try {
    const base = {
      raw: expression,
      minute: parseCronSegment(parts[0], 0, 59),
      hour: parseCronSegment(parts[1], 0, 23),
      dayOfMonth: parseCronSegment(parts[2], 1, 31),
      month: parseCronSegment(parts[3], 1, 12),
      dayOfWeek: parseCronSegment(parts[4], 0, 7),
    }
    if (parts.length === 5) {
      return { ...base, segments: 5 }
    }
    return { ...base, segments: 6, year: parseCronSegment(parts[5], 1970, 2099) }
  } catch (error) {
    throw new InvalidCronError(expression, String(error))
  }
}

/** 校验 cron 表达式是否合法 */
export function isValidCron(expression: string): boolean {
  try {
    parseCron(expression)
    return true
  } catch {
    return false
  }
}

function matchesSegment(value: number, segment: CronSegment): boolean {
  if (segment === '*') return true
  if (Array.isArray(segment)) return segment.includes(value)
  if (typeof segment === 'number') return segment === value
  const { start, end, step } = segment
  if (step) {
    for (let i = start; i <= end; i += step) {
      if (i === value) return true
    }
    return false
  }
  return value >= start && value <= end
}

function matchesCron(date: Date, expr: CronExpression): boolean {
  const minute = date.getMinutes()
  const hour = date.getHours()
  const dayOfMonth = date.getDate()
  const month = date.getMonth() + 1
  const dayOfWeek = date.getDay()
  if (
    !matchesSegment(minute, expr.minute) ||
    !matchesSegment(hour, expr.hour) ||
    !matchesSegment(month, expr.month)
  ) {
    return false
  }
  const dayOfWeekValue = dayOfWeek === 0 ? 7 : dayOfWeek
  if (
    !matchesSegment(dayOfMonth, expr.dayOfMonth) &&
    !matchesSegment(dayOfWeekValue, expr.dayOfWeek)
  ) {
    return false
  }
  if (expr.segments === 6 && !matchesSegment(date.getFullYear(), expr.year)) {
    return false
  }
  return true
}

function getNextOrPrev(
  expression: string,
  from: DateInput | undefined,
  direction: 1 | -1
): Date | null {
  const expr = parseCron(expression)
  let current = from ? normalize(from) : new Date()
  current = new Date(current.getTime())
  // 对齐到分钟
  current.setSeconds(0, 0)
  if (direction === 1) {
    current = addMinutes(current, 1)
  }

  const maxIterations = 366 * 24 * 60 * 4 // 4 年
  for (let i = 0; i < maxIterations; i++) {
    if (matchesCron(current, expr)) return current
    current = addMinutes(current, direction)
  }
  return null
}

/** 计算 from 之后最近一次触发时间 */
export function getNextCronDate(expression: string, from?: DateInput): Date {
  const result = getNextOrPrev(expression, from, 1)
  if (!result) throw new InvalidCronError(expression, 'No next occurrence found within 4 years')
  return result
}

/** 计算 from 之前最近一次触发时间 */
export function getPrevCronDate(expression: string, from?: DateInput): Date {
  const result = getNextOrPrev(expression, from, -1)
  if (!result) throw new InvalidCronError(expression, 'No previous occurrence found within 4 years')
  return result
}

/** 判断指定时间是否匹配 cron 表达式 */
export function isCronMatch(expression: string, date: DateInput): boolean {
  return matchesCron(normalize(date), parseCron(expression))
}

/** 列出 from 之后 N 次触发时间 */
export function nextOccurrences(
  expression: string,
  count = 10,
  from?: DateInput
): Date[] {
  const max = Math.min(count, 100)
  const result: Date[] = []
  let current: DateInput | undefined = from
  for (let i = 0; i < max; i++) {
    const next = getNextCronDate(expression, current)
    result.push(next)
    current = addMinutes(next, 1)
  }
  return result
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

/** 返回 cron 表达式的人类可读描述（英文） */
export function cronToDescription(expression: string): string {
  const expr = parseCron(expression)
  if (expr.minute === '*' && expr.hour === '*') return 'Every minute'
  if (expr.minute === 0 && expr.hour === 0) return 'At 00:00 every day'
  const minute = cronSegmentToString(expr.minute)
  const hour = cronSegmentToString(expr.hour)
  const dayOfMonth = cronSegmentToString(expr.dayOfMonth)
  const month = cronSegmentToString(expr.month)
  const dayOfWeek = cronSegmentToString(expr.dayOfWeek)
  return `Cron: minute=${minute}, hour=${hour}, dayOfMonth=${dayOfMonth}, month=${month}, dayOfWeek=${dayOfWeek}`
}
