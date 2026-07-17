/**
 * Blue 主题 · 自身样式补丁
 *
 * 主题定位：通用视觉下的"蓝色主题"
 *   冷静、专业、科技感
 *
 * 覆盖策略（相对 common 视觉）：
 *   - radius.lg 加大（更柔）
 *   - shadow 用蓝调（更冷）
 *   - 不覆盖动效/字体 → 继承 common 视觉基线
 *
 * 层级验证：
 *   defaultStyleToken → common/style → common/blue/style（本文件）
 *   本文件只覆盖 3 个字段，其余保持 visual 层值
 */
import type { StylePatch } from '../../../types';

const blueStyle: StylePatch = {
  radius: {
    lg: '14px',
    xl: '20px',
  },
  shadow: {
    // 冷蓝阴影
    sm: '0 1px 2px rgba(30, 64, 175, 0.06)',
    md: '0 4px 8px rgba(30, 64, 175, 0.10)',
    lg: '0 8px 24px rgba(30, 64, 175, 0.14)',
    xl: '0 16px 40px rgba(30, 64, 175, 0.18)',
  },
};

export default blueStyle;