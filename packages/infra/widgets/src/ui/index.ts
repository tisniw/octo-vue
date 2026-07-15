/**
 * UI 组件分类聚合
 *
 * 收集所有子分类的扫描器和元信息，由 plugins/register-all 统一调度。
 * 每个子分类（base / data / feedback / form / navigation）自行实现 scanXxx()。
 */

export { baseCategory, scanBaseComponents } from './base'