/**
 * Cyber 视觉 · 风格 + 颜色基线（赛博朋克 / 霓虹故障）
 *
 * 设计定位：
 *   锋利、极速、电子霓虹
 *   Y2K 千禧 / 故障风
 *
 * 风格特点：
 *   - 极小圆角（锋利硬朗）
 *   - 极快动效（电子脉冲感）
 *   - 强烈光晕阴影（霓虹光）
 *   - 透明度更低（科技质感）
 *   - 等宽字体（终端感）
 *
 * 颜色基线：
 *   - 视觉层提供"深紫黑底 + 霓虹紫粉"的赛博朋克基线
 *   - text 走紫粉霓虹系，与背景形成强烈对比
 *   - codeHighlight 强饱和霓虹色，每个 token 颜色都"发光"
 */
import type { PresetVisualStyle } from '../../types';
import type { CodeHighlightColor, ThemeColorToken } from '../../../core/token/color';

/**
 * Cyber 视觉下的 codeHighlight 基线（霓虹强对比）
 *
 * 设计原则：
 *   - keyword / regex / boolean / null: 霓虹粉 — 警示/重点
 *   - string: 霓虹青 — 与粉拉开色相
 *   - number / attr / property: 霓虹黄 — 高亮数值
 *   - function / type / variable: 霓虹紫 — 可调用实体
 *   - tag / selector: 霓虹绿
 *   - operator / builtin: 霓虹橙
 *   - comment: 紫灰
 *   - punctuation / plain: 浅紫粉
 *   - background: 深紫黑，与 neon 主题(cyber-neon)对齐
 */
const cyberCodeHighlight: CodeHighlightColor = {
  keyword: '#f0abfc',      // 霓虹粉
  string: '#22d3ee',       // 霓虹青
  number: '#fde047',       // 霓虹黄
  comment: '#7c3aed',      // 紫灰
  regex: '#f0abfc',        // 与 keyword 同系
  function: '#c4b5fd',     // 霓虹紫
  variable: '#fdf4ff',     // 浅紫粉
  type: '#c4b5fd',         // 霓虹紫
  tag: '#34d399',          // 霓虹绿
  attr: '#fde047',         // 霓虹黄
  operator: '#fb923c',     // 霓虹橙
  punctuation: '#e9d5ff',  // 浅紫
  property: '#fde047',     // 霓虹黄
  builtin: '#fb923c',      // 霓虹橙
  boolean: '#f0abfc',      // 霓虹粉
  null: '#f0abfc',         // 霓虹粉
  selector: '#34d399',     // 霓虹绿
  plain: '#fdf4ff',        // 浅紫粉
  background: '#0a0414',   // 深紫黑
};

/**
 * Cyber 视觉的颜色基线（深紫黑底 + 紫粉霓虹）
 */
const cyberColor: Partial<ThemeColorToken> = {
  // 系统背景：深紫黑底 + 紫红叠层
  background: {
    base: '#0a0414',
    primary: '#150828',
    secondary: '#1f0d3d',
    tertiary: '#2e1452',
    elevated: '#1a0a30',
  },

  // 文字：紫粉霓虹系
  text: {
    primary: '#fdf4ff',
    secondary: '#f5d0fe',
    tertiary: '#e879f9',
    inverse: '#0a0414',
    placeholder: '#7c3aed',
    onBrand: '#ffffff',
  },

  // 边框
  border: {
    primary: '#2e1452',
    secondary: '#1f0d3d',
    divider: '#150828',
    dashed: '#a78bfa',
    outline: '#e879f9',
  },

  // 阴影：霓虹紫粉光
  shadow: {
    soft: 'rgba(192, 132, 252, 0.25)',
    medium: 'rgba(236, 72, 153, 0.45)',
    strong: 'rgba(236, 72, 153, 0.65)',
  },

  // 代码高亮：霓虹风
  codeHighlight: cyberCodeHighlight,
};

