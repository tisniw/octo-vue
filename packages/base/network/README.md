# @octovue/network

> 类型安全、可组合的网络通信基础库 — 统一封装 HTTP / SSE / WebSocket 三种协议。

## ✨ 特性

- **命名空间风格 API** — `http.get` / `ws.connect` / `sse.acquire`,类似 axios 的心智模型
- **三个平铺命名空间** — `http` / `ws` / `sse`,各自独立、自洽、可发现
- **可选伞形聚合** — `network.http` / `network.ws` / `network.sse` 单导入风格
- **三种 HTTP 调用方式** — 直接方法 / 自定义实例 / 链式构造器
- **请求控制** — 取消 / 超时 / 重试 (指数退避) / 去重
- **拦截器体系** — 请求 / 响应 / 错误三类拦截器,支持全局与单次临时
- **错误体系** — 业务码解包 + 网络/服务端/客户端/业务错误自动分类
- **文件传输** — 上传 / 下载 + 订阅式进度跟踪
- **类型安全** — 完整的 TypeScript 类型,业务类型可参数化推断

## 📦 安装

```bash
pnpm add @octovue/network axios
# 或
yarn add @octovue/network axios
# 或
npm install @octovue/network axios
```

`axios` 是 peer dependency,因为 HTTP 客户端在底层使用 axios。

## 🚀 快速上手

### HTTP

```ts
import { http, HttpClient } from '@octovue/network'

// 默认全局实例:直接用
const user = await http.get<User>('/api/users/1')
const created = await http.post<User>('/api/users', { name: 'Alice' })

// 自定义实例(类似 axios.create)
const api = HttpClient.create({
  baseURL: 'https://api.example.com',
  timeout: 10000,
})

api.interceptors.request.use((config: any) => {
  config.headers.Authorization = `Bearer ${getToken()}`
  return config
})

await api.get<User[]>('/users', { params: { page: 1 } })

// 链式构造
const detail = await http.chain<User>('GET')
  .url('/api/users/1')
  .params({ include: 'profile' })
  .timeout(5000)
  .send()
```

### WebSocket

```ts
import { ws, WsManager } from '@octovue/network'

// 默认管理器实例,connect 返回已自动连接的客户端
const conn = ws.connect<ChatMsg>('ws://localhost:8080/ws', {
  reconnect: { enabled: true, maxRetries: Infinity },
  heartbeat: { interval: 30000 },
  queue: { enabled: true, maxSize: 100 },
})

// 类型化消息监听
conn.on('chat', (msg: { from: string; text: string }) => {
  console.log(`${msg.from}: ${msg.text}`)
})

// 生命周期事件
conn.on('open', () => console.log('连接已建立'))
conn.on('close', () => console.log('连接已关闭'))

// 发送消息
conn.send({
  kind: 'typed',
  type: 'chat',
  data: { from: 'alice', text: 'Hello!' },
})

// 请求-响应模式(实例方法,代替旧的 request() 顶层函数)
interface LoginResp { token: string }
const resp = await conn.request<LoginResp>(
  'login',
  { username: 'alice', password: 'secret' },
  { timeout: 10000 }
)

// 自定义管理器(独立池)
const myWs = WsManager.create()
const conn2 = myWs.connect('ws://localhost:9000/ws')
```

### SSE (Server-Sent Events)

```ts
import { sse, SseConnectionPool, createSseClient } from '@octovue/network'

// 默认池,acquire 返回已自动连接的客户端(引用计数 +1)
const conn = sse.acquire('/api/events', {
  heartbeat: { timeout: 45000 },
})

conn.on('notification', (data) => {
  console.log('Notification:', data)
})

conn.on('open', () => console.log('SSE opened'))
conn.on('reconnect', () => console.log('Reconnecting...'))

// 释放连接(引用计数 -1,归零自动关闭)
sse.release('/api/events')

// 自定义池
const myPool = SseConnectionPool.create()

// 绕过池的独立连接
const standalone = createSseClient('/api/one-shot')
```

### 文件传输

```ts
import { http, uploadFile, createUploadTask, triggerBrowserDownload } from '@octovue/network'

// 简单上传 + 进度
await http.upload('/api/upload', file, {
  fieldName: 'avatar',
  fields: { userId: '123' },
  onUploadProgress: (e) => console.log(`${(e.ratio * 100).toFixed(1)}%`),
})

// 可订阅的上传任务(速度/ETA)
const task = createUploadTask('/api/upload', file)
task.tracker.on((e) => {
  console.log(`${e.ratio} · ${e.speed}B/s · ETA ${e.remainingMs}ms`)
})
await task.promise

// 下载 + 触发浏览器保存
const blob = await http.download('/api/files/report.pdf')
triggerBrowserDownload(blob, 'report.pdf')

// 一键下载保存
await http.downloadAndSave('/api/files/auto.pdf', 'auto.pdf')
```

### 伞形聚合

```ts
import { network } from '@octovue/network'

// 等价于分别导入 http / ws / sse
network.http.get(url)
network.ws.connect('wss://...')
network.sse.acquire('/events')
```

