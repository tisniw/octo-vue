import type { SharedStyleTokens } from '../../../../theme/types.ts'

/**
 * future 视觉共享策略
 *
 * 未来风格采用 dashed 虚线边框 + round 圆角 + sans 字体 + soft 柔光阴影 + minimal 极简装饰，
 * 动效采用弹性 cubic-bezier(0.16, 1, 0.3, 1) + 中速节奏（120 / 220 / 360ms），营造未来感的流畅过渡。
 */
export const futureSharedStyle: SharedStyleTokens = {
  border: 'dashed',
  radius: 'round',
  fontFamily: 'sans',
  motion: {
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
    duration: { fast: '120ms', base: '220ms', slow: '360ms' },
  },
  shadow: 'soft',
  decoration: 'minimal',
}

export const futureSharedStyleMeta = {
  name: '未来',
  sn: 'future',
} as const