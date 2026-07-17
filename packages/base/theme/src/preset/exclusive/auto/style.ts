/**
 * Auto 视觉 · 风格基线
 *
 * 设计定位：
 *   自适应视觉组（按时段/场景切换）的中性基线
 *   不偏不倚，确保切换主题时不会有"风格突变"的违和感
 *
 * 字段覆盖说明：
 *   - duration 略微延后（让动画在自动切换时更"自然"）
 *   - 其他字段全部继承默认
 */
import type { StylePatch } from '../../types';

const autoStyle: StylePatch = {
  motion: {
    duration: {
      // 慢一点更柔和，避免时间切换时硬切
      fast: '140ms',
      normal: '280ms',
      slow: '480ms',
    },
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
};

export default autoStyle;