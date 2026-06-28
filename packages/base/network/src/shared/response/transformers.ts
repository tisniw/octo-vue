/** 请求转换器类型 */
export type RequestTransformer = (
  data: unknown,
  headers?: Record<string, string>
) => unknown

/** 响应转换器类型 */
export type ResponseTransformer<T = unknown> = (data: T) => T | Promise<T>

/** JSON 请求转换器 */
export const jsonRequestTransformer: RequestTransformer = (data, headers) => {
  if (headers) {
    headers['Content-Type'] = 'application/json;charset=utf-8'
  }
  if (data === undefined || data === null) return data
  return JSON.stringify(data)
}

/** FormData 请求转换器 */
export const formDataRequestTransformer: RequestTransformer = (data) => {
  if (data instanceof FormData) return data
  if (data instanceof URLSearchParams) return data
  const form = new FormData()
  if (data && typeof data === 'object') {
    for (const [key, value] of Object.entries(data)) {
      form.append(key, String(value))
    }
  }
  return form
}

/** 大数字转字符串(避免精度丢失) */
export const bigIntStringTransformer: RequestTransformer = (data) => {
  return JSON.stringify(data, (_, value) =>
    typeof value === 'bigint' ? value.toString() : value
  )
}

/** 启发式时间戳转 Date */
export const timestampTransformer: ResponseTransformer = (data: any) => {
  const walk = (value: unknown): unknown => {
    if (typeof value === 'number' && value > 946656000 && value < 4102444800) {
      // 2000-2100 之间的秒级时间戳
      return new Date(value * 1000)
    }
    if (Array.isArray(value)) return value.map(walk)
    if (value !== null && typeof value === 'object') {
      const result: Record<string, unknown> = {}
      for (const [k, v] of Object.entries(value)) {
        result[k] = walk(v)
      }
      return result
    }
    return value
  }
  return walk(data)
}

/** 字符串大数字解析为 BigInt */
export const bigIntParseTransformer: ResponseTransformer = (data: any) => {
  const walk = (value: unknown): unknown => {
    if (typeof value === 'string' && /^\d{16,}$/.test(value)) {
      try {
        return BigInt(value)
      } catch {
        return value
      }
    }
    if (Array.isArray(value)) return value.map(walk)
    if (value !== null && typeof value === 'object') {
      const result: Record<string, unknown> = {}
      for (const [k, v] of Object.entries(value)) {
        result[k] = walk(v)
      }
      return result
    }
    return value
  }
  return walk(data)
}

/** 业务响应解包转换器 */
export const apiResponseUnwrap: ResponseTransformer = (data: any) => {
  if (
    data !== null &&
    typeof data === 'object' &&
    'code' in data &&
    'data' in data
  ) {
    return data.data
  }
  return data
}