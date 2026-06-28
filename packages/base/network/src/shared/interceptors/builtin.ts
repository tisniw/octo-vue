import type { RequestInterceptor, ResponseInterceptor, ErrorInterceptor, HttpInterceptors } from './index'
import type { NetworkError } from '../../types/error'

// ===== 令牌拦截器 =====

export interface TokenInterceptorConfig {
  getToken: () => string | null | Promise<string | null>
  headerName?: string
  prefix?: string
  skipUrls?: (string | RegExp)[]
}

export function createTokenInterceptor(config: TokenInterceptorConfig): RequestInterceptor {
  const { getToken, headerName = 'Authorization', prefix = 'Bearer ', skipUrls = [] } = config

  return {
    id: 'builtin:token',
    async onFulfilled(req: any) {
      const url = req.url ?? ''
      const shouldSkip = skipUrls.some((pattern) =>
        typeof pattern === 'string' ? url.startsWith(pattern) : pattern.test(url)
      )
      if (shouldSkip) return req

      const token = await getToken()
      if (token) {
        req.headers = {
          ...req.headers,
          [headerName]: `${prefix}${token}`,
        }
      }
      return req
    },
  }
}

// ===== 设备拦截器 =====

export interface DeviceInterceptorConfig {
  getDeviceId: () => string
  appVersion?: string
  platform?: string
  headerMap?: {
    deviceId?: string
    appVersion?: string
    platform?: string
  }
}

export function createDeviceInterceptor(config: DeviceInterceptorConfig): RequestInterceptor {
  const {
    getDeviceId,
    appVersion,
    platform,
    headerMap = { deviceId: 'X-Device-Id', appVersion: 'X-App-Version', platform: 'X-Platform' },
  } = config

  return {
    id: 'builtin:device',
    onFulfilled(req: any) {
      req.headers = { ...req.headers }
      if (headerMap.deviceId) req.headers[headerMap.deviceId] = getDeviceId()
      if (appVersion && headerMap.appVersion) req.headers[headerMap.appVersion] = appVersion
      if (platform && headerMap.platform) req.headers[headerMap.platform] = platform
      return req
    },
  }
}

// ===== 日志拦截器 =====

export interface LogInterceptorConfig {
  level?: 'debug' | 'info' | 'warn' | 'error'
  logger?: Pick<Console, 'debug' | 'info' | 'warn' | 'error'>
  logRequestBody?: boolean
  logResponseBody?: boolean
  skipUrls?: (string | RegExp)[]
}

export function createRequestLogInterceptor(config?: LogInterceptorConfig): RequestInterceptor {
  const { level = 'debug', logger = console, logRequestBody = false, skipUrls = [] } = config ?? {}

  return {
    id: 'builtin:request-log',
    onFulfilled(req: any) {
      const url = req.url ?? ''
      const shouldSkip = skipUrls.some((p) =>
        typeof p === 'string' ? url.startsWith(p) : p.test(url)
      )
      if (shouldSkip) return req

      logger[level]?.(`[Request] ${req.method ?? 'GET'} ${url}`, {
        headers: req.headers,
        params: req.params,
        body: logRequestBody ? req.data : undefined,
      })
      return req
    },
  }
}

export function createResponseLogInterceptor(config?: LogInterceptorConfig): ResponseInterceptor {
  const { level = 'debug', logger = console, logResponseBody = false, skipUrls = [] } = config ?? {}

  return {
    id: 'builtin:response-log',
    onFulfilled(response: any) {
      const url = response?.config?.url ?? ''
      const shouldSkip = skipUrls.some((p) =>
        typeof p === 'string' ? url.startsWith(p) : p.test(url)
      )
      if (shouldSkip) return response

      logger[level]?.(`[Response] ${url} status=${response?.status}`, {
        data: logResponseBody ? response?.data : undefined,
      })
      return response
    },
  }
}

// ===== 错误处理拦截器 =====

export interface ErrorHandlerInterceptorConfig {
  handler?: (error: NetworkError) => void
  loginUrl?: string
  report?: (error: NetworkError) => void
}

export function createErrorHandlerInterceptor(
  config?: ErrorHandlerInterceptorConfig
): ErrorInterceptor {
  const { handler, loginUrl, report } = config ?? {}

  return {
    id: 'builtin:error-handler',
    async onError(error: NetworkError) {
      if (handler) handler(error)
      if (report) report(error)

      if (loginUrl && error.kind === 'client' && 'status' in error && error.status === 401) {
        if (typeof window !== 'undefined') {
          window.location.href = loginUrl
        }
      }

      return error
    },
  }
}

// ===== 一键注册 =====

export interface BuiltinInterceptorsConfig {
  token?: TokenInterceptorConfig
  device?: DeviceInterceptorConfig
  log?: LogInterceptorConfig
  error?: ErrorHandlerInterceptorConfig
}

export function registerBuiltinInterceptors(
  interceptors: HttpInterceptors,
  config: BuiltinInterceptorsConfig = {}
): void {
  if (config.token) {
    interceptors.request.use(createTokenInterceptor(config.token))
  }
  if (config.device) {
    interceptors.request.use(createDeviceInterceptor(config.device))
  }
  if (config.log) {
    interceptors.request.use(createRequestLogInterceptor(config.log))
    interceptors.response.use(createResponseLogInterceptor(config.log))
  }
  if (config.error) {
    interceptors.error.use(createErrorHandlerInterceptor(config.error))
  }
}