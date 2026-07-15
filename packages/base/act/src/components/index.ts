/**
 * components 模块桶入口 (0.0.7 §6)
 *
 * 公开 API:
 * - 类型 3: AnimationHostProps / PhysicsLayerProps / ScrollSceneProps
 * - 组件 3: AnimationHost / PhysicsLayer / ScrollScene (SFC default export)
 * - 注入键: ACT_DRIVER_KEY / ACT_PHYSICS_WORLD_KEY
 */
export type {
  AnimationHostProps,
  PhysicsLayerProps,
  ScrollSceneProps,
} from './types.js'

export { ACT_DRIVER_KEY, ACT_PHYSICS_WORLD_KEY } from './types.js'

export { default as AnimationHost } from './AnimationHost.vue'
export { default as PhysicsLayer } from './PhysicsLayer.vue'
export { default as ScrollScene } from './ScrollScene.vue'