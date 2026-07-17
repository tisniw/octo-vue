/**
 * @octovue/background · preset 子模块入口
 *
 * DESIGN.md §三 目录结构、§十一 注册机制。
 *
 * preset 是「背景资源池」的物理组织层。每个背景一个独立目录：
 *
 *   preset/
 *   ├── {category}/{name}/
 *   │   ├── index.{ts,vue,tsx}      # default export BackgroundSpec
 *   │   ├── (附属 .ts / .glsl / .vue 等实现)
 *   │   └── assets/                # 资源目录，可空
 *
 * 当前阶段（P0 之前）仅占位，按 7 大分类建立子目录 + barrel 入口，
 * 实际 43 个预设按 P0~P5 阶段逐步填充。
 *
 * 自动扫描约定（DESIGN.md §11.1）：
 *   - 路径模式 `preset/{category}/{name}/index.{ts,vue,tsx}`
 *   - 每个文件 default export 一个 BackgroundSpec
 *   - 扫描到即注册到全局注册表
 *   - 未导出合法 spec 输出 warn，不阻断其他注册
 */

// 类型契约
export type {
  // 重新暴露，方便 preset 入口就近导入
} from '../core'