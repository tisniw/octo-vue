import type { SharedStyleTokens } from '../../../../theme/types.ts'

/**
 * ancient 视觉共享策略
 *
 * 古风风格采用 calligraphic 边框 / calligraphic 圆角 + kai 楷体字 + ink 墨色阴影 + seal 印章装饰，
 * 动效采用偏缓的 cubic-bezier(0.25, 1, 0.5, 1)，模拟墨迹在宣纸上的晕染节奏。
 */
export const ancientSharedStyle: SharedStyleTokens = {
  border: 'calligraphic',
  radius: 'calligraphic',
  fontFamily: 'kai',
  motion: {
    easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    duration: { fast: '160ms', base: '260ms', slow: '420ms' },
  },
  shadow: 'ink',
  decoration: 'seal',
}

export const ancientSharedStyleMeta = {
  name: '古风',
  sn: 'ancient',
} as const