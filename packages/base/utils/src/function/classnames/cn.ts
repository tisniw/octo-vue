export type ClassValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | ClassValue[]
  | { [key: string]: boolean | null | undefined }

function flatten(inputs: ClassValue[]): string[] {
  const out: string[] = []
  for (const input of inputs) {
    if (input == null || input === false || input === '') continue
    if (typeof input === 'string' || typeof input === 'number') {
      out.push(String(input))
      continue
    }
    if (Array.isArray(input)) {
      out.push(...flatten(input))
      continue
    }
    for (const [key, value] of Object.entries(input)) {
      if (value) out.push(key)
    }
  }
  return out
}

/** 类名合并（支持字符串 / 数组 / 对象 / 假值过滤） */
export function cn(...inputs: ClassValue[]): string {
  return flatten(inputs).join(' ')
}

/** cn 的别名 */
export function clx(...inputs: ClassValue[]): string {
  return cn(...inputs)
}
