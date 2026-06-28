import { NetworkError } from '../../types/error'
import {
  CancelError,
  ClientError,
  BusinessError,
  NetworkException,
  ServerError,
  TimeoutError,
  UnknownError,
} from './index'

/** 类型守卫:是否为 NetworkError */
export function isNetworkError(e: unknown): e is NetworkError {
  return e instanceof NetworkError
}

/** 类型守卫:是否为 NetworkException */
export function isNetworkException(e: unknown): e is NetworkException {
  return e instanceof NetworkException
}

/** 类型守卫:是否为 ServerError */
export function isServerError(e: unknown): e is ServerError {
  return e instanceof ServerError
}

/** 类型守卫:是否为 ClientError */
export function isClientError(e: unknown): e is ClientError {
  return e instanceof ClientError
}

/** 类型守卫:是否为 BusinessError */
export function isBusinessError(e: unknown): e is BusinessError {
  return e instanceof BusinessError
}

/** 类型守卫:是否为 UnknownError */
export function isUnknownError(e: unknown): e is UnknownError {
  return e instanceof UnknownError
}

/** 类型守卫:是否为 TimeoutError */
export function isTimeoutError(e: unknown): e is TimeoutError {
  return e instanceof TimeoutError
}

/** 类型守卫:是否为 CancelError */
export function isCancelError(e: unknown): e is CancelError {
  return e instanceof CancelError
}