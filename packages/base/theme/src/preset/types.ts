/**
 * Preset 主题类型定义
 *
 * 核心概念：
 *   - Visual  视觉层（共 9 种：auto/bright/common/cyber/dim/future/natural/tech/traditional）
 *   - Theme   主题层（视觉下的具体主题，如 common/blue、tech/terminal 等）
 *
 * 层级加载优先级（高 → 低）：
 *   1. 主题自身 style  Partial<ThemeStyleToken>  最高优先级
 *   2. 视觉层 style    Partial<ThemeStyleToken>  次级
 *   3. 通用默认 token  ThemeStyleToken           基础（defaultStyleToken）
 *
 * 颜色 token 不分视觉/主题层（只存主题层），但同样允许 Partial 覆盖。
 *   颜色合并优先级：主题 color > 默认 color
 */
import type { ThemeColorToken } from '../core/token/color';
import type { ThemeStyleToken } from '../core/token/style';

/* ─────────────────────────── 视觉枚举 ─────────────────────────── */

/** Preset 支持的 9 个视觉分类（与 exclusive 目录一一对应） */
export type PresetVisual =
  | 'auto'          // 自动（按时段/场景）
  | 'bright'        // 明亮（清新轻量）
  | 'common'        // 通用（百搭基准）
  | 'cyber'         // 赛博朋克（霓虹故障）
  | 'dim'           // 暗调（沉浸深色）
  | 'future'        // 未来（流光太空）
  | 'natural'       // 自然（有机森林）
  | 'tech'          // 科技（数据感）
  | 'traditional';  // 古风（水墨印章）

/** Preset 视觉中文名（UI 展示） */
export const PRESET_VISUAL_LABEL: Record<PresetVisual, string> = {
  auto: '自动',
  bright: '明亮',
  common: '通用',
  cyber: '赛博',
  dim: '暗调',
  future: '未来',
  natural: '自然',
  tech: '科技',
  traditional: '古风',
};

/* ────────────────────── 样式 token 部分覆盖类型 ────────────────────── */

/**
 * 深层 Partial：允许 style token 任意层级只填要覆盖的字段
 * 例：{ radius: { lg: '20px' } }  仅覆盖 radius.lg，其余继承视觉/默认
 */
export type DeepPartial<T> = T extends object
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : T;

/** 主题/视觉的样式补丁类型 */
export type StylePatch = DeepPartial<ThemeStyleToken>;

/* ──────────────────────── Preset 主题元数据 ──────────────────────── */

/**
 * Preset 主题元数据（统一规范）
 *
 * 只保留语义层面的三个字段：
 *   - sn         主题唯一标识，命名规则：{visual}-{slug}（与 themeVisualMap 的 key 对齐）
 *   - name       主题中文名（供 UI 展示）
 *   - description 主题描述（供 UI 展示）
 *
 * 其余字段归属说明：
 *   - visual   不在此处，来源是文件路径（exclusive 扫描产物 themeVisualMap）
 *   - enName   不在此处，目前 UI 不需要英文名
 *   - slug     不在此处，来源是文件路径
 *   - mode     不在此处，UI 层从视觉/颜色 token 推断
 *   - brand/accent/emoji  不在此处，颜色与表情从 color token / 视觉标签推导
 */
export interface PresetThemeMeta {
  /** 主题唯一标识，命名规则：{visual}-{slug} */
  sn: string;
  /** 主题中文名 */
  name: string;
  /** 主题描述 */
  description: string;
}

/* ────────────────────────── Preset 主题 ────────────────────────── */

/**
 * Preset 主题完整结构
 *
 * - color  颜色 token（可 Partial 覆盖，缺省走 defaultThemeColorToken）
 * - style  样式 token（可 Partial 覆盖，缺省走默认 → 视觉层 → 主题层）
 */
export interface PresetTheme {
  meta: PresetThemeMeta;
  color: Partial<ThemeColorToken> | ThemeColorToken;
  /** 主题自身的样式覆盖（最高优先级） */
  style?: StylePatch;
}

/* ─────────────────────── 视觉层样式 + 颜色 ─────────────────────── */

/**
 * 视觉层样式 + 颜色基线
 *
 * 视觉目录下 style.ts 直接导出一个 PresetVisualStyle,
 * 作为该视觉下所有主题的"风格基线"和"颜色基线"。
 *
 * 设计要点:
 *   - style  可选, 兼容老形态(视觉目录只填 style)
 *   - color  可选, 视觉层也能贡献颜色基线, 实现"同一 token、不同视觉不同实现"
 *   - 当 visual 同时提供 style + color 时, mergeColor 会把 visual.color 当作基线,
 *     再用 theme.color 做 Partial 覆盖
 */
export interface PresetVisualStyle {
  visual: PresetVisual;
  /** 该视觉的风格覆盖（次级优先级） */
  style?: StylePatch;
  /** 该视觉的颜色基线（次级优先级,合并时被 theme.color Partial 覆盖） */
  color?: Partial<ThemeColorToken>;
  /** 该视觉的中文描述（供 UI 展示） */
  description?: string;
}

/* ────────────────────── 解析后的完整样式 ────────────────────── */

/**
 * 主题样式解析结果
 *
 * 流程：defaultStyleToken ← visualStyle.style ← theme.style
 * 最终得到的完整 ThemeStyleToken，可直接交给 derive/style 生成 CSS 变量
 */
export interface ResolvedStyle {
  /** 解析后的视觉 */
  visual: PresetVisual;
  /** 解析后的主题 id（仅主题层有 id） */
  themeId?: string;
  /** 完整样式 token（继承 + 覆盖后的最终结果） */
  token: ThemeStyleToken;
  /** 调试：各层覆盖了多少字段（方便排错） */
  coverage: {
    /** 视觉层覆盖的字段路径计数 */
    visual: number;
    /** 主题层覆盖的字段路径计数 */
    theme: number;
  };
}

/* ─────────────────────── 字段路径工具类型 ─────────────────────── */

/**
 * 主题样式的字段路径
 * 用于编辑器提示、调试日志等场景
 *
 * @example 'radius.lg' | 'motion.duration.fast' | 'font.family.sans'
 */
export type StylePath = string;

/* ──────────────────── 合并工具返回类型 ──────────────────── */

/** mergeStyle 函数的返回 */
export interface MergeStyleOptions {
  /** 主题自身的覆盖 */
  theme?: StylePatch;
  /** 视觉层的覆盖 */
  visual?: StylePatch;
}