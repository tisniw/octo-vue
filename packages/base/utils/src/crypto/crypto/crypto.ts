export type HashInput = string | ArrayBuffer | Uint8Array | Blob
export type HashAlgorithm = 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512'

export type AESKeyLength = 128 | 192 | 256
export type AESAlgorithm = 'AES-GCM' | 'AES-CBC' | 'AES-CTR'

export interface AESEncryptOptions {
  algorithm?: AESAlgorithm
  keyLength?: AESKeyLength
  aad?: ArrayBuffer | Uint8Array
  iv?: ArrayBuffer | Uint8Array
}

export interface AESResult {
  ciphertext: ArrayBuffer
  iv: ArrayBuffer
  algorithm: AESAlgorithm
}

export type CryptoErrorCode =
  | 'UNSUPPORTED_ALGORITHM'
  | 'INVALID_KEY'
  | 'INVALID_IV'
  | 'DECRYPT_FAILED'
  | 'INVALID_INPUT'
  | 'RANDOM_SOURCE_UNAVAILABLE'
  | 'SUBTLE_CRYPTO_UNAVAILABLE'

export class CryptoError extends Error {
  readonly code: CryptoErrorCode
  constructor(message: string, code: CryptoErrorCode, options?: ErrorOptions) {
    super(message, options)
    this.name = 'CryptoError'
    this.code = code
  }
}

export type Charset =
  | 'alphanumeric'
  | 'alpha'
  | 'numeric'
  | 'hex'
  | 'base64'
  | 'all'

export type UUIDVersion = 'v1' | 'v4' | 'v7'

/** 检查 Web Crypto API 是否可用 */
export function isCryptoAvailable(): boolean {
  return typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function'
}

/** 检查 SubtleCrypto 是否可用 */
export function isSubtleCryptoAvailable(): boolean {
  return isCryptoAvailable() && !!crypto.subtle
}

/** 确保 crypto 可用，否则抛错 */
export function ensureCrypto(): void {
  if (!isCryptoAvailable()) {
    throw new CryptoError('Web Crypto API unavailable', 'RANDOM_SOURCE_UNAVAILABLE')
  }
  if (!crypto.subtle) {
    throw new CryptoError('SubtleCrypto unavailable', 'SUBTLE_CRYPTO_UNAVAILABLE')
  }
}

/** 获取 CSPRNG */
export function getRandomValues(array: ArrayBufferView): ArrayBufferView {
  if (!isCryptoAvailable()) {
    throw new CryptoError('Random source unavailable', 'RANDOM_SOURCE_UNAVAILABLE')
  }
  return crypto.getRandomValues(array as any)
}

/** 字符串 → ArrayBuffer（UTF-8） */
export function stringToBuffer(str: string): ArrayBuffer {
  return new TextEncoder().encode(str).buffer
}

/** ArrayBuffer → 字符串（UTF-8） */
export function bufferToString(buf: ArrayBuffer): string {
  return new TextDecoder().decode(buf)
}

/** 字符串 → Uint8Array（UTF-8） */
export function stringToBytes(str: string): Uint8Array {
  return new TextEncoder().encode(str)
}

/** Uint8Array → 字符串（UTF-8） */
export function bytesToString(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes)
}

/** ArrayBuffer → Uint8Array（零拷贝视图） */
export function bufferToBytes(buf: ArrayBuffer): Uint8Array {
  return new Uint8Array(buf)
}

/** Uint8Array → ArrayBuffer（拷贝） */
export function bytesToBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.slice().buffer as ArrayBuffer
}

function toBuffer(input: ArrayBuffer | Uint8Array): ArrayBuffer {
  return input instanceof ArrayBuffer ? input : bytesToBuffer(input)
}

/** 规范化输入为 ArrayBuffer */
export async function normalizeInput(input: HashInput): Promise<ArrayBuffer> {
  if (typeof input === 'string') return stringToBuffer(input)
  if (input instanceof Uint8Array) return bytesToBuffer(input)
  if (input instanceof ArrayBuffer) return input
  if (input instanceof Blob) return await input.arrayBuffer()
  throw new CryptoError('Unsupported input type', 'INVALID_INPUT')
}

