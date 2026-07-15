import type { SharedStyleTokens } from '../../../../theme/types.ts'

/**
 * light 视觉共享策略
 *
 * 明亮风格采用 solid 边框 + subtle 圆角 + sans 字体 + soft 阴影 + minimal 装饰，
 * 动效采用通用 cubic-bezier(0.4, 0, 0.2, 1) 中性曲线。
 */
export const lightSharedStyle: SharedStyleTokens = {
  border: 'solid',
  radius: 'subtle',
  fontFamily: 'sans',
  motion: {
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    duration: { fast: '100ms', base: '200ms', slow: '300ms' },
  },
  shadow: 'soft',
  decoration: 'minimal',
}

export const lightSharedStyleMeta = {
  name: '明亮',
  sn: 'light',
} as const