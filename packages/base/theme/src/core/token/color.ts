// 状态
export const colorStates = [
  'hover',
  'active',
  'focus',
  'selected',
  'disabled'
] as const;

export type ColorState = (typeof colorStates)[number];

// 语义
export type SemanticColor = {
  success: Omit<Record<ColorState, string>, 'disabled'>;// 成功
  warning: Omit<Record<ColorState, string>, 'disabled'>;// 警告
  error: Omit<Record<ColorState, string>, 'disabled'>;// 错误,可恢复
  danger: Omit<Record<ColorState, string>, 'disabled'>;// 危险,不可逆
  info: Omit<Record<ColorState, string>, 'disabled'>;// 信息 
};
export type ColorScaleRecord = Record<ColorScaleLevel, string>;


export const sharedColorState: Pick<Record<ColorState, string>, 'disabled'> = {
  disabled: '#a1a1aa',// 禁用态-默认共享
};

// 主题全局状态色值（通用状态 不区分语义角色）
export type StateColor = Record<ColorState, string>;

// 默认状态色值
export const defaultStateColor: StateColor = {
  hover: '#f4f4f5',
  active: '#d4d4d8',
  focus: '#e4e4e7',
  selected: '#e4e4e7',
  disabled: sharedColorState.disabled,
};



// 默认语义色
export const defaultSemanticColor: SemanticColor = {
  success: {
    hover: '#22c55e',
    active: '#15803d',
    focus: '#16a34a',
    selected: '#16a34a',
  },
  warning: {
    hover: '#f59e0b',
    active: '#b45309',
    focus: '#d97706',
    selected: '#d97706',
  },
  error: {
    hover: '#ef4444',
    active: '#b91c1c',
    focus: '#dc2626',
    selected: '#dc2626',
  },
  danger: {
    hover: '#dc2626',
    active: '#7f1d1d',
    focus: '#b91c1c',
    selected: '#b91c1c',
  },
  info: {
    hover: '#3b82f6',
    active: '#1d4ed8',
    focus: '#2563eb',
    selected: '#2563eb',
  },
};


// -------------------- 类型--------------------


// 全局系统背景
export type BackgroundColor = {
  base: string;// 基础
  primary: string;// 主要
  secondary: string;// 次要
  tertiary: string;// 第三
  elevated: string;// 提升
};

// 组件级别背景
export type ComponentColor = {
  base: string;// 基础
  primary: string;// 主要
  secondary: string;// 次要
  tertiary: string;// 第三
  elevated: string;// 提升
};
// 链接
export type LinkColor = {
  default: string;
  visited: string;
};

// 文字
export type TextColor = {
  primary: string;// 正文
  secondary: string;// 副标题
  tertiary: string;// 辅助文字
  inverse: string;// 反色
  placeholder: string;// 占位符
  onBrand: string;// 品牌底上的文字
};

// 边框
export type BorderColor = {
  primary: string;// 主边框
  secondary: string;// 次边框
  divider: string;// 分隔线
  dashed: string;// 虚线
  outline: string;// 轮廓
};
// 蒙层
export type OverlayColor = {
  overlay: string;// 整页蒙层
};



// 图表
export type DataVizColor = {
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;
  chart6: string;
  chart7: string;
  chart8: string;
  chart9: string;
  chart10: string;
  chart11: string;
  chart12: string;
  chart13: string;
  chart14: string;
  chart15: string;
  chart16: string;
  chart17: string;
  chart18: string;
};

// 选区
export type SelectionColor = {
  bg: string;// 背景
  text: string;// 文字
};

// 骨架屏
export type SkeletonColor = {
  base: string;// 底色
  shimmer: string;// 闪光
};

// 阴影
export type ShadowColor = {
  soft: string;// 弱
  medium: string;// 中
  strong: string;// 强
};

// 滚动条
export type ScrollbarColor = {
  track: string;// 轨道
  thumb: string;// 滑块
};

// 渐变
export type GradientColor = {
  brandFrom: string;// 品牌渐变起点
  brandVia: string;// 品牌渐变中点
  brandTo: string;// 品牌渐变终点
  accentFrom: string;// 强调渐变起点
  accentVia: string;// 强调渐变中点
  accentTo: string;// 强调渐变终点
};

// -------------------- 代码高亮 token 类型 --------------------

/**
 * 语法高亮的 token 类型清单（与 widgets/highlight/types.ts 的 HighlightTokenType 一一对应）
 *
 * 设计要点：
 *   - 完整覆盖 widgets 的 18 个语义 token 类型 + 1 个 plain（兜底）+ 1 个 background
 *   - 类型清单集中管理（避免散落多处），新增 token 时只改这里
 *   - 视觉/主题可以在 color.codeHighlight 上 Partial 覆盖任一字段
 */
export const codeHighlightTokenTypes = [
  'keyword',       // 关键字 if/for/return ...
  'string',        // 字符串字面量
  'number',        // 数字字面量
  'comment',       // 注释
  'regex',         // 正则
  'function',      // 函数名/方法名
  'variable',      // 普通变量
  'type',          // 类型/类名
  'tag',           // HTML/JSX 标签名
  'attr',          // HTML/JSX 属性名
  'operator',      // 操作符
  'punctuation',   // 标点符号
  'property',      // 属性访问符左侧
  'builtin',       // 内置常量/全局对象
  'boolean',       // true / false
  'null',          // null / undefined
  'selector',      // CSS 选择器
  'plain',         // 兜底（普通文本）
] as const;