/** ArrayBuffer → hex 字符串 */
export function bufferToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/** hex 字符串 → ArrayBuffer */
export function hexToBuffer(hex: string): ArrayBuffer {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = Number.parseInt(hex.slice(i, i + 2), 16)
  }
  return bytes.buffer as ArrayBuffer
}

/** 通用 SubtleCrypto 摘要入口 */
export async function digest(
  algorithm: HashAlgorithm,
  input: HashInput
): Promise<ArrayBuffer> {
  ensureCrypto()
  const data = await normalizeInput(input)
  return crypto.subtle.digest(algorithm, data)
}

export async function sha1(input: HashInput): Promise<string> {
  return bufferToHex(await digest('SHA-1', input))
}

export async function sha256(input: HashInput): Promise<string> {
  return bufferToHex(await digest('SHA-256', input))
}

export async function sha384(input: HashInput): Promise<string> {
  return bufferToHex(await digest('SHA-384', input))
}

export async function sha512(input: HashInput): Promise<string> {
  return bufferToHex(await digest('SHA-512', input))
}

export async function sha256Buffer(input: HashInput): Promise<ArrayBuffer> {
  return digest('SHA-256', input)
}

export async function sha512Buffer(input: HashInput): Promise<ArrayBuffer> {
  return digest('SHA-512', input)
}

async function hmac(
  algorithm: HashAlgorithm,
  input: HashInput,
  key: string | ArrayBuffer | Uint8Array
): Promise<string> {
  ensureCrypto()
  const keyData = typeof key === 'string' ? stringToBuffer(key) : toBuffer(key)
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: algorithm },
    false,
    ['sign']
  )
  const data = await normalizeInput(input)
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, data)
  return bufferToHex(signature)
}

export async function hmacSHA256(
  input: HashInput,
  key: string | ArrayBuffer | Uint8Array
): Promise<string> {
  return hmac('SHA-256', input, key)
}

export async function hmacSHA512(
  input: HashInput,
  key: string | ArrayBuffer | Uint8Array
): Promise<string> {
  return hmac('SHA-512', input, key)
}

/** 生成 AES 密钥（返回 CryptoKey） */
export async function generateAESKey(keyLength: AESKeyLength = 256): Promise<CryptoKey> {
  ensureCrypto()
  return crypto.subtle.generateKey(
    { name: 'AES-GCM', length: keyLength },
    true,
    ['encrypt', 'decrypt']
  )
}

async function importAESKey(
  key: CryptoKey | string,
  algorithm: AESAlgorithm = 'AES-GCM'
): Promise<CryptoKey> {
  if (typeof key !== 'string') return key
  ensureCrypto()
  const keyData = toBuffer(base64Decode(key))
  return crypto.subtle.importKey(
    'raw',
    keyData,
    { name: algorithm },
    false,
    ['encrypt', 'decrypt']
  )
}

function getIV(iv?: ArrayBuffer | Uint8Array, length = 12): ArrayBuffer {
  if (iv) return toBuffer(iv)
  const bytes = new Uint8Array(length)
  getRandomValues(bytes)
  return bytes.buffer as ArrayBuffer
}

export async function aesEncrypt(
  plaintext: HashInput,
  key: CryptoKey | string,
  options: AESEncryptOptions = {}
): Promise<AESResult> {
  ensureCrypto()
  const algorithm = options.algorithm ?? 'AES-GCM'
  const iv = getIV(options.iv, algorithm === 'AES-GCM' ? 12 : 16)
  const cryptoKey = await importAESKey(key, algorithm)
  const data = await normalizeInput(plaintext)
  const aad = options.aad ? toBuffer(options.aad) : undefined
  const params: AesGcmParams | AesCbcParams | AesCtrParams =
    algorithm === 'AES-GCM'
      ? { name: 'AES-GCM', iv, additionalData: aad }
      : algorithm === 'AES-CBC'
        ? { name: 'AES-CBC', iv }
        : { name: 'AES-CTR', counter: iv, length: 64 }
  const ciphertext = await crypto.subtle.encrypt(params, cryptoKey, data)
  return { ciphertext, iv, algorithm }
}

