/**
 * Imperial 主题 · 自身样式补丁
 *
 * 主题定位：Traditional 视觉下的"帝王主题"
 *   印章红 + 金箔，威严端方
 *
 * 覆盖策略（相对 traditional 视觉）：
 *   - shadow 加金色光晕（皇家气派）
 *   - radius 略微加大（贵气）
 *   - 字重加强（庄重）
 */
import type { StylePatch } from '../../../types';

const imperialStyle: StylePatch = {
  radius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '18px',
    '2xl': '24px',
  },
  shadow: {
    // 金光晕染
    none: 'none',
    sm: '0 1px 2px rgba(168, 50, 74, 0.12), 0 0 4px rgba(212, 175, 55, 0.08)',
    md: '0 4px 12px rgba(168, 50, 74, 0.18), 0 0 8px rgba(212, 175, 55, 0.12)',
    lg: '0 8px 24px rgba(168, 50, 74, 0.22), 0 0 16px rgba(212, 175, 55, 0.15)',
    xl: '0 16px 40px rgba(168, 50, 74, 0.26), 0 0 32px rgba(212, 175, 55, 0.20)',
  },
  font: {
    weight: {
      // 帝王国风字重更沉
      normal: 400,
      medium: 600,
      semibold: 700,
      bold: 800,
    },
  },
};

export default imperialStyle;