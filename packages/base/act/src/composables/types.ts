/**
 * composables 模块类型定义 (0.0.6 §3-§10)
 *
 * 集中导出 8 个 composable 的所有返回类型 / 选项类型
 */
import type { Ref } from 'vue'
import type { Adapter } from '../engine-core/adapter/_adapter.js'
import type { AdapterId, AdapterState, ScrollDirection } from '../types.js'
import type { ScrollOptions, ScrollProgress } from '../engine-core/engines/index.js'

// ============================================================
// useFrame(0.0.6 §3)
// ============================================================

/** useFrame 返回 unsubscribe 函数 */
export type UseFrameReturn = () => void

// ============================================================
// useSpring(0.0.6 §4)
// ============================================================

export interface UseSpringReturn<T> {
  /** 当前值 */
  readonly value: Ref<T>
  /** 当前速度 */
  readonly velocity: Ref<number>
  /** 是否动画中 */
  readonly isAnimating: Ref<boolean>
  /** 设置新目标值(平滑过渡) */
  readonly setTarget: (v: T) => void
  /** 立即跳到目标 */
  readonly jump: (v: T) => void
  /** 停止动画(冻结在当前值) */
  readonly stop: () => void
}

// ============================================================
// useScrollProgress(0.0.6 §6)
// ============================================================

export interface UseScrollProgressReturn {
  /** 归一化进度 0-1 */
  readonly progress: Ref<number>
  /** 当前位置 px */
  readonly position: Ref<number>
  /** 当前速度 px/ms */
  readonly velocity: Ref<number>
  /** 当前方向 */
  readonly direction: Ref<ScrollDirection>
  /** 滚动到指定位置 */
  readonly scrollTo: (target: number, smooth?: boolean) => void
  /** 销毁 */
  readonly destroy: () => void
}

// ============================================================
// useInView(0.0.6 §7)
// ============================================================

export interface UseInViewOptions {
  /** 阈值 0-1 或阈值数组 */
  readonly threshold?: number | number[]
  /** 根元素 */
  readonly root?: HTMLElement | null
  /** 根边距 */
  readonly rootMargin?: string
  /** 是否只触发一次 */
  readonly once?: boolean
}

export interface UseInViewReturn {
  /** 是否进入视口 */
  readonly inView: Ref<boolean>
  /** 进入比例 */
  readonly ratio: Ref<number>
  /** 停止观察 */
  readonly stop: () => void
}

// ============================================================
// useMouseVelocity(0.0.6 §8)
// ============================================================

export interface UseMouseVelocityReturn {
  /** x 方向速度 px/ms */
  readonly vx: Ref<number>
  /** y 方向速度 px/ms */
  readonly vy: Ref<number>
  /** 速度大小 */
  readonly speed: Ref<number>
}

// ============================================================
// useAdapter(0.0.6 §9)
// ============================================================

export interface UseAdapterReturn {
  /** adapter 实例(可能为 null) */
  readonly adapter: Ref<Adapter | null>
  /** 加载状态 */
  readonly state: Ref<AdapterState>
  /** 加载错误 */
  readonly error: Ref<Error | null>
  /** 手动重试 */
  readonly reload: () => Promise<void>
}

// ============================================================
// usePhysicsBinding(0.0.6 §10)
// ============================================================

export interface UsePhysicsBindingOptions<T = unknown> {
  /** 物理引擎 body */
  readonly body: Ref<unknown>
  /** 要绑定的属性名 */
  readonly prop: string
  /** 物理引擎类型 */
  readonly engine?: AdapterId
}

// ============================================================
// 模块级常量
// ============================================================

/** 注入键:Driver(供 AnimationHost 注入给子组件) */
export const ACT_DRIVER_KEY = 'act:driver' as const

/** 注入键:PhysicsWorld */
export const ACT_PHYSICS_WORLD_KEY = 'act:physics-world' as const

/** 重导出常用类型,便于消费方集中导入 */
export type { ScrollDirection, ScrollOptions, ScrollProgress }