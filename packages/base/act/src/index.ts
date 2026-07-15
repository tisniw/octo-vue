/**
 * @octovue/act 顶层桶入口 (0.0.8 §3)
 *
 * 完整公开 API 汇总:
 * - types: 包级品牌 / 枚举 / 错误基类
 * - engine-core/base: 基础原语
 * - engine-core/platform: 环境检测 / SSR / preload / fallback / perf
 * - engine-core/adapter: 适配器注册 / 加载 / 查询 (内部 + 公开子集)
 * - engine-core/engines: 驱动 / 帧时钟 / 弹簧驱动 / 滚动驱动 / 速度追踪
 * - easing: 25 缓动 + cubicBezier + spring + resolveEasing
 * - timeline: Timeline / Playhead / EventBus
 * - tween: 元素动画 / stagger / CSS Var / Transform / SVG / Path / Array / MotionPath / ViewTimeline / Morph / 3D
 * - compose: 编排(sequence / parallel / stagger / scrollDriven)
 * - composables: 8 个 Vue facade (useFrame / useSpring / useStagger / useScrollProgress / useInView / useMouseVelocity / useAdapter / usePhysicsBinding)
 * - components: 3 个 Vue 横切组件 (AnimationHost / PhysicsLayer / ScrollScene)
 * - init: 启动流程 + 默认 gsap adapter
 */
export type * from './types.js'
export * from './engine-core/base/index.js'
export * from './engine-core/platform/index.js'
export * from './engine-core/adapter/index.js'
export * from './engine-core/engines/index.js'
export * from './easing/index.js'
export * from './timeline/index.js'
export * from './tween/index.js'
export * from './compose/index.js'
export * from './composables/index.js'
export * from './components/index.js'
export * from './init/index.js'