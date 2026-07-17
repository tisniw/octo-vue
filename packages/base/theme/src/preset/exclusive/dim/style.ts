/**
 * Dim 视觉 · 风格基线（暗调 / 沉浸深色）
 *
 * 设计定位：
 *   沉浸、低对比、舒缓
 *   适合长时间阅读 / 编辑器 / 夜间工作
 *
 * 风格特点：
 *   - 中等圆角（不锋利也不浮夸）
 *   - 深色阴影（黑中带层次）
 *   - 缓慢动效（不打扰）
 *   - 较低透明度（避免刺眼）
 */
import type { StylePatch } from '../../types';

const dimStyle: StylePatch = {
  radius: {
    sm: '4px',
    md: '8px',
    lg: '14px',
    xl: '20px',
    '2xl': '28px',
  },
  shadow: {
    // 阴影更深、更柔、更黑
    sm: '0 1px 3px rgba(0, 0, 0, 0.25)',
    md: '0 4px 12px rgba(0, 0, 0, 0.4)',
    lg: '0 8px 24px rgba(0, 0, 0, 0.55)',
    xl: '0 16px 40px rgba(0, 0, 0, 0.65)',
    '2xl': '0 24px 56px rgba(0, 0, 0, 0.75)',
  },
  motion: {
    duration: {
      // 慢一点，避免刺眼
      fast: '160ms',
      normal: '320ms',
      slow: '560ms',
    },
  },
  font: {
    lineHeight: {
      tight: 1.25,
      snug: 1.4,
      normal: 1.55,
      relaxed: 1.7,
      loose: 1.85,
    },
  },
  opacity: {
    disabled: 0.3,
    hover: 0.06,
    active: 0.12,
    overlay: 0.65,
  },
};

export default dimStyle;