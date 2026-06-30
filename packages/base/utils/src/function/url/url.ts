export interface UrlParts {
  protocol: string
  host: string
  pathname: string
  search: string
  hash: string
  port: string
  origin: string
}

/** 解析 query 字符串为对象（无前缀 `?`） */
export function parseQuery(query: string): Record<string, string> {
  const result: Record<string, string> = {}
  if (!query) return result
  const params = new URLSearchParams(query)
  for (const [key, value] of params) {
    result[key] = value
  }
  return result
}

/** 解析 query 字符串为多值对象（同名 key 收集为数组） */
export function parseQueryArray(query: string): Record<string, string | string[]> {
  const result: Record<string, string | string[]> = {}
  if (!query) return result
  const params = new URLSearchParams(query)
  for (const [key, value] of params) {
    const current = result[key]
    if (current === undefined) {
      result[key] = value
    } else if (Array.isArray(current)) {
      current.push(value)
    } else {
      result[key] = [current, value]
    }
  }
  return result
}

/** 序列化对象为 query 字符串（无前缀 `?`） */
export function stringifyQuery(
  params: Record<string, string | number | boolean | null | undefined>
): string {
  const parts: string[] = []
  for (const [key, value] of Object.entries(params)) {
    if (value == null) continue
    parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
  }
  return parts.join('&')
}

/** 解析 URL 为组件 */
export function parseUrl(url: string): UrlParts {
  try {
    const u = new URL(url)
    return {
      protocol: u.protocol,
      host: u.host,
      pathname: u.pathname,
      search: u.search,
      hash: u.hash,
      port: u.port,
      origin: u.origin,
    }
  } catch {
    return { protocol: '', host: '', pathname: '', search: '', hash: '', port: '', origin: '' }
  }
}

/** 在已有 query 上添加参数（返回新字符串） */
export function addQueryParam(query: string, key: string, value: string): string {
  const params = new URLSearchParams(query)
  params.set(key, value)
  return params.toString()
}

/** 在已有 query 上移除参数（返回新字符串） */
export function removeQueryParam(query: string, key: string): string {
  const params = new URLSearchParams(query)
  params.delete(key)
  return params.toString()
}
