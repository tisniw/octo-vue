/** 限制在区间内 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/** 判断是否在区间内（含端点） */
export function inRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max
}

/** 数字精度处理（避免浮点误差） */
export function round(value: number, precision = 0): number {
  const factor = 10 ** precision
  return Math.round(value * factor) / factor
}

/** 随机整数（含两端） */
export function random(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/** 随机浮点数 */
export function randomFloat(min: number, max: number, decimals = 2): number {
  const value = Math.random() * (max - min) + min
  return round(value, decimals)
}

/** 数字填充前导零 */
export function padZero(value: number, length: number): string {
  return String(value).padStart(length, '0')
}

/** 千分位 / 数字格式化 */
export function formatNumber(
  value: number,
  options: { locale?: string; decimals?: number } = {}
): string {
  const { locale = 'default', decimals } = options
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals ?? 0,
    maximumFractionDigits: decimals ?? 20,
  }).format(value)
}

/** 是否为数字（含有限值判断） */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value)
}

/** 是否为整数 */
export function isInteger(value: unknown): value is number {
  return isNumber(value) && Number.isInteger(value)
}

/** 是否为有限数（排除 NaN / Infinity） */
export function isFiniteNumber(value: unknown): value is number {
  return isNumber(value) && Number.isFinite(value)
}
