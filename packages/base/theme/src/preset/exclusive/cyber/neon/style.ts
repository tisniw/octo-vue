/**
 * Neon 主题 · 自身样式补丁
 *
 * 主题定位：Cyber 视觉下的"霓虹紫粉"
 *   强烈霓虹光晕、故障风
 *
 * 覆盖策略（相对 cyber 视觉）：
 *   - shadow 用更强烈的紫粉光
 *   - display 字体用 Orbitron（赛博朋克显示）
 *   - 不覆盖圆角 → 继承 cyber 视觉的硬朗小圆角
 */
import type { StylePatch } from '../../../types';

const neonStyle: StylePatch = {
  shadow: {
    // 紫粉霓虹光晕
    sm: '0 0 4px rgba(192, 132, 252, 0.5)',
    md: '0 0 12px rgba(236, 72, 153, 0.6), 0 0 24px rgba(192, 132, 252, 0.4)',
    lg: '0 0 24px rgba(236, 72, 153, 0.7), 0 0 48px rgba(192, 132, 252, 0.5)',
    xl: '0 0 40px rgba(236, 72, 153, 0.8), 0 0 80px rgba(192, 132, 252, 0.6)',
  },
  motion: {
    duration: {
      // 极快响应（霓虹闪烁）
      fast: '40ms',
      normal: '120ms',
      slow: '240ms',
    },
  },
  font: {
    family: {
      display: '"Orbitron", "Rajdhani", system-ui, sans-serif',
    },
    weight: {
      // 霓虹字体偏粗
      semibold: 700,
      bold: 800,
    },
  },
};

export default neonStyle;