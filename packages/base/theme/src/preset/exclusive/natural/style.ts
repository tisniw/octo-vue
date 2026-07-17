/**
 * Natural 视觉 · 风格基线（自然 / 有机森林）
 *
 * 设计定位：
 *   有机、柔和、亲近自然
 *   森林 / 沙漠 / 竹林 / 樱花
 *
 * 风格特点：
 *   - 大圆角（柔和有机）
 *   - 较轻阴影（接近自然光）
 *   - 长动效（缓慢展开）
 *   - 衬线字体（典雅）
 *   - 较高行高（呼吸感）
 */
import type { StylePatch } from '../../types';

const naturalStyle: StylePatch = {
  radius: {
    none: '0',
    sm: '6px',
    md: '14px',
    lg: '22px',
    xl: '32px',
    '2xl': '48px',
    full: '9999px',
  },
  shadow: {
    // 自然柔和阴影：偏向深绿/棕的低对比
    none: 'none',
    sm: '0 1px 3px rgba(31, 41, 55, 0.08)',
    md: '0 4px 12px rgba(31, 41, 55, 0.1)',
    lg: '0 8px 24px rgba(31, 41, 55, 0.12)',
    xl: '0 16px 36px rgba(31, 41, 55, 0.15)',
    '2xl': '0 24px 56px rgba(31, 41, 55, 0.18)',
  },
  motion: {
    duration: {
      // 长动效，慢节奏
      fast: '180ms',
      normal: '360ms',
      slow: '640ms',
    },
    easing: {
      // 柔缓的 ease
      easeIn: 'cubic-bezier(0.45, 0, 0.55, 1)',
      easeOut: 'cubic-bezier(0.25, 0.46, 0.45, 1)',
      easeInOut: 'cubic-bezier(0.45, 0, 0.55, 1)',
    },
  },
  font: {
    family: {
      // 衬线字体，更有机
      serif: '"Source Han Serif SC", "Songti SC", Georgia, serif',
      sans: '"Source Han Sans SC", system-ui, sans-serif',
      display: '"Ma Shan Zheng", "Source Han Serif SC", serif',
    },
    lineHeight: {
      tight: 1.3,
      snug: 1.45,
      normal: 1.65,
      relaxed: 1.85,
      loose: 2,
    },
  },
  opacity: {
    disabled: 0.4,
    hover: 0.07,
    active: 0.14,
    overlay: 0.45,
  },
};

export default naturalStyle;