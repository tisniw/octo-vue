/**
 * Terminal 主题 · 自身样式补丁
 *
 * 主题定位：Tech 视觉下的"终端主题"
 *   硬朗、极小圆角、纯等宽字体
 *
 * 覆盖策略（相对 tech 视觉）：
 *   - radius 全部归零（终端感）
 *   - font.sans 强制等宽
 *   - duration 极快
 */
import type { StylePatch } from '../../../types';

const terminalStyle: StylePatch = {
  radius: {
    none: '0',
    sm: '0',
    md: '0',
    lg: '0',
    xl: '0',
    '2xl': '0',
    full: '0',
  },
  shadow: {
    // 终端无阴影或极轻
    none: 'none',
    sm: 'none',
    md: '0 0 0 1px rgba(34, 197, 94, 0.15)',
    lg: '0 0 0 1px rgba(34, 197, 94, 0.25)',
    xl: '0 0 0 1px rgba(34, 197, 94, 0.35)',
    '2xl': '0 0 0 1px rgba(34, 197, 94, 0.45)',
  },
  font: {
    family: {
      sans: 'ui-monospace, "SF Mono", Menlo, monospace',
      mono: 'ui-monospace, "SF Mono", Menlo, monospace',
      display: 'ui-monospace, "SF Mono", Menlo, monospace',
    },
    size: {
      // 终端字号更紧凑
      xs: '11px',
      sm: '13px',
      base: '14px',
      lg: '16px',
      xl: '18px',
      '2xl': '22px',
      '3xl': '28px',
      '4xl': '34px',
    },
  },
  motion: {
    duration: {
      // 瞬时响应
      fast: '20ms',
      normal: '60ms',
      slow: '120ms',
    },
  },
};

export default terminalStyle;