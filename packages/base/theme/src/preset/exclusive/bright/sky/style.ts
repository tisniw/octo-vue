/**
 * Sky 主题 · 自身样式补丁
 *
 * 主题定位：Bright 视觉下的"天空主题"
 *   通透、清亮、午后阳光
 *
 * 覆盖策略（相对 bright 视觉）：
 *   - shadow 加蓝天调
 *   - 行高更大（更舒展）
 *   - 不覆盖圆角/动效 → 继承 bright 视觉
 */
import type { StylePatch } from '../../../types';

const skyStyle: StylePatch = {
  shadow: {
    // 蓝天淡光阴影
    sm: '0 1px 2px rgba(14, 165, 233, 0.06)',
    md: '0 4px 12px rgba(14, 165, 233, 0.08)',
    lg: '0 8px 24px rgba(14, 165, 233, 0.12)',
    xl: '0 16px 40px rgba(14, 165, 233, 0.16)',
    '2xl': '0 24px 56px rgba(14, 165, 233, 0.20)',
  },
  font: {
    lineHeight: {
      tight: 1.3,
      snug: 1.45,
      normal: 1.7,
      relaxed: 1.9,
      loose: 2.05,
    },
  },
  opacity: {
    overlay: 0.3,
  },
};

export default skyStyle;