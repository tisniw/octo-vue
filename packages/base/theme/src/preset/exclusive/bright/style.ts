/**
 * Bright 视觉 · 风格 + 颜色基线
 *
 * 设计定位：
 *   明亮、清新、轻盈
 *   适合白天使用的产品级 UI
 *
 * 风格特点：
 *   - 较大圆角（柔和亲切）
 *   - 较轻阴影（不抢眼）
 *   - 偏快的动效（响应灵敏）
 *   - 宽松行高（更易读）
 *
 * 颜色基线：
 *   - 视觉层只提供"明亮系列"的颜色（白底 + 浅天蓝叠层 + 深蓝文本）
 *   - 任何具体主题（bright-sky 等）都基于这套基线再叠加自有覆盖
 *   - codeHighlight 也按"明亮底 + 高对比"的原则给一版参考，
 *     子主题可按需 Partial 覆盖
 */
import type { PresetVisualStyle } from '../../types';
import type { CodeHighlightColor, ThemeColorToken } from '../../../core/token/color';

/**
 * Bright 视觉下的 codeHighlight 基线（极浅蓝底 + 高对比）
 *
 * 设计原则：
 *   - 在白底/极浅天蓝背景下，token 颜色饱和度可以拉高，对比足
 *   - keyword/operator/正则: 深紫红 — 经典"关键字"色
 *   - 字符串 string: 深绿 — 与红蓝拉开色相
 *   - 数字 number / boolean / null / builtin / attr / property: 蓝
 *   - 函数 function / 类型 type / 变量 variable: 棕红
 *   - 标签 tag / CSS 选择器 selector: 绿
 *   - 注释 comment: 中灰
 *   - 标点 punctuation / 普通文本 plain: 近黑
 */
const brightCodeHighlight: CodeHighlightColor = {
  // 语言骨干（蓝紫红系）
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

/**
 * Bright 视觉的颜色基线（白底 + 浅天蓝叠层 + 深蓝文本）
 *
 * 仅给"明亮系列"的主题一版通用基线。
 * 子主题（sky 等）会在此之上 Partial 覆盖具体字段。
 */
const brightColor: Partial<ThemeColorToken> = {
  // 系统背景：白底 + 浅天蓝叠层
  background: {
    base: '#ffffff',
    primary: '#f8fafc',
    secondary: '#f1f5f9',
    tertiary: '#e2e8f0',
    elevated: '#ffffff',
  },

  // 文字：深色，在白底下对比足
  text: {
    primary: '#0f172a',
    secondary: '#334155',
    tertiary: '#64748b',
    inverse: '#ffffff',
    placeholder: '#94a3b8',
    onBrand: '#ffffff',
  },

  // 边框
  border: {
    primary: '#e2e8f0',
    secondary: '#f1f5f9',
    divider: '#f8fafc',
    dashed: '#94a3b8',
    outline: '#0ea5e9',
  },

  // 阴影
  shadow: {
    soft: 'rgba(15, 23, 42, 0.06)',
    medium: 'rgba(15, 23, 42, 0.10)',
    strong: 'rgba(15, 23, 42, 0.16)',
  },

  // 代码高亮
  codeHighlight: brightCodeHighlight,
};

const brightVisualStyle: PresetVisualStyle = {
  visual: 'bright',
  description: '明亮 · 清新轻盈',
  style: {
    radius: {
      sm: '6px',
      md: '12px',
      lg: '18px',
      xl: '24px',
      '2xl': '32px',
    },
    shadow: {
      // 阴影更轻、更柔和
      sm: '0 1px 2px rgba(0, 0, 0, 0.04)',
      md: '0 2px 8px rgba(0, 0, 0, 0.06)',
      lg: '0 8px 24px rgba(0, 0, 0, 0.08)',
      xl: '0 16px 32px rgba(0, 0, 0, 0.10)',
      '2xl': '0 24px 48px rgba(0, 0, 0, 0.12)',
    },
    motion: {
      duration: {
        fast: '100ms',
        normal: '200ms',
        slow: '320ms',
      },
      easing: {
        // 明快弹性
        easeOut: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
    font: {
      lineHeight: {
        tight: 1.25,
        snug: 1.4,
        normal: 1.6,
        relaxed: 1.75,
        loose: 1.9,
      },
    },
    opacity: {
      disabled: 0.35,
      hover: 0.06,
      active: 0.12,
      overlay: 0.4,
    },
  },
  color: brightColor,
};

export default brightVisualStyle;/**
 * Bright 视觉 · 风格基线
 *
 * 设计定位：
 *   明亮、清新、轻盈
 *   适合白天使用的产品级 UI
 *
 * 风格特点：
 *   - 较大圆角（柔和亲切）
 *   - 较轻阴影（不抢眼）
 *   - 偏快的动效（响应灵敏）
 *   - 宽松行高（更易读）
 */
import type { StylePatch } from '../../types';

const brightStyle: StylePatch = {
  radius: {
    sm: '6px',
    md: '12px',
    lg: '18px',
    xl: '24px',
    '2xl': '32px',
  },
  shadow: {
    // 阴影更轻、更柔和
    sm: '0 1px 2px rgba(0, 0, 0, 0.04)',
    md: '0 2px 8px rgba(0, 0, 0, 0.06)',
    lg: '0 8px 24px rgba(0, 0, 0, 0.08)',
    xl: '0 16px 32px rgba(0, 0, 0, 0.10)',
    '2xl': '0 24px 48px rgba(0, 0, 0, 0.12)',
  },
  motion: {
    duration: {
      fast: '100ms',
      normal: '200ms',
      slow: '320ms',
    },
    easing: {
      // 明快弹性
      easeOut: 'cubic-bezier(0.16, 1, 0.3, 1)',
    },
  },
  font: {
    lineHeight: {
      tight: 1.25,
      snug: 1.4,
      normal: 1.6,
      relaxed: 1.75,
      loose: 1.9,
    },
  },
  opacity: {
    disabled: 0.35,
    hover: 0.06,
    active: 0.12,
    overlay: 0.4,
  },
};

export default brightStyle;