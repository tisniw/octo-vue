# @octovue/utils

OctoVue 通用工具层，框架无关，可被 Vue / React / Node 端复用。

## 能力分类

| 分类 | 模块 | 能力 |
|---|---|---|
| 函数工具 | `function/fn` | 防抖、节流、记忆化、函数组合 |
| 函数工具 | `function/strings` | 大小写转换、截断、模板、填充 |
| 函数工具 | `function/numbers` | clamp、random、精度、格式化 |
| 函数工具 | `function/format` | 字节、百分比、时长、手机号/身份证/银行卡 |
| 函数工具 | `function/arrays` | 去重、分组、扁平、排序、统计等 26+ 方法 |
| 函数工具 | `function/object` | 深克隆、合并、pick/omit、get/set、深比较 |
| 函数工具 | `function/async` | sleep、retry、timeout、并发控制 |
| 函数工具 | `function/classnames` | cn / clx 条件类名合并 |
| 函数工具 | `function/url` | query/URL 解析与增删 |
| 运行时检测 | `runtime/common` | isBrowser、isNode、18 个类型守卫、generateId |
| 运行时检测 | `runtime/browser` | UA/平台/特性/网络检测 |
| DOM 操作 | `dom/element` | 尺寸、位置、视口可见性、滚动 |
| DOM 操作 | `dom/event` | on/off/once/emit、委托、命名空间 |
| DOM 操作 | `dom/style` | class/style/cssVar 读写、单位转换 |
| 颜色 | `color/color` | 基于 d3-color 的解析、调整、混色、配色板 |
| 日期与农历 | `date/date` | 原生 Date/Intl 的多格式解析、运算、时区、cron |
| 日期与农历 | `date/lunar` | 阳历 ↔ 农历互转、农历格式化 |
| 日期与农历 | `date/lunar-data` | 1900–2100 农历数据表 |
| 校验 | `validation/rules` | 预置校验规则集 |
| 校验 | `validation/validator` | defineRules / validate / ValidationError |
| 加密 | `crypto/crypto` | SHA、AES-GCM、base64、UUID、随机、XOR |

## 导入方式

```ts
// 子路径精细化（推荐，tree-shaking 友好）
import { debounce } from '@octovue/utils/function/fn'
import { formatDate } from '@octovue/utils/date/date'
import { sha256 } from '@octovue/utils/crypto/crypto'

// utils 桶（兼容旧代码）
import { debounce, formatDate } from '@octovue/utils'
```

## 依赖

- `d3-color`：颜色工具唯一外部依赖
- 其他模块全部基于原生 API（Date、Intl、Web Crypto）

## 开发

```bash
cd packages/base/utils
npm run typecheck
```
