/**
 * 主题样式 token 类型定义 + 默认值
 * - 包含完整的样式 token 结构
 * - 提供基础默认样式（中性默认，可被任何视觉/主题覆盖）
 */

// 间距
export type SpacingScale = {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
};

// 圆角
export type RadiusScale = {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  full: string;
};

// 阴影
export type ShadowScale = {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
};

// 动效时长
export type MotionDuration = {
  fast: string;
  normal: string;
  slow: string;
};

// 动效缓动
export type MotionEasing = {
  linear: string;
  ease: string;
  easeIn: string;
  easeOut: string;
  easeInOut: string;
};

// 字号
export type FontSize = {
  xs: string;
  sm: string;
  base: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
};

// 字重
export type FontWeight = {
  thin: number;
  light: number;
  normal: number;
  medium: number;
  semibold: number;
  bold: number;
};

// 行高
export type LineHeight = {
  tight: number;
  snug: number;
  normal: number;
  relaxed: number;
  loose: number;
};

// 字体族
export type FontFamily = {
  sans: string;
  serif: string;
  mono: string;
  display: string;
};

// 层级
// 设计原则：从低到高覆盖完整 UI 场景，留足阶梯间隔便于扩展
//   -1           隐藏层（被覆盖）
//    0           系统页面背景（最低可见）
//   1-9          内容层（普通流 / 拾升 / 强调）
//   100-200      粘固层（sticky / fixed）
//   1000-1999    浮层（下拉 / 模态 / 提示 / 通知）
//   9999         最高优先级（紧急覆盖）
export type ZIndex = {
  hide: number; // 隐藏（在背景下面）
  background: number; // 系统页面背景（最低可见）
  base: number; // 普通内容流
  raised: number; // 轻微抬升（卡片）
  emphasis: number; // 强调（高亮当前项）
  sticky: number; // 粘性定位
  fixed: number; // 固定定位
  dropdown: number; // 下拉菜单
  select: number; // 选择器面板
  modalBackdrop: number; // 模态背景遮罩
  modal: number; // 模态对话框
  drawer: number; // 抽屉
  popover: number; // 弹出气泡
  tooltip: number; // 工具提示
  toast: number; // 轻提示
  notification: number; // 通知中心
  loading: number; // 全屏加载
  max: number; // 最高优先级
};

// 透明度
export type Opacity = {
  disabled: number;
  hover: number;
  active: number;
  overlay: number;
};

// 主题样式 token 完整结构
export type ThemeStyleToken = {
  spacing: SpacingScale;
  radius: RadiusScale;
  shadow: ShadowScale;
  motion: {
    duration: MotionDuration;
    easing: MotionEasing;
  };
  font: {
    family: FontFamily;
    size: FontSize;
    weight: FontWeight;
    lineHeight: LineHeight;
  };
  zIndex: ZIndex;
  opacity: Opacity;
};

// 默认样式 token（中性、平衡的默认样式，可被任何主题继承并覆盖）
export const defaultStyleToken: ThemeStyleToken = {
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
    '3xl': '64px',
    '4xl': '96px',
  },
  radius: {
    none: '0',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '24px',
    full: '9999px',
  },
  shadow: {
    none: 'none',
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px rgba(0, 0, 0, 0.07)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.12)',
    '2xl': '0 25px 50px rgba(0, 0, 0, 0.15)',
  },
  motion: {
    duration: {
      fast: '120ms',
      normal: '240ms',
      slow: '400ms',
    },
    easing: {
      linear: 'linear',
      ease: 'ease',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
  font: {
    family: {
      sans: 'system-ui, -apple-system, sans-serif',
      serif: 'Georgia, serif',
      mono: 'ui-monospace, monospace',
      display: 'system-ui, sans-serif',
    },
    size: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px',
      '4xl': '36px',
    },
    weight: {
      thin: 100,
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.2,
      snug: 1.35,
      normal: 1.5,
      relaxed: 1.65,
      loose: 1.8,
    },
  },
  zIndex: {
    hide: -1, // 隐藏（被覆盖）
    background: 0, // 系统页面背景（最低可见）
    base: 1, // 普通内容流
    raised: 2, // 轻微抬升（卡片）
    emphasis: 3, // 强调（高亮当前项）
    sticky: 100, // 粘性定位（页头/页脚）
    fixed: 200, // 固定定位（导航栏/悬浮按钮）
    dropdown: 1000, // 下拉菜单
    select: 1050, // 选择器面板
    modalBackdrop: 1100, // 模态背景遮罩
    modal: 1200, // 模态对话框
    drawer: 1250, // 抽屉
    popover: 1300, // 弹出气泡
    tooltip: 1400, // 工具提示
    toast: 1500, // 轻提示
    notification: 1600, // 通知中心
    loading: 1700, // 全屏加载
    max: 9999, // 最高优先级（紧急覆盖）
  },
  opacity: {
    disabled: 0.4,
    hover: 0.08,
    active: 0.16,
    overlay: 0.5,
  },
};