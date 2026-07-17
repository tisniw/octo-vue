/**
 * Forest 主题 · 自身样式补丁
 *
 * 主题定位：Natural 视觉下的"森林主题"
 *   苍翠、绿意、参天
 *
 * 覆盖策略（相对 natural 视觉）：
 *   - shadow 用深绿调（林荫）
 *   - radius 进一步加大（更有机）
 *   - 字号略小（信息密度高）
 */
import type { StylePatch } from '../../../types';

const forestStyle: StylePatch = {
  radius: {
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '36px',
    '2xl': '56px',
  },
  shadow: {
    // 深绿林荫阴影
    sm: '0 1px 3px rgba(20, 83, 45, 0.10)',
    md: '0 4px 14px rgba(20, 83, 45, 0.14)',
    lg: '0 8px 28px rgba(20, 83, 45, 0.18)',
    xl: '0 16px 40px rgba(20, 83, 45, 0.22)',
  },
  font: {
    family: {
      // 森林配楷体更中式
      display: '"Ma Shan Zheng", "STKaiti", "Songti SC", serif',
    },
  },
};

export default forestStyle;