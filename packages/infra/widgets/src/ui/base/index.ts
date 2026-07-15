/**
 * base 基础元件分类
 *
 * 动态扫描机制：
 *   - 扫描器扫面本目录（base/）下每个二级子目录
 *   - 每个二级目录（如 text/）即为一个组件目录
 *   - 从目录名拼接 `o-` 前缀得到组件 tag（如 text → o-text）
 *   - 组件入口约定为 `<二级目录>/index.vue`
 *   - 组件 cpns 工具/类型在 `<二级目录>/cpns/` 下，命名 `o-text/cpns/*`
 *
 * 注册流程：
 *   1. plugins/register-all 启动时调用 scanBaseComponents()
 *   2. 扫描器返回 `{ tag, loader, cpns }` 三元组数组
 *   3. 调用 `app.component(tag, defineAsyncComponent(loader))` 全注册
 *
 * 当前已注册的组件：
 *   - text  → o-text
 */

export interface ScannedComponent {
  /** 组件 tag 名（如 'o-text'） */
  tag: string
  /** 异步加载器，懒加载 .vue 文件 */
  loader: () => Promise<unknown>
  /** cpns 路径前缀（用于类型/工具按需导入） */
  cpns: string
}

/**
 * 扫描本目录下的二级目录
 *
 * 使用 Vite 的 import.meta.glob 实现真正的"动态扫描"：
 *   - 匹配 `./<二级目录>/index.vue`
 *   - 自动生成 tag = 'o-' + <二级目录名>
 *
 * 注意：import.meta.glob 是 Vite 专属特性，编译期展开；其他打包器需要替换实现。
 */
export const baseComponentDirs = import.meta.glob(
  './*/index.vue',
  { eager: false },
)

/**
 * 解析扫描结果：tag + loader + cpns 路径
 */
export function scanBaseComponents(): ScannedComponent[] {
  const result: ScannedComponent[] = []
  for (const [path, loader] of Object.entries(baseComponentDirs)) {
    // path 形如 './text/index.vue'，提取出 'text'
    const match = path.match(/^\.\/([^/]+)\/index\.vue$/)
    if (!match) continue
    const dirName = match[1]!
    result.push({
      tag: `o-${dirName}`,
      loader: loader as () => Promise<unknown>,
      cpns: `./${dirName}/cpns`,
    })
  }
  return result
}

/**
 * 分类元信息（供上层聚合）
 */
export const baseCategory = {
  name: 'base',
  label: '基础元件',
  prefix: 'o-',
  scan: scanBaseComponents,
} as const