/**
 * Red 主题 · 自身样式补丁
 *
 * 主题定位：通用视觉下的"红色主题"
 *   热烈、警示、强调
 *
 * 覆盖策略（相对 common 视觉）：
 *   - radius 更小（更紧迫）
 *   - shadow 用红调（更强烈）
 *   - duration 略快（更敏感）
 */
import type { StylePatch } from '../../../types';

const redStyle: StylePatch = {
  radius: {
    sm: '2px',
    md: '6px',
    lg: '10px',
    xl: '14px',
  },
  shadow: {
    // 红色警示阴影
    sm: '0 1px 2px rgba(220, 38, 38, 0.10)',
    md: '0 4px 8px rgba(220, 38, 38, 0.16)',
    lg: '0 8px 24px rgba(220, 38, 38, 0.22)',
    xl: '0 16px 40px rgba(220, 38, 38, 0.28)',
  },
  motion: {
    duration: {
      fast: '80ms',
      normal: '200ms',
      slow: '360ms',
    },
  },
  opacity: {
    hover: 0.1,
    active: 0.2,
  },
};

export default redStyle;