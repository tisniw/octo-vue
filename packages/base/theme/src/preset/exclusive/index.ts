// Exclusive 扫描层 · 动态发现入口
//
// 两套独立的扫描机制，分别服务于两类完全不同的内容：
//
// 1) 普通视觉扫描（exhaustive scan）
//    扫描 8 个静态视觉目录，每个视觉目录下：
//      - style.ts           视觉层 StylePatch 基线（次级优先级）
//      - slug/style.ts      主题层 StylePatch 补丁（最高优先级）
//      - slug/theme.ts      主题完整 PresetTheme（含颜色 token + meta + style）
//    注册后存放在 visualStyles / themeStyles / themePresets 三个字典里。
//
// 2) 自动视觉扫描（group scan）
//    扫描 auto 目录下的策略子目录，每个子目录代表一个策略组：
//      - auto/style.ts             自动视觉的 StylePatch 基线（继承）
//      - auto/<strategy>/index.ts  策略组自定义入口（可选）
//    策略组的内部细节（时段表、阈值、调色板等）默认折叠在 custom 字段中，
//    仅在用户显式调用 getAutoStrategyDetail(id) 时才展开。
//
// 实现机制：
//   - 用 Vite 的 import.meta.glob 静态发现文件（编译期展开，运行时无成本）
//   - 不依赖 fs.readdir（兼容 SSR / 测试环境）
//   - 不强制每个主题目录都有 theme.ts（只有 style.ts 的也算合法）
//   - 自动视觉策略目录允许为空（仅注册组骨架，等用户后续填充）

import type { PresetVisual, PresetTheme, StylePatch } from '../types';
import type { ThemeColorToken } from '../../core/token/color';
import type {
  AutoStrategy,
  AutoStrategyMeta,
  AutoStrategyModule,
  ExclusiveScanResult,
  PresetThemeModule,
  PresetVisualStyleModule,
  StylePatchModule,
} from './types';

// ──────────────────────── 视觉目录约定 ────────────────────────

// 8 个普通视觉目录（auto 是独立处理）
// 与 PresetVisual 类型保持一一对应，
// 如需新增视觉，只需在 PresetVisual 联合类型里加一项，再加到这里
const VISUAL_DIRS = [
  'bright',
  'common',
  'cyber',
  'dim',
  'future',
  'natural',
  'tech',
  'traditional',
] as const satisfies readonly Exclude<PresetVisual, 'auto'>[];

// ──────────────────────── 默认策略元信息 ────────────────────────

// 5 个内置策略的默认元信息
// 如果策略目录下没有 index.ts（用户没有自定义入口），
// 就用这里的默认值兜底，保证策略组仍可被发现。
const DEFAULT_STRATEGY_META: Record<
  string,
  Pick<AutoStrategyMeta, 'name' | 'description'>
> = {
  'dusk-dawn': {
    name: '暮晨切换',
    description: '根据本地时间在白天/夜间主题间自动切换',
  },
  'multi-axis': {
    name: '多轴切换',
    description: '依据时间 + 系统外观 + 手动偏好多维度综合决策',
  },
  seasons: {
    name: '四季切换',
    description: '按公历月份映射到春夏秋冬四套主题',
  },
  'single-axis': {
    name: '单轴切换',
    description: '依据单一信号（如系统深色模式）切换',
  },
  'solar-terms': {
    name: '节气切换',
    description: '按中国传统 24 节气切换视觉风格',
  },
};

// 视觉层中文描述（兜底；preset/types.ts 里的 PRESET_VISUAL_LABEL 是名字，这里是描述）
const DEFAULT_VISUAL_DESCRIPTIONS: Record<PresetVisual, string> = {
  auto: '自适应 · 按时段/场景切换',
  bright: '明亮 · 清新轻盈',
  common: '通用 · 百搭基准',
  cyber: '赛博 · 霓虹故障',
  dim: '暗调 · 沉浸深色',
  future: '未来 · 流光太空',
  natural: '自然 · 有机森林',
  tech: '科技 · 数据硬朗',
  traditional: '古风 · 水墨印章',
};

// ──────────────────────── 工具函数 ────────────────────────

// 把 glob 模块对象转换成 StylePatch（优先 default 导出，否则整个对象）
function toStylePatch(mod: unknown): StylePatch {
  const m = mod as StylePatchModule | null | undefined;
  if (!m) return {};
  if (m.default && typeof m.default === 'object') return m.default as StylePatch;
  return m as unknown as StylePatch;
}