const cyberVisualStyle: PresetVisualStyle = {
  visual: 'cyber',
  description: '赛博 · 霓虹故障',
  style: {
    radius: {
      none: '0',
      sm: '2px',
      md: '4px',
      lg: '6px',
      xl: '8px',
      '2xl': '12px',
    },
    shadow: {
      // 霓虹光晕：色彩鲜艳、强发光
      none: 'none',
      sm: '0 0 4px rgba(236, 72, 153, 0.4)',
      md: '0 0 8px rgba(236, 72, 153, 0.5), 0 0 16px rgba(34, 211, 238, 0.3)',
      lg: '0 0 12px rgba(236, 72, 153, 0.6), 0 0 24px rgba(34, 211, 238, 0.4)',
      xl: '0 0 20px rgba(236, 72, 153, 0.7), 0 0 40px rgba(34, 211, 238, 0.5)',
      '2xl': '0 0 32px rgba(236, 72, 153, 0.8), 0 0 64px rgba(34, 211, 238, 0.6)',
    },
    motion: {
      duration: {
        // 极速响应，电子脉冲
        fast: '60ms',
        normal: '160ms',
        slow: '280ms',
      },
      easing: {
        // 硬切（线性）
        linear: 'linear',
        easeIn: 'cubic-bezier(0.9, 0, 0.1, 1)',
        easeOut: 'cubic-bezier(0.9, 0, 0.1, 1)',
        easeInOut: 'steps(8, end)',
      },
    },
    font: {
      family: {
        mono: '"JetBrains Mono", "Fira Code", ui-monospace, monospace',
        display: '"Orbitron", system-ui, sans-serif',
      },
    },
    opacity: {
      disabled: 0.3,
      hover: 0.12,
      active: 0.24,
      overlay: 0.7,
    },
  },
  color: cyberColor,
};

export default cyberVisualStyle;/**
 * Cyber 视觉 · 风格基线（赛博朋克 / 霓虹故障）
 *
 * 设计定位：
 *   锋利、极速、电子霓虹
 *   Y2K 千禧 / 故障风
 *
 * 风格特点：
 *   - 极小圆角（锋利硬朗）
 *   - 极快动效（电子脉冲感）
 *   - 强烈光晕阴影（霓虹光）
 *   - 透明度更低（科技质感）
 *   - 等宽字体（终端感）
 */
import type { StylePatch } from '../../types';

const cyberStyle: StylePatch = {
  radius: {
    none: '0',
    sm: '2px',
    md: '4px',
    lg: '6px',
    xl: '8px',
    '2xl': '12px',
  },
  shadow: {
    // 霓虹光晕：色彩鲜艳、强发光
    none: 'none',
    sm: '0 0 4px rgba(236, 72, 153, 0.4)',
    md: '0 0 8px rgba(236, 72, 153, 0.5), 0 0 16px rgba(34, 211, 238, 0.3)',
    lg: '0 0 12px rgba(236, 72, 153, 0.6), 0 0 24px rgba(34, 211, 238, 0.4)',
    xl: '0 0 20px rgba(236, 72, 153, 0.7), 0 0 40px rgba(34, 211, 238, 0.5)',
    '2xl': '0 0 32px rgba(236, 72, 153, 0.8), 0 0 64px rgba(34, 211, 238, 0.6)',
  },
  motion: {
    duration: {
      // 极速响应，电子脉冲
      fast: '60ms',
      normal: '160ms',
      slow: '280ms',
    },
    easing: {
      // 硬切（线性）
      linear: 'linear',
      easeIn: 'cubic-bezier(0.9, 0, 0.1, 1)',
      easeOut: 'cubic-bezier(0.9, 0, 0.1, 1)',
      easeInOut: 'steps(8, end)',
    },
  },
  font: {
    family: {
      mono: '"JetBrains Mono", "Fira Code", ui-monospace, monospace',
      display: '"Orbitron", system-ui, sans-serif',
    },
  },
  opacity: {
    disabled: 0.3,
    hover: 0.12,
    active: 0.24,
    overlay: 0.7,
  },
};

export default cyberStyle;