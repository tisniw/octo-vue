/**
 * Auto 切换策略
 *
 * 三种内置策略，根据"当前时间"算出应该使用的变体 ID：
 *   - day-night  ：按小时切换（06-18 用 light，18-06 用 dark）
 *   - season    ：按月份切换（3-5 春 / 6-8 夏 / 9-11 秋 / 12-2 冬）
 *   - combined  ：day-night + season 组合（如 winter-dusk）
 *
 * 用法：
 *   const strategy = createAutoStrategy('combined', manager, 'light')
 *   strategy.tick()                          // 计算并应用当前变体
 *   strategy.start() / strategy.stop()       // 启动/停止定时轮询
 */

import type { ThemeVariant } from './types.js'

export type AutoStrategyName = 'day-night' | 'season' | 'combined'

/**
 * 抽象策略接口
 */
export interface AutoStrategy {
  readonly name: AutoStrategyName
  /** 计算当前应该用哪个变体 ID（不应用，只计算） */
  resolve(now: Date): string
  /** 启动定时轮询（自动应用） */
  start(): void
  /** 停止定时轮询 */
  stop(): void
  /** 主动触发一次计算并应用 */
  tick(): void
}

/**
 * day-night：按小时切换
 *   06:00-17:59 → auto-dawn
 *   18:00-05:59 → auto-dusk
 */
export class DayNightStrategy implements AutoStrategy {
  readonly name = 'day-night' as const

  constructor(private applyFn: (variantId: string) => void) {}

  resolve(now: Date): string {
    const hour = now.getHours()
    return hour >= 6 && hour < 18 ? 'auto-dawn' : 'auto-dusk'
  }

  tick(): void {
    this.applyFn(this.resolve(new Date()))
  }

  start(): void {
    this.tick()
  }

  stop(): void {
    /* noop */
  }
}

/**
 * season：按月份切换
 *   3-5 月 → spring
 *   6-8 月 → summer
 *   9-11 月 → autumn
 *   12-2 月 → winter
 */
export class SeasonStrategy implements AutoStrategy {
  readonly name = 'season' as const

  constructor(private applyFn: (variantId: string) => void) {}

  resolve(now: Date): string {
    const m = now.getMonth() + 1 // 1-12
    if (m >= 3 && m <= 5) return 'spring'
    if (m >= 6 && m <= 8) return 'summer'
    if (m >= 9 && m <= 11) return 'autumn'
    return 'winter'
  }

  tick(): void {
    this.applyFn(this.resolve(new Date()))
  }

  start(): void {
    this.tick()
  }

  stop(): void {
    /* noop */
  }
}

/**
 * combined：day-night × season 组合
 *   例：winter 季节 + dusk 时段 → winter-dusk
 *   找不到组合变体时回退到 season 变体
 */
export class CombinedStrategy implements AutoStrategy {
  readonly name = 'combined' as const

  constructor(
    private applyFn: (variantId: string) => void,
    private hasVariant: (variantId: string) => boolean,
  ) {}

  resolve(now: Date): string {
    const season = new SeasonStrategy(() => {}).resolve(now) // 'spring' | 'summer' | 'autumn' | 'winter'
    const hour = now.getHours()
    const timeOfDay = hour >= 6 && hour < 18 ? 'dawn' : 'dusk'
    const combined = `${season}-${timeOfDay}`
    // 优先组合变体，回退到季节变体
    return this.hasVariant(combined) ? combined : season
  }

  tick(): void {
    this.applyFn(this.resolve(new Date()))
  }

  start(): void {
    this.tick()
  }

  stop(): void {
    /* noop */
  }
}

/**
 * 工厂：按名称创建策略
 */
export function createAutoStrategy(
  name: AutoStrategyName,
  applyFn: (variantId: string) => void,
  hasVariant?: (variantId: string) => boolean,
): AutoStrategy {
  if (name === 'day-night') return new DayNightStrategy(applyFn)
  if (name === 'season') return new SeasonStrategy(applyFn)
  return new CombinedStrategy(applyFn, hasVariant ?? (() => false))
}