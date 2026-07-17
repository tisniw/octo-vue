/**
 * @theme · 主题组件主入口
 *
 * ─────────────────────────────────────────────────────────────────────
 *  设计哲学（核心 · 先看这里）
 * ─────────────────────────────────────────────────────────────────────
 *
 *  1. 主题 ≠ 简单 light / dark / auto 三态
 *      主题是一套"视觉 × 子主题"的产品级抽象：
 *        - Visual 层（9 个）: auto / bright / common / cyber / dim / future / natural / tech / traditional
 *        - Theme  层（每视觉下多个）: common-blue、cyber-neon、tech-terminal …N 套
 *      所以"主题设置"实际上是一个二维矩阵（视觉 + 子主题），绝不仅 3 个选项。
 *
 *  2. 颜色与样式都是"主题一阶公民"，统一在三套 token 上流转
 *        - Style token（间距 / 圆角 / 阴影 / 字体 / 动效 / 层级 / 透明度）
 *        - Color token（背景 / 组件 / 文字 / 链接 / 边框 / 图表 / 蒙层 / 选区 / 骨架 / 阴影色 / 滚动条 / 渐变 / 全局状态 / 代码高亮）
 *      合并规则（高 → 低）：
 *        final = merge(defaults, visualPatch, themePatch)
 *
 *  3. 颜色处理完全归主题包，组件层只消费 CSS 变量
 *      主题组件（当前包）输出 5 大命名空间的 CSS 变量：
 *        --oc-*    Object Color    (主题对象颜色: background / text / link / border ...)
 *        --os-*    State           (状态: hover / active / focus / selected / disabled)
 *        --or-*    Reference       (引用 / 语义基色: success / warning / error / danger / info)
 *        --osr-*   State + Ref     (语义 × 状态组合)
 *        --ohl-*   Highlight       (代码高亮 token 颜色 + background)
 *      业务组件（widgets/*）只能 var(--ohl-*) 消费，禁止 hardcode 颜色或自造主题模式。
 *
 *  4. 运行时由 manager 负责
 *      resolveAndApply → 三层合并 → 派生 CSS 变量 → 注入 :root
 *      配套：localStorage 持久化 / BroadcastChannel 跨标签同步 / Pinia 桥接 / 系统暗色跟随
 *
 * ─────────────────────────────────────────────────────────────────────
 *  分层入口
 * ─────────────────────────────────────────────────────────────────────
 *
 *  ./preset   静态资源：9 视觉 × N 主题 + 合并工具 + 派生器
 *  ./manager  运行时：解析 / 注入 / 持久化 / 跨标签 / Pinia 桥接
 *
 *  本文件仅做"门面"，不引入新逻辑。所有实现都在子模块中。
 *
 * ─────────────────────────────────────────────────────────────────────
 *  推荐使用流程
 * ─────────────────────────────────────────────────────────────────────
 *
 *   // main.ts
 *   import { bootstrapManager } from '@octovue/theme';
 *   bootstrapManager('common-blue');
 *
 *   // 任意组件切换主题
 *   import { resolveAndApply } from '@octovue/theme';
 *   resolveAndApply({ themeRef: makeThemeRef('cyber', 'neon') });
 *
 *   // UI 组件读取当前主题（响应式）
 *   import { useThemeBridge } from '@octovue/theme';
 *   useThemeBridge(themeStore);
 *
 *   // 派生 SCSS 消费主题变量
 *   .my-code { background: var(--ohl-background); color: var(--ohl-plain); }
 *   .my-code .keyword { color: var(--ohl-keyword); }
 */

/* ==========================  类型层  ========================== */

// ---- preset 层类型 ----
export type {
  PresetVisual,
  StylePatch,
  StylePath,
  PresetTheme,
  PresetThemeMeta,
  PresetVisualStyle,
  ResolvedStyle,
  MergeStyleOptions,
  DeepPartial,
} from './preset';
export { PRESET_VISUAL_LABEL } from './preset';

// ---- manager 层类型 ----
export type {
  ThemeRef,
  ApplyOptions,
  ApplyResult,
  ThemeSnapshot,
  ThemeListener,
  Unsubscribe,
  PersistedThemeState,
  SchedulerMode,
  ThemeChangeSource,
  BroadcastMessage,
  ThemeStoreLike,
  BridgeOptions,
  BridgeTeardown,
  ResolvedPresetStyle,
  SystemTheme,
  SchedulerConfig,
  ThemeScheduler,
} from './manager';