export type CodeHighlightTokenType = (typeof codeHighlightTokenTypes)[number];

/**
 * 代码高亮配色 token
 *
 * - 每个 token type 对应一个颜色字段（key 名严格与 token type 一致）
 * - background 为代码块整体背景，与 text 系列区分开
 * - 字段值为 raw hex/rgba 字符串，由 generateOhlVars 派生为 --ohl-* CSS 变量
 */
export type CodeHighlightColor = {
  [K in CodeHighlightTokenType]: string;
} & {
  /** 代码块整体背景（不属于 token，单独存放） */
  background: string;
};

/**
 * 代码高亮 token 配色默认值（GitHub Light 风格）
 *
 * 设计定位：
 *   - 仅作为"visual/theme 都没填 codeHighlight"时的兜底
 *   - 通用、白底、对比适中，绝大多数主题都可以基于它二次微调
 *   - 真实业务中,默认由 visual.color.codeHighlight 覆盖,这里只是一个安全网
 *
 * 配色参考：GitHub Primer 调色板(light)
 *   - 关键字 keyword/operator/regex:  #cf222e 红
 *   - 字符串 string:                  #0a3069 深蓝
 *   - 数字 number/属性 attr/boolean:  #0550ae 蓝
 *   - 注释 comment:                   #6e7781 灰
 *   - 函数名 function:                #8250df 紫
 *   - 变量 variable/类型 type:        #953800 棕
 *   - 标签 tag/CSS 选择器 selector:   #116329 绿
 *   - 标点 plain/punctuation:         #24292f 近黑
 *   - 背景 background:                #ffffff 白
 */
export const defaultCodeHighlight: CodeHighlightColor = {
  keyword: '#cf222e',
  string: '#0a3069',
  number: '#0550ae',
  comment: '#6e7781',
  regex: '#cf222e',
  function: '#8250df',
  variable: '#953800',
  type: '#953800',
  tag: '#116329',
  attr: '#0550ae',
  operator: '#cf222e',
  punctuation: '#24292f',
  property: '#0550ae',
  builtin: '#0550ae',
  boolean: '#0550ae',
  null: '#0550ae',
  selector: '#116329',
  plain: '#24292f',
  background: '#ffffff',
};

// 主题语义状态 token（状态/语义专用,独立于颜色主题）
export type ThemeSemanticToken = SemanticColor;

// 主题颜色 token 完整结构
export type ThemeColorToken = {
  background: BackgroundColor;// 系统背景
  component: ComponentColor;// 组件背景
  overlay: OverlayColor;// 蒙层
  text: TextColor;// 文字
  link: LinkColor;// 链接
  border: BorderColor;// 边框
  dataViz: DataVizColor;// 图表色板
  selection: SelectionColor;// 选区
  skeleton: SkeletonColor;// 骨架屏
  shadow: ShadowColor;// 阴影
  scrollbar: ScrollbarColor;// 滚动条
  gradient: GradientColor;// 渐变
  state: StateColor;// 主题全局状态色值
  /** 代码高亮配色（含 18 种 token + background） */
  codeHighlight: CodeHighlightColor;
};

// -------------------- 基础色阶派生 配置 --------------------

// 色阶字面量清单 独立于对象版本的 ColorScaleRecord
export const colorScaleLevels = [
  '50',
  '100',
  '200',
  '300',
  '400',
  '500',
  '600',
  '700',
  '800',
  '900',
  '950',
] as const;

export type ColorScaleLevel = (typeof colorScaleLevels)[number];

// 色阶混合比例表
// 50/100/200/300/400：与 white 淡化，base 占比越小越浅
// 500：原值，100% base
// 600/700/800/900/950：与 black 加深，base 占比越小越深
export const scaleMixRatios: Record<ColorScaleLevel, number> = {
  50: 5,
  100: 12,
  200: 25,
  300: 40,
  400: 70,
  500: 100,
  600: 85,
  700: 70,
  800: 55,
  900: 35,
  950: 20,
};

// 基础颜色类型清单：参与基础色阶派生的类型
export const baseColorTypes = [
  'background',
  'component',
  'text',
  'link',
  'border',
  'overlay',
  'dataViz',
  'selection',
  'skeleton',
  'shadow',
  'scrollbar',
  'gradient',
] as const;

export type BaseColorType = (typeof baseColorTypes)[number];

// 主字段映射 每 type 对应一个代表性字段
// 状态/语义/组合 契约仅在主字段上展开 控制变量数
export const mainFieldsByType: Record<BaseColorType, string> = {
  text: 'primary',
  link: 'default',
  border: 'primary',
  background: 'base',
  component: 'base',
  overlay: 'overlay',
  dataViz: 'chart1',
  selection: 'bg',
  skeleton: 'base',
  shadow: 'soft',
  scrollbar: 'track',
  gradient: 'brandFrom',
};

// 语义基色策略 OR 11 阶展开的基色取 role 的哪个状态值
export const semanticBaseState: ColorState = 'focus';

// 基础色 CSS 变量名前缀
export const BASE_COLOR_VAR_PREFIX = '--oc';

// 取色阶混合方向
export function getScaleMixTarget(scale: ColorScaleLevel): 'white' | 'black' | 'theme' {
  if (scale === '500') return 'theme';
  return parseInt(scale, 10) < 500 ? 'white' : 'black';
}