export async function aesDecrypt(
  result: AESResult | { ciphertext: ArrayBuffer; iv: ArrayBuffer },
  key: CryptoKey | string,
  options: Omit<AESEncryptOptions, 'iv'> = {}
): Promise<ArrayBuffer> {
  ensureCrypto()
  const algorithm = options.algorithm ?? 'AES-GCM'
  const cryptoKey = await importAESKey(key, algorithm)
  const iv = toBuffer(result.iv)
  const aad = options.aad ? toBuffer(options.aad) : undefined
  const params: AesGcmParams | AesCbcParams | AesCtrParams =
    algorithm === 'AES-GCM'
      ? { name: 'AES-GCM', iv, additionalData: aad }
      : algorithm === 'AES-CBC'
        ? { name: 'AES-CBC', iv }
        : { name: 'AES-CTR', counter: iv, length: 64 }
  try {
    return await crypto.subtle.decrypt(params, cryptoKey, result.ciphertext)
  } catch {
    throw new CryptoError('Decryption failed', 'DECRYPT_FAILED')
  }
}

export async function aesEncryptString(
  plaintext: string,
  key: string
): Promise<string> {
  const result = await aesEncrypt(plaintext, key)
  return `${base64Encode(result.iv)}.${base64Encode(result.ciphertext)}`
}

export async function aesDecryptString(payload: string, key: string): Promise<string> {
  const [ivBase64, cipherBase64] = payload.split('.')
  if (!ivBase64 || !cipherBase64) {
    throw new CryptoError('Invalid payload format', 'INVALID_INPUT')
  }
  const iv = base64Decode(ivBase64)
  const ciphertext = base64Decode(cipherBase64)
  const result = {
    iv: bytesToBuffer(iv),
    ciphertext: bytesToBuffer(ciphertext),
  }
  const decrypted = await aesDecrypt(result, key)
  return bufferToString(decrypted)
}

export async function deriveKeyFromPassword(
  password: string,
  salt: string | ArrayBuffer | Uint8Array,
  options: {
    keyLength?: AESKeyLength
    iterations?: number
    hash?: HashAlgorithm
  } = {}
): Promise<CryptoKey> {
  ensureCrypto()
  const { keyLength = 256, iterations = 100000, hash = 'SHA-256' } = options
  const saltData = typeof salt === 'string' ? stringToBuffer(salt) : toBuffer(salt)
  const baseKey = await crypto.subtle.importKey(
    'raw',
    stringToBuffer(password),
    'PBKDF2',
    false,
    ['deriveKey']
  )
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltData,
      iterations,
      hash,
    },
    baseKey,
    { name: 'AES-GCM', length: keyLength },
    false,
    ['encrypt', 'decrypt']
  )
}

export async function exportKey(key: CryptoKey): Promise<string> {
  ensureCrypto()
  const raw = await crypto.subtle.exportKey('raw', key)
  return base64Encode(raw)
}

export async function importKey(
  base64Key: string,
  algorithm: AESAlgorithm = 'AES-GCM'
): Promise<CryptoKey> {
  ensureCrypto()
  const keyData = toBuffer(base64Decode(base64Key))
  return crypto.subtle.importKey(
    'raw',
    keyData,
    { name: algorithm },
    false,
    ['encrypt', 'decrypt']
  )
}