## 🎯 设计亮点

### 1. 命名空间统一风格

三个协议都遵循"实例 + 方法"的统一模式:

```ts
http.get(url)              // 一次性请求,返回 AxiosResponse<T>
ws.connect(url).on(...)    // 长连接,返回持久化客户端
sse.acquire(url).on(...)   // 长连接 + 引用计数,返回持久化客户端
```

HTTP 是无状态的一次性操作,WS / SSE 是长连接,语义差异通过方法名(`get` vs `connect` vs `acquire`)和返回类型直接体现,无需记忆独立函数。

### 2. 默认实例 + 自定义实例(axios-like)

```ts
// 默认实例:零配置即用
http.get('/api/health')

// 自定义实例:配置隔离
const api = HttpClient.create({ baseURL: 'https://api.example.com', retry: { maxRetries: 3 } })
const admin = HttpClient.create({ baseURL: 'https://admin.example.com' })

// 自定义实例独立配置,互不影响
await api.get('/users')
await admin.get('/users')
```

### 3. 三类拦截器

```ts
api.interceptors.request.use(async (config) => {
  config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use((response) => response)

api.interceptors.error.use(async (error) => {
  if (error.status === 401) {
    await refreshToken()
    return retry(error.config)
  }
  throw error
})
```

### 4. 临时拦截器(单次请求)

```ts
await api.get('/api/sensitive', {
  interceptors: {
    request: [(config) => {
      config.headers['X-Fingerprint'] = getFingerprint()
      return config
    }],
  },
})
```

### 5. 错误分类自动识别

```ts
import { isServerError, isBusinessError, isCancelError, isTimeoutError } from '@octovue/network'

try {
  await http.get('/api/users/999')
} catch (err) {
  if (isCancelError(err)) return              // 用户取消
  if (isTimeoutError(err)) return             // 请求超时
  if (isServerError(err)) {                   // 5xx
    console.error(err.status, err.message)
  } else if (isBusinessError(err)) {          // 业务错误
    console.error(err.code, err.message)
  } else {
    throw err
  }
}
```

### 6. 并发限流(实例方法)

```ts
// 限制最大并发为 2
const users = await http.map(
  userIds,
  (id) => http.get<User>(`/api/users/${id}`),
  2
)

// 全部完成(无论成败)
const results = await http.allSettled([
  http.get('/a'),
  http.get('/b'),
])
const successful = results.filter((r) => r.ok)
```

### 7. SSE 连接池(引用计数)

```ts
const pool = sse

// 多个组件共享同一连接
const conn1 = pool.acquire('/api/feed')
const conn2 = pool.acquire('/api/feed')

pool.release('/api/feed')  // 引用计数 -1
pool.release('/api/feed')  // 引用计数归零 → 连接关闭
```

## 📐 API 参考

### HTTP — `http` / `HttpClient`

| 方法 | 说明 |
|------|------|
| `http.get<T>(url, config?)` | GET 请求 |
| `http.post<T>(url, data?, config?)` | POST 请求 |
| `http.put<T>(url, data?, config?)` | PUT 请求 |
| `http.delete<T>(url, config?)` | DELETE 请求 |
| `http.patch<T>(url, data?, config?)` | PATCH 请求 |
| `http.head<T>(url, config?)` | HEAD 请求 |
| `http.options<T>(url, config?)` | OPTIONS 请求 |
| `http.request<T>(config)` | 通用请求入口 |
| `http.chain<T>(method)` | 链式构造器(返回 `HttpChain<T>`) |
| `http.all<T>(requests)` | 全部成功(任一失败抛错) |
| `http.any<T>(requests)` | 任一成功(全部失败抛 AggregateError) |
| `http.allSettled<T>(requests)` | 全部完成,返回结构化结果 |
| `http.sequence<T>(tasks)` | 串行执行 |
| `http.map(items, mapper, concurrency?)` | 数组批量(默认并发 6) |
| `http.concurrent(items, mapper, concurrency)` | 限制并发数 |
| `http.upload<T>(url, file, config?)` | 单文件上传 |
| `http.download(url, config?)` | 下载为 Blob |
| `http.downloadAndSave(url, filename, config?)` | 下载并触发浏览器保存 |
| `http.interceptors` | 拦截器集合 |
| `http.setConfig(cfg)` / `http.getConfig()` | 运行时配置 |
| `HttpClient.create(cfg?)` | 创建独立实例(静态) |

### WebSocket — `ws` / `WsManager`

| 方法 / 属性 | 说明 |
|-------------|------|
| `ws.connect<T>(url, config?)` | 获取或创建连接(自动 connect) |
| `ws.close(url, code?, reason?)` | 关闭并移除指定 URL 的连接 |
| `ws.closeAll(code?, reason?)` | 关闭所有连接 |
| `ws.size` / `ws.urls` | 当前状态 |
| `WsManager.create()` | 创建独立管理器(静态) |

