import type { SharedStyleTokens } from '../../../../theme/types.ts'

/**
 * tech 视觉共享策略
 *
 * 科技风格采用 double 双线边框 + subtle 圆角 + sans 字体 + flat 平面阴影 + border 边框装饰，
 * 动效采用快速节奏（80 / 160 / 260ms），响应数据密集型交互。
 */
export const techSharedStyle: SharedStyleTokens = {
  border: 'double',
  radius: 'subtle',
  fontFamily: 'sans',
  motion: {
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    duration: { fast: '80ms', base: '160ms', slow: '260ms' },
  },
  shadow: 'flat',
  decoration: 'border',
}

export const techSharedStyleMeta = {
  name: '科技',
  sn: 'tech',
} as const