// 把 glob 模块对象转换成视觉层双字段（style + color）
// 兼容两种导出形态：
//   1) default 是 PresetVisualStyle { style, color, description, ... }（新形态）
//   2) default 是 StylePatch 本身（老形态，仅 style）
//   3) named 导出 { style, color, description }（兑底）
function toVisualStyleFile(mod: unknown): {
  style: StylePatch;
  color: Partial<ThemeColorToken>;
  description?: string;
} {
  const m = mod as PresetVisualStyleModule | null | undefined;
  const result: { style: StylePatch; color: Partial<ThemeColorToken>; description?: string } = {
    style: {},
    color: {},
  };
  if (!m) return result;
  const d = m.default;
  if (d && typeof d === 'object') {
    // 判断是否是 PresetVisualStyle（有 visual 字段 + style/color 可选）
    if ('visual' in d || 'style' in d || 'color' in d) {
      const v = d as { style?: StylePatch; color?: Partial<ThemeColorToken>; description?: string };
      result.style = v.style ?? {};
      result.color = v.color ?? {};
      if (v.description) result.description = v.description;
      return result;
    }
    // 老形态：default 就是 StylePatch
    result.style = d as StylePatch;
    return result;
  }
  // 兑底：named 导出
  result.style = (m.style as StylePatch) ?? {};
  result.color = m.color ?? {};
  if (m.description) result.description = m.description;
  return result;
}

// 把 glob 模块对象转换成 PresetTheme（多种导出形态兼容）
// 优先级：default > {slug}PresetTheme > presetTheme
function toPresetTheme(mod: unknown, slug: string): PresetTheme | undefined {
  const m = mod as PresetThemeModule | null | undefined;
  if (!m) return undefined;
  if (m.default) return m.default;
  const namedKey = `${slug}PresetTheme`;
  const named = m[namedKey] as PresetTheme | undefined;
  if (named) return named;
  if (m.presetTheme) return m.presetTheme;
  return undefined;
}

