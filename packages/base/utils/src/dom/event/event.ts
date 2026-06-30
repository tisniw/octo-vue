type EventTarget = Element | Window | Document

/** 订阅事件（返回解绑函数） */
export function on<E extends keyof HTMLElementEventMap>(
  el: EventTarget,
  event: E,
  handler: (e: HTMLElementEventMap[E]) => void,
  options?: boolean | AddEventListenerOptions
): () => void
export function on(
  el: EventTarget,
  event: string,
  handler: (e: Event) => void,
  options?: boolean | AddEventListenerOptions
): () => void
export function on(
  el: EventTarget,
  event: string,
  handler: EventListener,
  options?: boolean | AddEventListenerOptions
): () => void {
  el.addEventListener(event, handler, options)
  return () => off(el, event, handler, options)
}

/** 解绑事件 */
export function off(
  el: EventTarget,
  event: string,
  handler: EventListener,
  options?: boolean | EventListenerOptions
): void {
  el.removeEventListener(event, handler, options)
}

/** 仅触发一次 */
export function once<E extends keyof HTMLElementEventMap>(
  el: EventTarget,
  event: E,
  handler: (e: HTMLElementEventMap[E]) => void
): () => void
export function once(
  el: EventTarget,
  event: string,
  handler: (e: Event) => void
): () => void
export function once(
  el: EventTarget,
  event: string,
  handler: EventListener
): () => void {
  const wrapper: EventListener = (e) => {
    off(el, event, wrapper)
    handler(e)
  }
  el.addEventListener(event, wrapper)
  return () => off(el, event, wrapper)
}

/** 触发自定义事件（返回是否触发成功） */
export function emit(el: EventTarget, event: string, detail?: unknown): boolean {
  const custom = createEvent(event, { detail })
  return el.dispatchEvent(custom)
}

/** 创建自定义事件对象（不立即触发） */
export function createEvent(type: string, init?: CustomEventInit): CustomEvent {
  return new CustomEvent(type, init)
}

const namespaceStore = new WeakMap<
  EventTarget,
  Map<string, { event: string; handler: EventListener; wrapper: EventListener }[]>
>()

function getNamespaceMap(
  el: EventTarget,
  namespace: string
): { event: string; handler: EventListener; wrapper: EventListener }[] {
  let map = namespaceStore.get(el)
  if (!map) {
    map = new Map()
    namespaceStore.set(el, map)
  }
  let list = map.get(namespace)
  if (!list) {
    list = []
    map.set(namespace, list)
  }
  return list
}

/** 带命名空间的订阅（便于批量解绑） */
export function onWithNamespace(
  el: EventTarget,
  namespace: string,
  events: string | string[],
  handler: (e: Event) => void
): () => void {
  const list = getNamespaceMap(el, namespace)
  const eventNames = Array.isArray(events) ? events : [events]

  for (const event of eventNames) {
    const wrapper: EventListener = (e) => handler(e)
    el.addEventListener(event, wrapper)
    list.push({ event, handler, wrapper })
  }

  return () => offByNamespace(el, namespace)
}

/** 按命名空间解绑所有事件 */
export function offByNamespace(el: EventTarget, namespace: string): void {
  const map = namespaceStore.get(el)
  if (!map) return
  const list = map.get(namespace)
  if (!list) return
  for (const { event, wrapper } of list) {
    el.removeEventListener(event, wrapper)
  }
  map.delete(namespace)
}

/** 事件代理（在祖先元素监听，过滤 selector 匹配的子元素） */
export function delegate(
  el: Element,
  selector: string,
  event: string,
  handler: (e: Event, target: Element) => void
): () => void {
  const wrapper = (e: Event) => {
    const target = e.target as Element
    if (target && target.closest(selector)) {
      handler(e, target.closest(selector) as Element)
    }
  }
  el.addEventListener(event, wrapper)
  return () => el.removeEventListener(event, wrapper)
}

/** 解绑事件代理 */
export function undelegate(
  el: Element,
  selector: string,
  event: string
): void {
  // 由于 delegate 返回闭包解绑函数，此处为兼容性保留
  // 实际使用建议保存 delegate 返回的解绑函数
}

/** 点击外部触发 */
export function onClickOutside(
  el: Element,
  handler: (e: MouseEvent) => void
): () => void {
  const wrapper = (e: MouseEvent) => {
    if (!el.contains(e.target as Node)) {
      handler(e)
    }
  }
  document.addEventListener('click', wrapper)
  return () => document.removeEventListener('click', wrapper)
}

/** Escape 键按下 */
export function onEscape(handler: (e: KeyboardEvent) => void): () => void {
  const wrapper = (e: KeyboardEvent) => {
    if (e.key === 'Escape') handler(e)
  }
  document.addEventListener('keydown', wrapper)
  return () => document.removeEventListener('keydown', wrapper)
}

/** 窗口尺寸变化 */
export function onResize(handler: (e: UIEvent) => void): () => void {
  window.addEventListener('resize', handler)
  return () => window.removeEventListener('resize', handler)
}

/** 滚动事件（throttled） */
export function onScroll(
  el: Element | Window,
  handler: (e: Event) => void,
  throttleMs = 16
): () => void {
  let last = 0
  let timer: ReturnType<typeof setTimeout> | null = null
  const wrapper = (e: Event) => {
    const now = Date.now()
    if (now - last >= throttleMs) {
      last = now
      handler(e)
      return
    }
    if (!timer) {
      timer = setTimeout(() => {
        timer = null
        handler(e)
      }, throttleMs - (now - last))
    }
  }
  el.addEventListener('scroll', wrapper)
  return () => el.removeEventListener('scroll', wrapper)
}
