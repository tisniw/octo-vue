/**
 * @octovue/utils 桶入口
 *
 * 导出约定：
 * 1. 按版本依赖顺序导出（0.0.1 → 0.0.7）
 * 2. 无名称冲突的模块使用 export *；冲突名称在子路径中保留完整 API
 * 3. 类型与值分别 export（便于 tree-shaking）
 */

// === 0.0.0 包级类型 ===
export * from './shared/types.js'

// === 0.0.1 函数工具分类（9 个子模块） ===
export * from './function/fn/index.js'
export * from './function/strings/index.js'
// numbers: isNumber 与 runtime/common 冲突，从 common 侧取类型守卫
export {
  clamp,
  inRange,
  round,
  random,
  randomFloat,
  padZero,
  formatNumber,
  isInteger,
  isFiniteNumber,
} from './function/numbers/index.js'
export * from './function/format/index.js'
export * from './function/arrays/index.js'
// object: isEmpty / invert 与其他模块冲突
export {
  deepClone,
  merge,
  pick,
  omit,
  pickBy,
  omitBy,
  get,
  set,
  has,
  getBy,
  mapValues,
  mapKeys,
  size,
  deepEqual,
  shallowEqual,
} from './function/object/index.js'
export * from './function/async/index.js'
export * from './function/classnames/index.js'
export * from './function/url/index.js'

// === 0.0.2 运行时检测分类（2 个子模块） ===
export * from './runtime/common/index.js'
export * from './runtime/browser/index.js'

// === 0.0.3 DOM 操作分类（3 个子模块） ===
export * from './dom/element/index.js'
// event: once 与 function/fn 冲突
export {
  on,
  off,
  emit,
  createEvent,
  onWithNamespace,
  offByNamespace,
  delegate,
  undelegate,
  onClickOutside,
  onEscape,
  onResize,
  onScroll,
} from './dom/event/index.js'
export * from './dom/style/index.js'

// === 0.0.4 颜色工具分类（1 个子模块） ===
// color: invert 与 function/object 冲突
export {
  parseColor,
  parseColorStrict,
  tryParseColor,
  toRgbObject,
  toHslObject,
  toHsvObject,
  toHex,
  toHexAlpha,
  lighten,
  darken,
  saturate,
  desaturate,
  grayscale,
  setAlpha,
  fadeIn,
  fadeOut,
  opaque,
  rotateHue,
  complement,
  triadic,
  tetradic,
  analogous,
  mix,
  overlay,
  screen,
  multiply,
  interpolate,
  contrastRatio,
  isReadable,
  getContrastColor,
  generatePalette,
  getColorName,
  isNamedColor,
} from './color/color/index.js'

// === 0.0.5 日期与农历分类（3 个子模块） ===
export * from './date/date/index.js'
export * from './date/lunar/index.js'
export * from './date/lunar-data/index.js'

// === 0.0.6 校验工具分类（2 个子模块） ===
export * from './validation/rules/index.js'
export * from './validation/validator/index.js'

// === 0.0.7 加密工具分类（1 个子模块） ===
// crypto: randomString 与 function/strings 冲突
export {
  CryptoError,
  isCryptoAvailable,
  isSubtleCryptoAvailable,
  ensureCrypto,
  getRandomValues,
  stringToBuffer,
  bufferToString,
  stringToBytes,
  bytesToString,
  bufferToBytes,
  bytesToBuffer,
  normalizeInput,
  bufferToHex,
  hexToBuffer,
  digest,
  sha1,
  sha256,
  sha384,
  sha512,
  sha256Buffer,
  sha512Buffer,
  hmacSHA256,
  hmacSHA512,
  generateAESKey,
  aesEncrypt,
  aesDecrypt,
  aesEncryptString,
  aesDecryptString,
  deriveKeyFromPassword,
  exportKey,
  importKey,
  base64Encode,
  base64Decode,
  base64UrlEncode,
  base64UrlDecode,
  base64AutoDecode,
  randomBytes,
  randomHex,
  generateUUID,
  isValidUUID,
  nanoId,
  xorEncrypt,
  xorDecrypt,
  xorEncryptString,
  xorDecryptString,
  constantTimeEqual,
  secureRandomInt,
  secureRandomRange,
  secureShuffle,
} from './crypto/crypto/index.js'
export type {
  HashInput,
  HashAlgorithm,
  AESKeyLength,
  AESAlgorithm,
  AESEncryptOptions,
  AESResult,
  CryptoErrorCode,
  Charset,
  UUIDVersion,
} from './crypto/crypto/index.js'

// === utils 桶版本号 ===
export const OCTOVUE_UTILS_VERSION = '0.1.0'
