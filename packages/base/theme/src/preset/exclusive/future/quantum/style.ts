/**
 * Quantum 主题 · 自身样式补丁
 *
 * 主题定位：Future 视觉下的"量子主题"
 *   精确、冷峻、未来感
 *
 * 覆盖策略（相对 future 视觉）：
 *   - shadow 用青色光（量子）
 *   - 字号偏小（信息密集）
 *   - 字重偏轻（精确）
 */
import type { StylePatch } from '../../../types';

const quantumStyle: StylePatch = {
  shadow: {
    // 青色量子光
    sm: '0 0 8px rgba(6, 182, 212, 0.3)',
    md: '0 0 16px rgba(6, 182, 212, 0.4), 0 0 4px rgba(34, 211, 238, 0.3)',
    lg: '0 0 24px rgba(6, 182, 212, 0.5), 0 0 8px rgba(34, 211, 238, 0.4)',
    xl: '0 0 40px rgba(6, 182, 212, 0.6), 0 0 16px rgba(34, 211, 238, 0.5)',
  },
  font: {
    family: {
      mono: '"JetBrains Mono", "Fira Code", ui-monospace, monospace',
    },
    size: {
      // 量子屏字号更小更密集
      xs: '11px',
      sm: '13px',
      base: '14px',
      lg: '16px',
      xl: '18px',
      '2xl': '22px',
      '3xl': '28px',
      '4xl': '34px',
    },
    weight: {
      // 字重偏轻（精确）
      thin: 100,
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  motion: {
    duration: {
      // 瞬时响应
      fast: '80ms',
      normal: '180ms',
      slow: '320ms',
    },
    easing: {
      // 弹性 ease
      easeOut: 'cubic-bezier(0.16, 1, 0.3, 1)',
    },
  },
};

export default quantumStyle;