// Matrix2D(类是值也是类型)
export { Matrix2D, multiply, invert, transpose, determinant } from './Matrix2D.js'

// Matrix3D(函数值 + 接口类型)
export * from './Matrix3D.js'

// 类型
export * from './types.js'

// 分解合成
export { decompose, compose as matrixCompose, equals, equals3D } from './decompose.js'

// 矩阵运算
export { applyPoint, applyVector } from './apply.js'

// 互转
export { matrix2DTo3D, matrix3DTo2D } from './convert.js'