// 从 glob 路径中提取视觉目录名（路径的第一段）
function extractVisualFromPath(filePath: string): string {
  const m = filePath.match(/^\.\/([^/]+)\//);
  return m?.[1] ?? '';
}

// 从 glob 路径中提取主题 slug（视觉下的子目录名）
function extractSlugFromPath(filePath: string, visual: string): string {
  const re = new RegExp('^\\./' + visual + '/([^/]+)/');
  const m = filePath.match(re);
  return m?.[1] ?? '';
}

// ═══════════════════════ 普通视觉扫描 ═══════════════════════

// 普通视觉层 style.ts 扫描
// 匹配：./{visual}/style.ts
// 产物：Record<Visual, PresetVisualStyleModule>（双形态兼容：可能是 StylePatch 也可能是 PresetVisualStyle）
const visualStyleModules = import.meta.glob<PresetVisualStyleModule>(
  VISUAL_DIRS.map((v) => './' + v + '/style.ts'),
  { eager: true },
);

// 普通主题 style.ts 扫描
// 匹配：./{visual}/{slug}/style.ts
// 产物：Record<themeId, StylePatch> 其中 themeId = visual-slug
const themeStyleModules = import.meta.glob<StylePatchModule>(
  VISUAL_DIRS.map((v) => './' + v + '/*/style.ts'),
  { eager: true },
);

// 普通主题 theme.ts 扫描
// 匹配：./{visual}/{slug}/theme.ts
// 产物：Record<themeId, PresetTheme>
// 注意：theme.ts 是可选的（不是每个主题都有完整颜色 token 定义）
const themePresetModules = import.meta.glob<PresetThemeModule>(
  VISUAL_DIRS.map((v) => './' + v + '/*/theme.ts'),
  { eager: true },
);

// ═══════════════════════ 自动视觉扫描 ═══════════════════════

// 自动视觉基线 style.ts
// 作为该视觉下所有策略组共享的 StylePatch 基线
const autoBaseStyleModule = import.meta.glob<StylePatchModule>('./auto/style.ts', {
  eager: true,
});

// 自动视觉策略组入口 index.ts 扫描
// 匹配：./auto/{strategy}/index.ts
// 注意：策略组目录可以没有 index.ts（仍合法），此时 DEFAULT_STRATEGY_META 会兜底
const autoStrategyModules = import.meta.glob<AutoStrategyModule>('./auto/*/index.ts', {
  eager: true,
});

// ──────────────────────── 扫描执行 ────────────────────────

// 普通视觉层结果
function buildVisualStyles(): {
  style: Record<PresetVisual, StylePatch>;
  color: Record<PresetVisual, Partial<ThemeColorToken>>;
  description: Record<PresetVisual, string>;
} {
  const style = {} as Record<PresetVisual, StylePatch>;
  const color = {} as Record<PresetVisual, Partial<ThemeColorToken>>;
  const description = { ...DEFAULT_VISUAL_DESCRIPTIONS } as Record<PresetVisual, string>;
  for (const v of VISUAL_DIRS) {
    const mod = visualStyleModules['./' + v + '/style.ts'];
    const parsed = toVisualStyleFile(mod);
    style[v] = parsed.style;
    color[v] = parsed.color;
    if (parsed.description) description[v] = parsed.description;
  }
  // auto 视觉的 StylePatch 基线单独处理
  const autoMod = autoBaseStyleModule['./auto/style.ts'];
  const autoParsed = toVisualStyleFile(autoMod);
  style.auto = autoParsed.style;
  color.auto = autoParsed.color;
  if (autoParsed.description) description.auto = autoParsed.description;
  return { style, color, description };
}

function buildThemeStyles(): Record<string, StylePatch> {
  const result: Record<string, StylePatch> = {};
  for (const filePath of Object.keys(themeStyleModules)) {
    const visual = extractVisualFromPath(filePath);
    const slug = extractSlugFromPath(filePath, visual);
    if (!visual || !slug) continue;
    const themeId = visual + '-' + slug;
    const mod = themeStyleModules[filePath];
    result[themeId] = toStylePatch(mod);
  }
  return result;
}

function buildThemePresets(): Record<string, PresetTheme> {
  const result: Record<string, PresetTheme> = {};
  for (const filePath of Object.keys(themePresetModules)) {
    const visual = extractVisualFromPath(filePath);
    const slug = extractSlugFromPath(filePath, visual);
    if (!visual || !slug) continue;
    const themeId = visual + '-' + slug;
    const mod = themePresetModules[filePath];
    const preset = toPresetTheme(mod, slug);
    if (preset) result[themeId] = preset;
  }
  return result;
}

function buildThemeVisualMap(
  themeStyles: Record<string, StylePatch>,
): Record<string, PresetVisual> {
  const result: Record<string, PresetVisual> = {};
  for (const themeId of Object.keys(themeStyles)) {
    const visual = themeId.split('-')[0] as PresetVisual;
    if ((VISUAL_DIRS as readonly string[]).includes(visual)) {
      result[themeId] = visual;
    }
  }
  return result;
}

// 自动视觉策略组结果

// 从策略模块导出推断 AutoStrategyMeta
// 优先级：用户 default 导出 > named exports > DEFAULT_STRATEGY_META 兜底
function inferStrategyMeta(
  slug: string,
  mod: AutoStrategyModule | undefined,
): AutoStrategyMeta {
  const id = 'auto-' + slug;
  const enName = slug;
  const fallback = DEFAULT_STRATEGY_META[slug];

  const fallbackMeta: AutoStrategyMeta = {
    id,
    enName,
    visual: 'auto',
    name: fallback?.name ?? slug,
    description: fallback?.description ?? '策略组：' + slug,
  };

  if (!mod) return fallbackMeta;

  if (mod.default && typeof mod.default === 'object') {
    const d = mod.default as Partial<AutoStrategyMeta>;
    return {
      ...fallbackMeta,
      ...d,
      id,
      enName: d.enName ?? enName,
      visual: 'auto',
    };
  }

  const name =
    (typeof mod.default === 'object' && mod.default && (mod.default as { name?: string }).name) ||
    mod.name ||
    fallbackMeta.name;
  const description =
    (typeof mod.default === 'object' && mod.default && (mod.default as { description?: string }).description) ||
    mod.description ||
    fallbackMeta.description;

  return { ...fallbackMeta, name, description };
}

// 从策略模块导出提取 custom 细节字段
// custom 是策略组的实现细节，默认不展示给上层
function extractCustom(mod: AutoStrategyModule | undefined): unknown {
  if (!mod) return undefined;
  if (mod.default && typeof mod.default === 'object') {
    const d = mod.default as Record<string, unknown> & Partial<AutoStrategyMeta>;
    // 把元信息字段剔除，剩下的就是 custom
    const { id: _id, name: _name, enName: _en, description: _desc, visual: _v, ...rest } = d;
    if (Object.keys(rest).length > 0) return rest;
  }
  if ('config' in mod) return mod.config;
  return undefined;
}

function buildAutoStrategies(): Record<string, AutoStrategy> {
  const result: Record<string, AutoStrategy> = {};
  for (const [filePath, mod] of Object.entries(autoStrategyModules)) {
    const slug = extractSlugFromPath(filePath, 'auto');
    if (!slug) continue;
    const id = 'auto-' + slug;
    const meta = inferStrategyMeta(slug, mod as AutoStrategyModule | undefined);
    const custom = extractCustom(mod as AutoStrategyModule | undefined);
    result[id] = {
      ...meta,
      dir: 'auto/' + slug,
      custom,
    };
  }
  return result;
}

// ──────────────────────── 暴露扫描结果 ────────────────────────

// 一次性解构三个字典（保证三个字典描述完全一致）
const _visualResults = buildVisualStyles();

// 普通视觉 + auto 的 StylePatch 字典（向后兼容老 API）
export const visualStyles: Record<PresetVisual, StylePatch> = _visualResults.style;

// 视觉层颜色基线字典（key = PresetVisual, 老形态可能为空 {}）
export const visualColors: Record<PresetVisual, Partial<ThemeColorToken>> = _visualResults.color;

// 视觉层中文描述（UI 展示用, 优先以 style.ts 中 description 为准，兑底 DEFAULT_VISUAL_DESCRIPTIONS）
export const visualDescriptions: Record<PresetVisual, string> = _visualResults.description;

// 普通主题 StylePatch 字典
// 注意：不含 auto-* key（auto 视觉下没有主题概念，是策略组）
export const themeStyles: Record<string, StylePatch> = buildThemeStyles();

// 普通主题完整 PresetTheme 字典（含颜色 + meta + style）
// 不含 theme.ts 的主题不在这里（但仍在 themeStyles 里）
export const themePresets: Record<string, PresetTheme> = buildThemePresets();

// 主题 id → 所属 visual 反向映射
export const themeVisualMap: Record<string, PresetVisual> =
  buildThemeVisualMap(themeStyles);

// 自动视觉策略组字典（key = auto-{slug}）
export const autoStrategies: Record<string, AutoStrategy> = buildAutoStrategies();

// 自动视觉 StylePatch 基线（来自 auto/style.ts）
export const autoBaseStyle: StylePatch = visualStyles.auto;

// ──────────────────────── 查询 API ────────────────────────

// 校验主题 id 是否存在（普通主题）
export function hasThemePreset(themeId: string): boolean {
  return Object.prototype.hasOwnProperty.call(themePresets, themeId)
    || Object.prototype.hasOwnProperty.call(themeStyles, themeId);
}

// 取单个主题的完整 PresetTheme（无 theme.ts 时返回 undefined）
export function getThemePreset(themeId: string): PresetTheme | undefined {
  return themePresets[themeId];
}

// 校验策略组是否存在
export function hasAutoStrategy(id: string): boolean {
  return Object.prototype.hasOwnProperty.call(autoStrategies, id);
}

// 取单个策略组（仅组骨架，不含 custom 细节）
export function getAutoStrategy(id: string): AutoStrategyMeta | undefined {
  const s = autoStrategies[id];
  if (!s) return undefined;
  const { dir: _dir, custom: _custom, ...meta } = s;
  return meta;
}

// 取单个策略组的完整结构（含 custom 细节）
// 这是展开策略组内部配置的入口
export function getAutoStrategyDetail(id: string): AutoStrategy | undefined {
  return autoStrategies[id];
}

// 列所有策略组（仅组骨架）
export function listAutoStrategies(): AutoStrategyMeta[] {
  return Object.values(autoStrategies).map((s) => {
    const { dir: _dir, custom: _custom, ...meta } = s;
    return meta;
  });
}

// 列所有策略组的完整结构（含 custom）
// 仅在需要批量展开策略配置时调用
export function listAutoStrategyDetails(): AutoStrategy[] {
  return Object.values(autoStrategies);
}

// 列所有策略组 id（仅返回字符串 id 数组，便于上层遍历/订阅）
// 与 listThemeIds() 保持 API 对称
export function listAutoStrategyIds(): string[] {
  return Object.keys(autoStrategies).sort();
}

// ──────────────────────── 聚合导出 ────────────────────────

// 一站式获取所有扫描结果
export function scanExclusive(): ExclusiveScanResult {
  return {
    visualStyles,
    visualColors,
    visualDescriptions,
    themeStyles,
    themePresets,
    themeVisualMap,
    autoStrategies,
    autoBaseStyle,
  };
}

// ──────────────────────── 类型再导出 ────────────────────────

export type { AutoStrategy, AutoStrategyMeta } from './types';