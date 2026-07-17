/**
 * 3d 分类预设桶
 *
 * DESIGN.md §14.5，P5 阶段交付。
 *
 * 计划包含 3 个 Three.js 三维场景预设，每个独立目录：
 *   - cosmic/     → '3d-cosmic'        visuals: ['future','dim']
 *   - terrain/    → '3d-terrain'       visuals: ['natural','future']
 *   - city/       → '3d-city'          visuals: ['tech','cyber','future']
 *
 * 每个 3D 预设目录下需包含：
 *   - index.ts              # default export BackgroundSpec
 *   - engine.ts             # 引擎初始化（WebGL 探测 / DPR 限制）
 *   - scene.ts              # 场景搭建
 *   - camera.ts             # 相机控制
 *   - lights.ts             # 光源
 *   - assets/model/         # .glb / .gltf 模型
 *   - assets/shader/        # .glsl / .frag / .vert 着色器
 *
 * 命名约定：目录名 = 纯名，spec.id 前缀式 `3d-{name}`，避免与视觉名冲突。
 *
 * 当前阶段：仅占位 barrel。
 */

export type {} from '../../core'