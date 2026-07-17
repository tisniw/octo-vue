/**
 * Future 视觉 · 风格基线（流光太空 / 金属感）
 *
 * 设计定位：
 *   流光、金属、冷峻的高级感
 *   全息投影 / 太空舱 / 量子界面
 *
 * 风格特点：
 *   - 中等偏大圆角（流体感）
 *   - 强烈光晕阴影（青紫双色光）
 *   - 中速动效（精确响应）
 *   - 等宽 + 显示字体（科技）
 *   - 玻璃质感（更低 opacity）
 */
import type { StylePatch } from '../../types';

const futureStyle: StylePatch = {
  radius: {
    none: '0',
    sm: '6px',
    md: '14px',
    lg: '22px',
    xl: '28px',
    '2xl': '36px',
    full: '9999px',
  },
  shadow: {
    // 流光光晕：青紫渐变
    none: 'none',
    sm: '0 0 6px rgba(34, 211, 238, 0.25)',
    md: '0 4px 16px rgba(6, 182, 212, 0.35), 0 0 8px rgba(168, 85, 247, 0.2)',
    lg: '0 8px 32px rgba(6, 182, 212, 0.4), 0 0 16px rgba(168, 85, 247, 0.3)',
    xl: '0 16px 48px rgba(6, 182, 212, 0.5), 0 0 32px rgba(168, 85, 247, 0.4)',
    '2xl': '0 24px 64px rgba(6, 182, 212, 0.6), 0 0 48px rgba(168, 85, 247, 0.5)',
  },
  motion: {
    duration: {
      fast: '140ms',
      normal: '280ms',
      slow: '480ms',
    },
    easing: {
      // 弹性 ease-out
      easeOut: 'cubic-bezier(0.22, 1, 0.36, 1)',
      easeInOut: 'cubic-bezier(0.65, 0, 0.35, 1)',
    },
  },
  font: {
    family: {
      display: '"Rajdhani", "Orbitron", system-ui, sans-serif',
      mono: '"Space Mono", ui-monospace, monospace',
    },
    lineHeight: {
      tight: 1.2,
      snug: 1.35,
      normal: 1.5,
      relaxed: 1.65,
      loose: 1.8,
    },
  },
  opacity: {
    disabled: 0.35,
    hover: 0.1,
    active: 0.2,
    overlay: 0.6,
  },
};

export default futureStyle;