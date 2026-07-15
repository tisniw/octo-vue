/**
 * @octovue/widgets 统一入口
 *
 * 组件注册采用动态扫描机制：
 *   - plugins/register-all 调用各分类的 scanXxx() 函数
 *   - 每个分类扫描器返回 `{ tag, loader, cpns }` 三元组
 *   - 全注册通过 `app.component(tag, defineAsyncComponent(loader))` 完成
 *   - tag 命名规则：'o-' + 二级目录名（kebab-case）
 *
 * 本 barrel 仅暴露分类扫描器和分类元信息，不做静态组件导出。
 */

export { baseCategory, scanBaseComponents } from './ui'