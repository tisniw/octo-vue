/**
 * @octovue/icon 包入口
 *
 * 同时提供：
 *   - OIcon 组件（Vue 3 单文件组件）
 *   - 图标库注册 API（registerIconLibrary / getIconContent）
 *   - 内置 SVG 资源（通过子路径 ./assets/* 访问）
 *
 * 资源命名格式：{主目录}-{风格?}-{图标名}
 *   例如：'static-base-home' / 'animated-loading'
 */

export * from './o-icon'