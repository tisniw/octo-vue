/** 字节数格式化（1024 → '1.00 KB'） */
export function formatBytes(
  bytes: number,
  options: { decimals?: number; binary?: boolean } = {}
): string {
  const { decimals = 2, binary = false } = options
  const base = binary ? 1024 : 1000
  const units = binary
    ? ['B', 'KiB', 'MiB', 'GiB', 'TiB']
    : ['B', 'KB', 'MB', 'GB', 'TB']
  if (bytes === 0) return `0 ${units[0]}`
  const exp = Math.min(
    Math.floor(Math.log(bytes) / Math.log(base)),
    units.length - 1
  )
  const value = bytes / base ** exp
  return `${value.toFixed(decimals)} ${units[exp]}`
}

/** 百分比格式化（0.123 → '12.30%'） */
export function formatPercent(value: number, decimals = 2): string {
  return `${(value * 100).toFixed(decimals)}%`
}

/** 时长格式化（65000 → '1分5秒'） */
export function formatDuration(ms: number, format: 'short' | 'long' = 'long'): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (format === 'short') {
    const parts = [
      days ? `${days}d` : '',
      hours % 24 ? `${hours % 24}h` : '',
      minutes % 60 ? `${minutes % 60}m` : '',
      seconds % 60 ? `${seconds % 60}s` : '',
    ]
    return parts.filter(Boolean).join(' ') || '0s'
  }

  const parts: string[] = []
  if (days) parts.push(`${days}天`)
  if (hours % 24) parts.push(`${hours % 24}小时`)
  if (minutes % 60) parts.push(`${minutes % 60}分`)
  if (seconds % 60 || !parts.length) parts.push(`${seconds % 60}秒`)
  return parts.join('')
}

/** 手机号脱敏（138****5678） */
export function formatPhone(phone: string): string {
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

/** 身份证脱敏（110101********1234） */
export function formatIdCard(idCard: string): string {
  return idCard.replace(/(\d{6})\d{8,11}(\d{2,4})/, '$1********$2')
}

/** 银行卡号分组（4 位一空格） */
export function formatBankCard(cardNo: string): string {
  return cardNo.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim()
}

/** 货币格式化 */
export function formatCurrency(
  value: number,
  currency = 'CNY',
  locale = 'zh-CN'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value)
}
