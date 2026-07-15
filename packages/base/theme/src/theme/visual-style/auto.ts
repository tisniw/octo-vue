/**
 * Auto 变体注册：将 16 个 auto 主题作为 autoVariants 注入到每个 VisualStyle
 *
 * 16 个 auto 主题：
 *   - 4 季节：spring / summer / autumn / winter
 *   - 2 昼夜：auto-dawn / auto-dusk
 *   - 10 组合：{season}-{dawn|dusk}
 *
 * 每个 VisualStyle 注册相同的 16 个 autoVariants。
 * 消费方按当前 visual + 时段 + 季节用对应 auto 变体。
 */

import { createAutoStrategy, type AutoStrategyName } from '../auto-strategy.js'
import {
  springTheme, summerTheme, autumnTheme, winterTheme,
} from '../../presets/color/auto/season/index.js'
import {
  dawnTheme as autoDawnTheme, duskTheme as autoDuskTheme,
} from '../../presets/color/auto/day-night/index.js'
import {
  springDawnTheme, springDuskTheme,
  summerDawnTheme, summerDuskTheme,
  autumnDawnTheme, autumnDuskTheme,
  winterDawnTheme, winterDuskTheme,
} from '../../presets/color/auto/combined/index.js'
import type { AutoVariant, ThemeVariant } from '../types.js'

/**
 * 把主题包成 AutoVariant（带 triggerHint 提示）
 */
function autoVariant(id: string, label: string, themeConfig: any, hint: string): AutoVariant {
  return { id, label, themeConfig, triggerHint: hint }
}

/**
 * 完整的 16 个 auto 变体（按月份/小时触发）
 */
export const ALL_AUTO_VARIANTS: AutoVariant[] = [
  // 季节
  autoVariant('spring', '春', springTheme, '3-5 月'),
  autoVariant('summer', '夏', summerTheme, '6-8 月'),
  autoVariant('autumn', '秋', autumnTheme, '9-11 月'),
  autoVariant('winter', '冬', winterTheme, '12-2 月'),
  // 昼夜
  autoVariant('auto-dawn', '黎明', autoDawnTheme, '06:00-17:59'),
  autoVariant('auto-dusk', '黄昏', autoDuskTheme, '18:00-05:59'),
  // 组合
  autoVariant('spring-dawn', '春·黎明', springDawnTheme, '春季白天'),
  autoVariant('spring-dusk', '春·黄昏', springDuskTheme, '春季夜间'),
  autoVariant('summer-dawn', '夏·黎明', summerDawnTheme, '夏季白天'),
  autoVariant('summer-dusk', '夏·黄昏', summerDuskTheme, '夏季夜间'),
  autoVariant('autumn-dawn', '秋·黎明', autumnDawnTheme, '秋季白天'),
  autoVariant('autumn-dusk', '秋·黄昏', autumnDuskTheme, '秋季夜间'),
  autoVariant('winter-dawn', '冬·黎明', winterDawnTheme, '冬季白天'),
  autoVariant('winter-dusk', '冬·黄昏', winterDuskTheme, '冬季夜间'),
] as AutoVariant[]

/**
 * 启动某个 auto 策略
 *
 * 消费方调用：
 *   import { startAutoStrategy } from '@octovue/theme'
 *   const stop = startAutoStrategy('combined', manager, 'light')
 *   // ... 之后 stop() 取消轮询
 */
export function startAutoStrategy(
  name: AutoStrategyName,
  applyFn: (variantId: string) => void,
  hasVariant?: (variantId: string) => boolean,
): () => void {
  const strategy = createAutoStrategy(name, applyFn, hasVariant)
  strategy.start()
  return () => strategy.stop()
}