/**
 * timeline 模块桶入口 (0.0.5 §3 + §7)
 *
 * 公开 API:
 * - 类型 13: PlayState / PlayDirection / TimelineEventType / TimelineEvent 联合 9 种 /
 *            TimelineListener / TimelineOptions / TimelineLabel / TimelinePosition /
 *            TimelineItem / Timeline / PlayheadOptions / Playhead
 * - 函数 2:  createPlayhead / createTimeline
 */
export type {
  PlayState,
  PlayDirection,
  TimelineEventType,
  TimelineUpdateEvent,
  TimelineCompleteEvent,
  TimelineSeekEvent,
  TimelineTimeScaleEvent,
  TimelineYoyoEvent,
  TimelineRepeatEvent,
  TimelineDurationEvent,
  TimelineLabelEvent,
  TimelineReverseEvent,
  TimelineSimpleEvent,
  TimelineEvent,
  TimelineListener,
  TimelineOptions,
  TimelineLabel,
  TimelinePosition,
  TimelineItem,
  Timeline,
} from './types.js'

export type { PlayheadOptions, Playhead } from './Playhead.js'

export { TIMELINE_KIND } from './types.js'

export { TimelineEventBus } from './events.js'
export { createPlayhead } from './Playhead.js'
export { createTimeline } from './Timeline.js'