import type { RetryConfig } from './retry'

/** 全局 HTTP 配置 */
export interface GlobalHttpConfig {
  defaultTimeout?: number
  defaultRetry?: RetryConfig
  dedupe?: boolean
}

let _config: GlobalHttpConfig = {}

/** 设置全局 HTTP 配置 */
export function setHttpConfig(config: GlobalHttpConfig): void {
  _config = { ..._config, ...config }
}

/** 获取全局 HTTP 配置 */
export function getHttpConfig(): GlobalHttpConfig {
  return _config
}