/**
 * tween 模块桶入口 (0.0.5 §5 + §7)
 *
 * 公开 API:
 * - 类型 16: TweenTarget / CssVarPrefix / TweenObjectTarget / TweenTargetResolved /
 *            TweenOptions / StaggerOptions / TweenHandle / TransformParts /
 *            SvgAttrKind / PathCommand / MorphVertex / NormalizedSegment /
 *            MotionPathOptions / ViewTimelineOptions / ViewTimelineProgress /
 *            ViewTimelineHandle / Layer3DOptions / CssValueParsed
 * - 函数 30: tween / fromTo / staggerTo / staggerFromTo / set /
 *            isTweenable / resolveTarget / isCssVarKey / resolveCssVarTarget /
 *            readCssVar / writeCssVar / parseCssValue / interpolateCssValue /
 *            isTransformKey / applyTransform / clearTransformState /
 *            isSvgAttr / interpolateSvgAttr /
 *            parsePath / stringifyPath / interpolatePath /
 *            parsePoints / stringifyPoints / interpolatePoints / interpolateArray /
 *            motionPath (applyMotionPathFrame) / createViewTimeline /
 *            morphPath / morphVertices / create3DLayer
 */
export type {
  TweenTarget,
  CssVarPrefix,
  TweenObjectTarget,
  TweenTargetResolved,
  TweenOptions,
  StaggerOptions,
  TweenHandle,
  TransformParts,
  SvgAttrKind,
  PathCommand,
  MorphVertex,
  NormalizedSegment,
  MotionPathOptions,
  ViewTimelineOptions,
  ViewTimelineProgress,
  ViewTimelineHandle,
  Layer3DOptions,
  CssValueParsed,
} from './types.js'

export { TWEEN_KIND, isTweenHandle } from './types.js'

export { TWEENABLE_PROPS, isTweenable } from './props.js'
export { computeStaggerOrder } from './stagger-order.js'
export type { StaggerFrom, StaggerGrid } from './stagger-order.js'

export {
  resolveTarget,
  isCssVarKey,
  resolveCssVarTarget,
  readCssVar,
  writeCssVar,
  parseCssValue,
  interpolateCssValue,
  readDOMProperty,
  writeTargetValue,
  writeCssValueToDom,
} from './targets.js'

export {
  isTransformKey,
  applyTransform,
  clearTransformState,
} from './transform.js'

export { isSvgAttr, interpolateSvgAttr } from './svg.js'

export { parsePath, stringifyPath, interpolatePath } from './path.js'

export {
  parsePoints,
  stringifyPoints,
  interpolatePoints,
  interpolateArray,
} from './array.js'

export {
  getMotionPathPoint,
  createMotionPathState,
  applyMotionPathFrame,
} from './motionPath.js'

export { createViewTimeline } from './viewTimeline.js'

export { morphPath, morphVertices } from './morph.js'

export { create3DLayer } from './transform3d.js'
export type { Layer3DHandle } from './transform3d.js'

export {
  tween,
  fromTo,
  staggerTo,
  staggerFromTo,
  set,
} from './Tween.js'