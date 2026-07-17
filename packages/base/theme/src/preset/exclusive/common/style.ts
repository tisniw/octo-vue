/**
 * Common 视觉 · 风格基线（默认基准）
 *
 * 设计定位：
 *   通用、百搭、平衡
 *   该视觉下所有主题的"出厂默认"
 *
 * 覆盖策略：
 *   仅覆盖与 defaultStyleToken 不同的少量字段（如 duration 与 opacity）
 *   圆角/阴影/字体等核心风格保持默认，让主题自身去发挥特色
 */
import type { StylePatch } from '../../types';

const commonStyle: StylePatch = {
  motion: {
    duration: {
      fast: '120ms',
      normal: '240ms',
      slow: '400ms',
    },
  },
  opacity: {
    disabled: 0.4,
    hover: 0.08,
    active: 0.16,
    overlay: 0.5,
  },
};

export default commonStyle;