// ---- core/token 类型（外部若有需求可消费）----
export type {
  ThemeStyleToken,
  SpacingScale,
  RadiusScale,
  ShadowScale,
  MotionDuration,
  MotionEasing,
  FontFamily,
  FontSize,
  FontWeight,
  LineHeight,
  ZIndex,
  Opacity,
} from './core/token/style';
export type {
  ThemeColorToken,
  CodeHighlightColor,
  CodeHighlightTokenType,
  ColorState,
  SemanticColor,
  StateColor,
  BackgroundColor,
  ComponentColor,
  TextColor,
  BorderColor,
  LinkColor,
  OverlayColor,
  DataVizColor,
  SelectionColor,
  SkeletonColor,
  ShadowColor,
  ScrollbarColor,
  GradientColor,
  ColorScaleLevel,
  BaseColorType,
} from './core/token/color';

// ---- merge 类型 ----
export type { DebugSource, ResolvedColor } from './preset';
export type { AutoStrategy, AutoStrategyMeta } from './preset';

/* ==========================  Preset 资源  ========================== */

// ---- 扫描产物（9 视觉 × N 主题 × 5 auto 策略组）----
export {
  // 视觉层
  visualStyles,
  visualColors,
  visualDescriptions,
  PRESET_VISUAL_DESCRIPTION,
  // 主题层
  themePresets,
  themeStyles,
  themeVisualMap,
  // auto 视觉策略
  autoBaseStyle,
  autoStrategies,
  // 扫描层查询函数
  hasThemeStyle,
  hasThemePreset,
  listThemeIds,
  listAutoStrategies,
  listAutoStrategyDetails,
  listAutoStrategyIds,
} from './preset';

// ---- 便捷查询 API ----
export {
  getVisualStyle,
  getThemeStyle,
  getThemePreset,
  getVisualColor,
  resolvePresetStyle,
  resolvePresetColor,
  applyResolvedVars,
  applyResolvedColorVars,
} from './preset';

// ---- CSS 变量派生器（核心：颜色 / 代码高亮 / 样式 / 字体 / 动效 / 不透明度）----
export {
  generateOhlVars,
  generateColorVars,
  generateStyleVars,
  generateSpacingVars,
  generateRadiusVars,
  generateShadowVars,
  generateMotionVars,
  generateFontVars,
  generateZIndexVars,
  generateOpacityVars,
} from './preset';

// ---- 三层合并工具 ----
export {
  deepMerge,
  mergeStyle,
  resolveStyle,
  mergeColor,
  resolveColor,
  debugStyle,
  debugColor,
  countLeaves,
} from './preset';

/* ==========================  Manager 运行时  ========================== */

// ---- 主题 ref 工具（sn ↔ ThemeRef ↔ serialize）----
export {
  makeThemeRef,
  themeRefToSn,
  snToThemeRef,
  isThemeRef,
  themeRefsEqual,
  serializeThemeRef,
  deserializeThemeRef,
} from './manager';

// ---- 运行时核心 API ----
export {
  isValidThemeRef,
  resolveTheme,
  injectVars,
  resolveAndApply,
  getCurrentSnapshot,
  getCurrentThemeRef,
  getCurrentSn,
  onThemeChange,
  applySilently,
  __resetManagerState,
} from './manager';

// ---- 持久化（localStorage）----
export {
  STORAGE_KEY,
  isStorageAvailable,
  saveThemeState,
  loadThemeState,
  loadThemeRef,
  saveThemeRef,
  clearThemeState,
  migrateFromLegacyKey,
} from './manager';

// ---- 跨标签同步 / 系统主题跟随 ----
export {
  broadcastThemeChange,
  onBroadcastMessage,
  bindBroadcastSync,
  subscribeSystemTheme,
  createScheduler,
} from './manager';

// ---- Pinia / Store 桥接 + 一键启动 ----
export {
  bridgeToStore,
  useThemeBridge,
  replaceLegacyStore,
  bridgeWithBroadcast,
  bootstrapManager,
} from './manager';

/* ==========================  Core 默认值  ========================== */

// 通用兑底（任何视觉 / 主题都可以基于它二次微调）
export { defaultStyleToken } from './core/token/style';
export {
  defaultThemeColorToken,
  defaultCodeHighlight,
} from './core/token/color-defaults';
export {
  defaultStateColor,
  defaultSemanticColor,
} from './core/token/color';
