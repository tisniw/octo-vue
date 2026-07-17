/**
 * Auto · SingleAxis 策略组 · 单轴切换装配入口（薄入口）
 *
 * 设计定位：
 *   - 2 套主题（白天 / 黑夜）的色 token / meta / PresetTheme 组合
 *     分别在 light/ dark/ 子目录的 theme.ts 中
 *   - 本文件只负责「装配」：导入 2 套主题 + 提供决策函数
 *   - 决策依据：浏览器侧监听 prefers-color-scheme，缺省/SSR 回落为 light
 *
 * 暴露规则：
 *   - default 导出 = AutoStrategyMeta + custom（自定义细节）
 *   - 扫描层 extractCustom 会把 default 中除
 *     { id, name, enName, description, visual } 之外的字段塞进 `custom`
 */
import lightTheme from './light/theme';
import darkTheme from './dark/theme';
import type { PresetTheme } from '../../../types';

/* ───────────────────────── 单轴主题类型 ───────────────────────── */

/** 单轴值（light = 跟随系统明亮；dark = 跟随系统深色） */
export type SingleAxisMode = 'light' | 'dark';

/** SingleAxis 策略组的 custom 配置 */
export interface SingleAxisStrategyConfig {
  /** 白天主题 */
  lightTheme: PresetTheme;
  /** 黑夜主题 */
  darkTheme: PresetTheme;
  /**
   * 决策函数：根据显式传入或浏览器系统外观返回当前主题
   *
   * @param isDark 显式深色模式（可选）
   *               - 传 true / false：直接返回对应主题（用于测试或 SSR 注入）
   *               - 不传：浏览器侧读 matchMedia；非浏览器回落 light
   */
  resolveTheme: (isDark?: boolean) => PresetTheme;
}

/* ───────────────────────── 决策函数 ───────────────────────── */

/**
 * 决策函数：返回当前应激活的 PresetTheme
 *
 * 优先级：
 *   1. 显式参数 isDark（调用方控制，测试友好）
 *   2. 浏览器 matchMedia('(prefers-color-scheme: dark)')（生产自动响应）
 *   3. 非浏览器环境回落 light（SSR/Node 默认安全值）
 */
function resolveTheme(isDark?: boolean): PresetTheme {
  // 优先级 1：显式参数
  if (typeof isDark === 'boolean') {
    return isDark ? darkTheme : lightTheme;
  }
  // 优先级 2：浏览器系统外观
  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    return mql.matches ? darkTheme : lightTheme;
  }
  // 优先级 3：回落 light
  return lightTheme;
}

/* ───────────────────────── default 导出（策略组入口）───────────────────────── */

export default {
  // ── AutoStrategyMeta 部分（被扫描器识别，作为组骨架）──
  id: 'auto-single-axis',
  enName: 'single-axis',
  visual: 'auto' as const,
  name: '单轴切换',
  description: '依据单一信号（如系统深色模式）在白天/黑夜间自动切换',

  // ── custom 部分（被扫描器剥离，存进 custom 字段）──
  lightTheme,
  darkTheme,
  resolveTheme,
};