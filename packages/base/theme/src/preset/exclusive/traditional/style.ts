/**
 * Traditional 视觉 · 风格基线（古风 / 水墨印章）
 *
 * 设计定位：
 *   典雅、方正、温润
 *   国风水墨 / 绢帛印章 / 青铜礼器
 *
 * 风格特点：
 *   - 小方正圆角（古典规制）
 *   - 暖金阴影（古铜色温润）
 *   - 长动效（徐徐展开）
 *   - 衬线/楷体（毛笔字感）
 *   - 较高行高（呼吸感）
 */
import type { StylePatch } from '../../types';

const traditionalStyle: StylePatch = {
  radius: {
    none: '0',
    sm: '2px',
    md: '4px',
    lg: '8px',
    xl: '12px',
    '2xl': '18px',
    full: '9999px',
  },
  shadow: {
    // 暖金古铜阴影：低饱和、深棕
    none: 'none',
    sm: '0 1px 2px rgba(120, 53, 15, 0.1)',
    md: '0 2px 8px rgba(120, 53, 15, 0.14)',
    lg: '0 6px 20px rgba(120, 53, 15, 0.18)',
    xl: '0 12px 32px rgba(120, 53, 15, 0.22)',
    '2xl': '0 20px 48px rgba(120, 53, 15, 0.26)',
  },
  motion: {
    duration: {
      // 长动效，徐徐展开
      fast: '200ms',
      normal: '400ms',
      slow: '700ms',
    },
    easing: {
      // 徐缓 ease
      easeIn: 'cubic-bezier(0.55, 0.05, 0.45, 0.95)',
      easeOut: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
      easeInOut: 'cubic-bezier(0.55, 0.05, 0.45, 0.95)',
    },
  },
  font: {
    family: {
      // 楷体 / 宋体（典雅）
      serif: '"STKaiti", "KaiTi", "Songti SC", "SimSun", Georgia, serif',
      sans: '"PingFang SC", "Microsoft YaHei", system-ui, sans-serif',
      display: '"STKaiti", "KaiTi", "Songti SC", serif',
    },
    lineHeight: {
      tight: 1.4,
      snug: 1.55,
      normal: 1.75,
      relaxed: 1.95,
      loose: 2.1,
    },
    weight: {
      // 字重更柔（楷体特性）
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  opacity: {
    disabled: 0.45,
    hover: 0.06,
    active: 0.12,
    overlay: 0.5,
  },
};

export default traditionalStyle;