import type { SharedStyleTokens } from '../../../../theme/types.ts'

/**
 * dark 视觉共享策略
 *
 * 暗黑风格与 light 同构，
 * 仅阴影由 soft 切换为 ink 以增强深色场景下的视觉层次。
 */
export const darkSharedStyle: SharedStyleTokens = {
  border: 'solid',
  radius: 'subtle',
  fontFamily: 'sans',
  motion: {
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    duration: { fast: '100ms', base: '200ms', slow: '300ms' },
  },
  shadow: 'ink',
  decoration: 'minimal',
}

/**
 * dark 视觉元信息
 *
 * 视觉层通用展示数据：sn 用于跨视觉排序，name 用于用户界面展示。
 */
export const darkSharedStyleMeta = {
  name: '暗黑',
  sn: 'dark',
} as const