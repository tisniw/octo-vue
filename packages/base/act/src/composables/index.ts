/**
 * composables 模块桶入口 (0.0.6 §11)
 *
 * 公开 API:
 * - 类型 8: UseFrameReturn / UseSpringReturn / UseScrollProgressReturn /
 *           UseInViewOptions / UseInViewReturn / UseMouseVelocityReturn /
 *           UseAdapterReturn / UsePhysicsBindingOptions
 * - 函数 8: useFrame / useSpring / useStagger / useScrollProgress /
 *           useInView / useMouseVelocity / useAdapter / usePhysicsBinding
 * - 注入键: ACT_DRIVER_KEY / ACT_PHYSICS_WORLD_KEY
 */
export type {
  UseFrameReturn,
  UseSpringReturn,
  UseScrollProgressReturn,
  UseInViewOptions,
  UseInViewReturn,
  UseMouseVelocityReturn,
  UseAdapterReturn,
  UsePhysicsBindingOptions,
} from './types.js'

// ACT_DRIVER_KEY / ACT_PHYSICS_WORLD_KEY 由 components 模块统一暴露,
// 避免与 components 重复导出冲突

export { useFrame } from './useFrame.js'
export { useSpring } from './useSpring.js'
export { useStagger } from './useStagger.js'
export { useScrollProgress } from './useScrollProgress.js'
export { useInView } from './useInView.js'
export { useMouseVelocity } from './useMouseVelocity.js'
export { useAdapter } from './useAdapter.js'
export { usePhysicsBinding } from './usePhysicsBinding.js'