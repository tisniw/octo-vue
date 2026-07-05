// 工厂(同时导出类型与值 — 类型通过 factories 内的 export type 重新导出)
export * from './factories.js'

// 仅类型(类型文件中独有的)
export type { Shape, JsonShape } from './types.js'

export { serialize, deserialize } from './serialize.js'
