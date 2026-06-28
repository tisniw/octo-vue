import type { BusinessCodeSemantics } from '../error'
import { BusinessError } from '../error'

/** API 响应统一结构(后端约定) */
export interface ApiResponse<T = unknown> {
  code: number
  msg: string
  data: T
  [extra: string]: unknown
}

/** 业务数据(语义别名) */
export type BusinessData<T> = T

/** 检查业务码,code !== success 时抛 BusinessError */
export function checkBusinessCode<T>(
  payload: ApiResponse<T>,
  semantics?: BusinessCodeSemantics
): T {
  const success = semantics?.success ?? 0
  if (payload.code !== success) {
    throw new BusinessError(
      payload.msg || `Business error code ${payload.code}`,
      payload.code,
      payload.data
    )
  }
  return payload.data
}

/** 解包 HTTP 响应(axios)为 API 响应 */
export function unwrapResponse<T>(response: { data: ApiResponse<T> | T }): T {
  const data = response.data
  // 如果是 ApiResponse 结构,提取 data;否则原样返回
  if (
    data !== null &&
    typeof data === 'object' &&
    'code' in data &&
    'msg' in data &&
    'data' in data
  ) {
    return (data as ApiResponse<T>).data
  }
  return data as T
}

/** 双层解包:HTTP → API → 业务数据(检查业务码) */
export function unwrapBusinessResponse<T>(
  response: { data: ApiResponse<T> | T },
  semantics?: BusinessCodeSemantics
): T {
  const raw = response.data
  if (
    raw !== null &&
    typeof raw === 'object' &&
    'code' in raw &&
    'msg' in raw &&
    'data' in raw
  ) {
    return checkBusinessCode(raw as ApiResponse<T>, semantics)
  }
  return raw as T
}