每个 `WsClient` 提供:
| 方法 | 说明 |
|------|------|
| `client.on(type, handler)` | 订阅类型化消息或生命周期事件 |
| `client.onAny(handler)` | 订阅全部消息 |
| `client.send(message)` | 发送消息(连接未就绪时按配置入队) |
| `client.request<TResp, TReq>(type, data, options?)` | 请求-响应(基于 requestId) |
| `client.close(code?, reason?)` | 主动关闭 |
| `client.pause()` / `client.resume()` | 暂停/恢复分发 |
| `client.readyState` | 当前状态 |

### SSE — `sse` / `SseConnectionPool` / `createSseClient`

| 方法 / 属性 | 说明 |
|-------------|------|
| `sse.acquire<T>(url, config?)` | 获取连接(引用计数 +1,自动 connect) |
| `sse.release(url)` | 释放连接(引用计数 -1,归零自动关闭) |
| `sse.close(url)` | 强制关闭指定连接 |
| `sse.closeAll()` | 强制关闭所有 |
| `sse.size` / `sse.urls` | 当前状态 |
| `SseConnectionPool.create()` | 创建独立池(静态) |
| `createSseClient<T>(url, config?)` | 绕过池的独立连接 |

每个 `SseClient` 提供:
| 方法 | 说明 |
|------|------|
| `client.on(event, handler)` | 订阅事件/生命周期 |
| `client.onMessage(handler)` | 订阅默认消息 |
| `client.close()` | 关闭连接 |
| `client.pause()` / `client.resume()` | 暂停/恢复分发 |
| `client.readyState` / `client.lastEventId` | 状态 |

### 共享能力

| 模块 | 主要 API |
|------|---------|
| `cancel` | `createCancelController()` / `CancelError` / `isCancelError` |
| `timeout` | `TimeoutError` / `isTimeoutError` / `resolveTimeout` |
| `retry` | `withRetry` / `calculateDelay` / `defaultRetryConfig` |
| `dedupe` | `getDedupeManager()` / `RequestDedupeManager` |
| `interceptors` | `createInterceptors` / 内置: `createTokenInterceptor` / `createRequestLogInterceptor` 等 |
| `error` | `NetworkException` / `ServerError` / `ClientError` / `BusinessError` / `UnknownError` / `classifyError` |
| `response` | `unwrapResponse` / `checkBusinessCode` / `jsonRequestTransformer` 等 |
| `progress` | `createProgressTracker` / `asAxiosProgress` |
| `transfer` | `uploadFile` / `uploadFiles` / `downloadFile` / `createUploadTask` / `createDownloadTask` |

## 📁 目录结构

```
src/
├── index.ts                 # 主入口(含 network 伞形)
├── types/                   # 基础类型
│   ├── error.ts            # NetworkError 抽象类 + ErrorKind 枚举
│   └── utility.ts          # 通用工具类型
├── protocols/               # 三种协议(目录通配)
│   ├── http/               # HTTP 实现
│   │   ├── client.ts       # HttpClient 类 + http 默认实例
│   │   ├── chain.ts        # createChainBuilder(client, method) 工厂
│   │   ├── pipeline.ts     # InternalHttpClient 统一管线
│   │   ├── concurrent.ts   # 纯函数:all/any/allSettled/sequence/map/concurrent
│   │   ├── transfer.ts     # 纯函数:upload/download/downloadAndSave
│   │   └── types.ts
│   ├── sse/                 # SSE 实现
│   │   ├── client.ts       # SseClientImpl + createSseClient
│   │   └── pool.ts         # SseConnectionPool 类 + sse 默认实例
│   └── ws/                  # WebSocket 实现
│       ├── client.ts       # WsClientImpl(含 request 方法)
│       └── manager.ts      # WsManager 类 + ws 默认实例
└── shared/                  # 跨协议公共能力
    ├── cancel/             # 取消控制器
    ├── timeout/            # 超时调度
    ├── retry/              # 重试
    ├── dedupe/             # 去重
    ├── error/              # 错误体系
    ├── response/           # 业务码解包
    ├── interceptors/       # 拦截器 + 内置
    ├── progress/           # 进度跟踪
    └── transfer/           # 文件传输(高级 API)
```

## 🔧 命名空间按需使用

```ts
// 主入口 (推荐)
import { http, ws, sse, network } from '@octovue/network'

// 按需使用命名空间
http.get('/api/users')
ws.connect('wss://...').on('message', handler)
sse.acquire('/api/events').on('data', handler)

// 自定义实例 (隔离配置)
import { HttpClient, WsManager, SseConnectionPool } from '@octovue/network'
const api = HttpClient.create({ baseURL: 'https://api.example.com' })
```

## 🌍 浏览器兼容性

需要支持以下 Web 平台 API:
- `AbortController` / `AbortSignal`
- `fetch` / `WebSocket` / `EventSource` (IE 不支持)
- `Promise` / `async/await`
- `Map` / `Set`
- `URL.createObjectURL` (下载触发)
- `FormData` (文件上传)

## 📄 License

MIT