function bufferToBase64(input: ArrayBuffer | Uint8Array): string {
  const bytes = input instanceof ArrayBuffer ? new Uint8Array(input) : input
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

function base64ToBuffer(input: string): Uint8Array {
  const binary = atob(input)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

export function base64Encode(input: string | ArrayBuffer | Uint8Array): string {
  if (typeof input === 'string') return bufferToBase64(stringToBuffer(input))
  return bufferToBase64(input)
}

export function base64Decode(input: string): Uint8Array {
  return base64ToBuffer(input)
}

export function base64UrlEncode(input: string | ArrayBuffer | Uint8Array): string {
  return base64Encode(input).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function base64UrlDecode(input: string): Uint8Array {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/')
  const padding = (4 - (padded.length % 4)) % 4
  return base64Decode(padded + '='.repeat(padding))
}

export function base64AutoDecode(input: string): Uint8Array {
  if (/[-_]/.test(input)) return base64UrlDecode(input)
  return base64Decode(input)
}

/** 生成随机字节 */
export function randomBytes(length: number): Uint8Array {
  return getRandomValues(new Uint8Array(length)) as Uint8Array
}

export function randomHex(length: number): string {
  return bufferToHex(bytesToBuffer(randomBytes(length / 2)))
}

const CHARSETS: Record<Charset, string> = {
  alphanumeric: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
  alpha: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  numeric: '0123456789',
  hex: '0123456789abcdef',
  base64: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_',
  all: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?',
}

export function randomString(length: number, charset: Charset = 'alphanumeric'): string {
  const chars = CHARSETS[charset]
  const bytes = randomBytes(length)
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length]
  }
  return result
}

function formatUUID(bytes: Uint8Array): string {
  const hex = bufferToHex(bytes.buffer as ArrayBuffer)
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

export function generateUUID(version: UUIDVersion = 'v4'): string {
  if (version === 'v4') {
    const bytes = randomBytes(16)
    bytes[6] = (bytes[6] & 0x0f) | 0x40
    bytes[8] = (bytes[8] & 0x3f) | 0x80
    return formatUUID(bytes)
  }
  if (version === 'v7') {
    const ts = Date.now()
    const bytes = new Uint8Array(16)
    bytes[0] = (ts >>> 40) & 0xff
    bytes[1] = (ts >>> 32) & 0xff
    bytes[2] = (ts >>> 24) & 0xff
    bytes[3] = (ts >>> 16) & 0xff
    bytes[4] = (ts >>> 8) & 0xff
    bytes[5] = ts & 0xff
    getRandomValues(bytes.subarray(6))
    bytes[6] = (bytes[6] & 0x0f) | 0x70
    bytes[8] = (bytes[8] & 0x3f) | 0x80
    return formatUUID(bytes)
  }
  throw new CryptoError('UUID v1 not implemented', 'UNSUPPORTED_ALGORITHM')
}

export function isValidUUID(uuid: string, version?: UUIDVersion): boolean {
  const pattern =
    version === 'v4'
      ? /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      : version === 'v7'
        ? /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
        : /^[0-9a-f]{8}-[0-9a-f]{4}-[1-9a-f][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return pattern.test(uuid)
}

export function nanoId(size = 21): string {
  return randomString(size, 'alphanumeric')
}

export function xorEncrypt(
  input: string | Uint8Array,
  key: string | Uint8Array
): Uint8Array {
  const data = typeof input === 'string' ? stringToBytes(input) : input
  const keyBytes = typeof key === 'string' ? stringToBytes(key) : key
  const result = new Uint8Array(data.length)
  for (let i = 0; i < data.length; i++) {
    result[i] = data[i] ^ keyBytes[i % keyBytes.length]
  }
  return result
}

export function xorDecrypt(input: Uint8Array, key: string | Uint8Array): Uint8Array {
  return xorEncrypt(input, key)
}

export function xorEncryptString(input: string, key: string): string {
  return base64UrlEncode(xorEncrypt(input, key))
}

export function xorDecryptString(input: string, key: string): string {
  return bytesToString(xorDecrypt(base64UrlDecode(input), key))
}

/** 字节数比较（常量时间，防时序攻击） */
export function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i]
  }
  return diff === 0
}

export function secureRandomInt(max: number): number {
  const bytes = randomBytes(4)
  const value = new DataView(bytes.buffer as ArrayBuffer).getUint32(0, true)
  return value % max
}

export function secureRandomRange(min: number, max: number): number {
  return min + secureRandomInt(max - min + 1)
}

export function secureShuffle<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = secureRandomInt(i + 1)
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}
