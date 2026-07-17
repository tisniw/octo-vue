/**
 * Vue SFC 单文件组件类型声明
 *
 * 让 TypeScript 知道如何处理 .vue 文件的导入。
 * 任何 import 一个 .vue 文件都会得到一个 DefineComponent 类型的默认导出。
 */
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type
  const component: DefineComponent<{}, {}, any>
  export default component
}