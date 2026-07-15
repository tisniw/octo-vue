import type { SharedStyleTokens } from '../../../../theme/types.ts'

/**
 * cyber 视觉共享策略
 *
 * 赛博风格采用 dashed 虚线边框 + round 圆角 + mono 等宽字 + glow 辉光阴影 + border 边框装饰，
 * 动效采用弹性 cubic-bezier(0.7, 0, 0.3, 1) + 急速节奏（60 / 120 / 200ms），强化霓虹脉冲感。
 */
export const cyberSharedStyle: SharedStyleTokens = {
  border: 'dashed',
  radius: 'round',
  fontFamily: 'mono',
  motion: {
    easing: 'cubic-bezier(0.7, 0, 0.3, 1)',
    duration: { fast: '60ms', base: '120ms', slow: '200ms' },
  },
  shadow: 'glow',
  decoration: 'border',
}

export const cyberSharedStyleMeta = {
  name: '赛博',
  sn: 'cyber',
} as const