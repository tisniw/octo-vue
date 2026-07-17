/**
 * Night 主题 · 自身样式补丁
 *
 * 主题定位：Dim 视觉下的"深夜主题"
 *   极致黑、低对比、深夜阅读
 *
 * 覆盖策略（相对 dim 视觉）：
 *   - shadow 极弱（避免刺眼）
 *   - opacity 更低（更静谧）
 *   - 不覆盖圆角/字体 → 继承 dim 视觉
 */
import type { StylePatch } from '../../../types';

const nightStyle: StylePatch = {
  shadow: {
    none: 'none',
    sm: 'none',
    md: '0 1px 4px rgba(0, 0, 0, 0.25)',
    lg: '0 2px 8px rgba(0, 0, 0, 0.35)',
    xl: '0 4px 16px rgba(0, 0, 0, 0.45)',
    '2xl': '0 8px 24px rgba(0, 0, 0, 0.55)',
  },
  opacity: {
    disabled: 0.25,
    hover: 0.04,
    active: 0.08,
    overlay: 0.75,
  },
};

export default nightStyle;