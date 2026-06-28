/** 进度事件 */
export interface ProgressEvent {
  /** 已传输字节数 */
  loaded: number
  /** 总字节数(可能为 0,表示未知) */
  total: number
  /** 已传输占比 [0, 1] */
  ratio: number
  /** 速度(字节/秒) */
  speed?: number
  /** 预估剩余时间(秒) */
  eta?: number
}

/** 进度回调 */
export type ProgressCallback = (event: ProgressEvent) => void

/** 进度跟踪器配置 */
export interface ProgressTrackerConfig {
  /** 节流间隔(ms) */
  throttleMs?: number
  /** 启用速度/ETA 估算 */
  estimateSpeed?: boolean
}

/** 进度订阅句柄 */
export interface ProgressSubscription {
  unsubscribe(): void
}

/** 进度跟踪器 */
export interface ProgressTracker {
  on(callback: ProgressCallback): ProgressSubscription
  update(loaded: number, total?: number): void
  reset(): void
  readonly current: ProgressEvent | null
}

/** 创建进度跟踪器 */
export function createProgressTracker(config: ProgressTrackerConfig = {}): ProgressTracker {
  const { throttleMs = 100, estimateSpeed = true } = config
  const subscribers = new Set<ProgressCallback>()
  let lastEmitTime = 0
  let lastLoaded = 0
  let lastTime = 0
  let current: ProgressEvent | null = null

  const tracker: ProgressTracker = {
    on(callback) {
      subscribers.add(callback)
      if (current) callback(current)
      return {
        unsubscribe: () => subscribers.delete(callback),
      }
    },
    update(loaded, total = 0) {
      const now = Date.now()
      const ratio = total > 0 ? Math.min(loaded / total, 1) : 0
      let speed: number | undefined
      let eta: number | undefined

      if (estimateSpeed && lastTime > 0 && now > lastTime) {
        const bytesPerMs = (loaded - lastLoaded) / (now - lastTime)
        speed = bytesPerMs * 1000
        if (total > 0 && speed > 0) {
          eta = (total - loaded) / speed
        }
      }

      current = { loaded, total, ratio, speed, eta }
      lastLoaded = loaded
      lastTime = now

      // 节流
      if (now - lastEmitTime >= throttleMs || (total > 0 && loaded >= total)) {
        lastEmitTime = now
        subscribers.forEach((cb) => cb(current!))
      }
    },
    reset() {
      current = null
      lastLoaded = 0
      lastTime = 0
      lastEmitTime = 0
    },
    get current() {
      return current
    },
  }

  return tracker
}

/** 转换为 axios onUploadProgress 风格回调 */
export function asAxiosProgress(tracker: ProgressTracker) {
  return (event: { loaded: number; total?: number }) => {
    tracker.update(event.loaded, event.total ?? 0)
  }
}