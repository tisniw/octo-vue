/**
 * Tech 视觉 · 风格 + 颜色基线（科技 / 数据感）
 *
 * 设计定位：
 *   硬朗、精确、几何感
 *   数据看板 / 终端 / 卫星 / 全息
 *
 * 风格特点：
 *   - 小圆角（硬朗几何）
 *   - 明显阴影（精确层级）
 *   - 中速动效（精准响应）
 *   - 等宽字体（数据感）
 *   - 标准透明度
 *
 * 颜色基线：
 *   - 视觉层提供"冷调深灰 / 近黑"的硬朗基线
 *   - text 用冷白系，与 background 形成清晰对比
 *   - codeHighlight 走"终端感"：冷白底 + 青绿/琥珀对比组合
 */
import type { PresetVisualStyle } from '../../types';
import type { CodeHighlightColor, ThemeColorToken } from '../../../core/token/color';

/**
 * Tech 视觉下的 codeHighlight 基线（冷感终端风）
 *
 * 设计原则：
 *   - keyword / boolean / null / builtin: 琥珀黄 — 经典终端的"关键字黄"
 *   - string: 浅青绿 — 与黄拉开色相，不抢眼
 *   - number / attr / property: 冰蓝 — 中性数据感
 *   - function / type: 紫 — 突出"可调用实体"
 *   - tag / selector: 翠绿
 *   - comment: 中冷灰
 *   - punctuation / plain: 冷白
 *   - background: 近黑，与终端主题(tech-terminal)对齐
 */
const techCodeHighlight: CodeHighlightColor = {
  keyword: '#fbbf24',      // 琥珀黄
  string: '#7ee787',       // 浅青绿
  number: '#79c0ff',       // 冰蓝
  comment: '#6b7280',      // 中冷灰
  regex: '#fbbf24',        // 与 keyword 同系
  function: '#c4b5fd',     // 紫
  variable: '#e5e7eb',     // 冷白
  type: '#c4b5fd',         // 紫
  tag: '#34d399',          // 翠绿
  attr: '#79c0ff',         // 冰蓝
  operator: '#fbbf24',     // 琥珀黄
  punctuation: '#9ca3af',  // 中灰
  property: '#79c0ff',     // 冰蓝
  builtin: '#fbbf24',      // 琥珀黄
  boolean: '#fbbf24',      // 琥珀黄
  null: '#fbbf24',         // 琥珀黄
  selector: '#34d399',     // 翠绿
  plain: '#e5e7eb',        // 冷白
  background: '#0a0a0a',   // 近黑
};

/**
 * Tech 视觉的颜色基线（冷调深灰 / 近黑底 + 冷白文本）
 */
const techColor: Partial<ThemeColorToken> = {
  // 系统背景：近黑 + 冷灰叠层
  background: {
    base: '#0a0a0a',
    primary: '#111111',
    secondary: '#171717',
    tertiary: '#1f1f1f',
    elevated: '#1a1a1a',
  },

  // 文字：冷白系
  text: {
    primary: '#f8fafc',
    secondary: '#cbd5e1',
    tertiary: '#94a3b8',
    inverse: '#0a0a0a',
    placeholder: '#64748b',
    onBrand: '#ffffff',
  },

  // 边框
  border: {
    primary: '#1f2937',
    secondary: '#171717',
    divider: '#111111',
    dashed: '#475569',
    outline: '#38bdf8',
  },

  // 阴影：冷调黑
  shadow: {
    soft: 'rgba(15, 23, 42, 0.20)',
    medium: 'rgba(15, 23, 42, 0.35)',
    strong: 'rgba(15, 23, 42, 0.55)',
  },

  // 代码高亮：终端感
  codeHighlight: techCodeHighlight,
};

const techVisualStyle: PresetVisualStyle = {
  visual: 'tech',
  description: '科技 · 数据硬朗',
  style: {
    radius: {
      none: '0',
      sm: '3px',
      md: '6px',
      lg: '10px',
      xl: '14px',
      '2xl': '20px',
    },
    shadow: {
      // 蓝灰阴影，几何感
      none: 'none',
      sm: '0 1px 2px rgba(15, 23, 42, 0.08)',
      md: '0 2px 6px rgba(15, 23, 42, 0.12), 0 1px 2px rgba(15, 23, 42, 0.08)',
      lg: '0 4px 12px rgba(15, 23, 42, 0.15), 0 2px 4px rgba(15, 23, 42, 0.1)',
      xl: '0 8px 24px rgba(15, 23, 42, 0.18), 0 4px 8px rgba(15, 23, 42, 0.12)',
      '2xl': '0 16px 40px rgba(15, 23, 42, 0.22), 0 8px 16px rgba(15, 23, 42, 0.15)',
    },
    motion: {
      duration: {
        fast: '100ms',
        normal: '200ms',
        slow: '360ms',
      },
      easing: {
        // 精准 ease
        easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
        easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
        easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
    font: {
      family: {
        mono: 'ui-monospace, "SF Mono", Menlo, Monaco, "Cascadia Code", monospace',
        sans: '"Inter", system-ui, -apple-system, sans-serif',
      },
    },
    opacity: {
      disabled: 0.4,
      hover: 0.08,
      active: 0.16,
      overlay: 0.55,
    },
  },
  color: techColor,
};

export default techVisualStyle;/**
 * Tech 视觉 · 风格基线（科技 / 数据感）
 *
 * 设计定位：
 *   硬朗、精确、几何感
 *   数据看板 / 终端 / 卫星 / 全息
 *
 * 风格特点：
 *   - 小圆角（硬朗几何）
 *   - 明显阴影（精确层级）
 *   - 中速动效（精准响应）
 *   - 等宽字体（数据感）
 *   - 标准透明度
 */
import type { StylePatch } from '../../types';

const techStyle: StylePatch = {
  radius: {
    none: '0',
    sm: '3px',
    md: '6px',
    lg: '10px',
    xl: '14px',
    '2xl': '20px',
  },
  shadow: {
    // 蓝灰阴影，几何感
    none: 'none',
    sm: '0 1px 2px rgba(15, 23, 42, 0.08)',
    md: '0 2px 6px rgba(15, 23, 42, 0.12), 0 1px 2px rgba(15, 23, 42, 0.08)',
    lg: '0 4px 12px rgba(15, 23, 42, 0.15), 0 2px 4px rgba(15, 23, 42, 0.1)',
    xl: '0 8px 24px rgba(15, 23, 42, 0.18), 0 4px 8px rgba(15, 23, 42, 0.12)',
    '2xl': '0 16px 40px rgba(15, 23, 42, 0.22), 0 8px 16px rgba(15, 23, 42, 0.15)',
  },
  motion: {
    duration: {
      fast: '100ms',
      normal: '200ms',
      slow: '360ms',
    },
    easing: {
      // 精准 ease
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
  font: {
    family: {
      mono: 'ui-monospace, "SF Mono", Menlo, Monaco, "Cascadia Code", monospace',
      sans: '"Inter", system-ui, -apple-system, sans-serif',
    },
  },
  opacity: {
    disabled: 0.4,
    hover: 0.08,
    active: 0.16,
    overlay: 0.55,
  },
};

export default techStyle;