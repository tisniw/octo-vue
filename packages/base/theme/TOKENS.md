# Octovue 主题 Token 全景


主题层由三层命名空间组成，分别落到 `:root` 上的 CSS 变量，被消费端样式按需引用：

| 命名空间 | 前缀 | 产出方 | 数量 |
|---|---|---|---|
| 功能色 | `--of-{semantic}-{level}` | `buildCssVariables` | 7 × 10 = **70** |
| 背景色 | `--ob-{slot}` | `buildCssVariables` | **5** |
| 主题非颜色 | `--op-{group}-{key}` | `getBaseCssVariables` | **127** |
| 视觉层共享样式 | `--ov-vs-*` | `buildVisualStyleCssVariables` | **9** |
| **合计** | — | — | **211** |

---

## 一、功能色 token

**前缀**：`--of`

**基色来源**：`ThemeConfig.tokens: ThemeTokens`

**派生规则**：每个基色经 `generateFunctionalScale()` 派生 10 阶色阶

### 1.1 7 个语义 × 10 个色阶场景

| 语义 | 取值 | 语义作用 | CSS 变量示例 |
|---|---|---|---|
| `primary` | hex | 主操作 / 主品牌色 | `--of-primary-1` … `--of-primary-10` |
| `success` | hex | 成功反馈 | `--of-success-1` … `--of-success-10` |
| `error` | hex | 错误反馈 | `--of-error-1` … `--of-error-10` |
| `warning` | hex | 警示提醒 | `--of-warning-1` … `--of-warning-10` |
| `info` | hex | 信息提示 | `--of-info-1` … `--of-info-10` |
| `emphasis` | hex | 强调高亮 | `--of-emphasis-1` … `--of-emphasis-10` |
| `default` | hex | 中性通用 | `--of-default-1` … `--of-default-10` |

### 1.2 10 个色阶（`FUNCTIONAL_LEVEL_LABELS`）

| Level | 场景语义 | 典型用途 |
|---|---|---|
| `1` | `bg-soft` | 极浅背景 |
| `2` | `bg` | 主背景色 |
| `3` | `bg-strong` | 强背景 |
| `4` | `border` | 描边色 |
| `5` | `text-soft` | 弱化文字 |
| `6` | `text` | 主文字色 |
| `7` | `text-strong` | 强文字 |
| `8` | `accent-soft` | 浅强调色 |
| `9` | `accent` | 主强调色 |
| `10` | `accent-strong` | 强强调色 |

---

## 二、背景色token

**前缀**：`--ob`

**基色来源**：`ThemeConfig.bgTokens: BackgroundTokens`

**特点**：每个slot仅对应一个CSS 变量，

| Slot | 作用 | CSS 变量 |
|---|---|---|
| `primary` | 主体底色 | `--ob-primary` |
| `secondary` | 次级底色 | `--ob-secondary` |
| `tertiary` | 三级底色 | `--ob-tertiary` |
| `quaternary` | 四级底色 | `--ob-quaternary` |
| `quinary` | 五级底色 | `--ob-quinary` |

---

## 三、主题非颜色token

**前缀**：`--op`

**基色来源**：`Presentation` 上的可选覆盖字段 + `DEFAULT_NON_COLOR_TOKENS` 内置默认值

**派生函数**：`getLayoutCssVariables()` / `getTypographyCssVariables()` / `getEffectCssVariables()`，最终聚合为 `getBaseCssVariables()`

### 3.1 布局类

| 分组 | CSS 变量格式 | 键数 | 取值范围 | 作用 | 典型应用 |
|---|---|---|---|---|---|
| `size` | `--op-size-{0..32}` | 33 | `0` → `0px`；其余 → `n×0.25rem` | 尺寸步进 | 固定宽高、图标尺寸、徽章半径 |
| `radius` | `--op-radius-{key}` | 10 | none / xs / sm / base / md / lg / xl / 2xl / 3xl / full | 圆角阶梯 | 按钮 / 卡片 / 输入框圆角 |
| `spacing` | `--op-spacing-{0..24}` | 25 | `0` → `0px`；其余 → `n×0.25rem` | 间距步进 | margin / padding / gap |

#### `radius` 键值速查

| 键 | 值 | 典型应用 |
|---|---|---|
| `none` | `0px` | 无圆角 |
| `xs` | `0.125rem` (2px) | 微圆角 |
| `sm` | `0.25rem` (4px) | 小控件 |
| `base` | `0.375rem` (6px) | 默认按钮 |
| `md` | `0.5rem` (8px) | 卡片 / 对话框 |
| `lg` | `0.75rem` (12px) | 大卡片 |
| `xl` | `1rem` (16px) | 浮层 / popover |
| `2xl` | `1.5rem` (24px) | 模态框 |
| `3xl` | `2rem` (32px) | 强调浮层 |
| `full` | `9999px` | 胶囊 / 头像 |

### 3.2 排版类

| 分组 (`group`) | CSS 变量格式 | 键数 | 键 | 值 | 典型应用 |
|---|---|---|---|---|---|
| `font-size` | `--op-font-size-{key}` | 10 | `xxs` / `xs` / `sm` / `base` / `lg` / `xl` / `2xl` / `3xl` / `4xl` / `5xl` | `0.625rem` ~ `3rem` | 标题、正文、辅助文字 |
| `font-weight` | `--op-font-weight-{key}` | 9 | `thin` / `extralight` / `light` / `normal` / `medium` / `semibold` / `bold` / `extrabold` / `black` | `100` ~ `900` | 字重阶梯 |
| `leading` | `--op-leading-{key}` | 6 | `none` / `tight` / `snug` / `normal` / `relaxed` / `loose` | `1` ~ `2` | 行高 |
| `font-family` | `--op-font-family-{key}` | 2 | `sans` / `mono` | 见下方 | 主字体 / 等宽字体 |

**字体族默认值**：

| 键 | 值 | 用途 |
|---|---|---|
| `sans` | `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif` | 系统默认无衬线 |
| `mono` | `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace` | 代码 / 数字 |

### 3.3 效果类

| 分组  | CSS 变量格式 | 键数 | 键 | 典型应用 |
|---|---|---|---|---|
| `shadow` | `--op-shadow-{key}` | 5 | `sm` / `base` / `md` / `lg` / `xl` | 卡片 / 浮层阴影阶梯 |
| `alpha` | `--op-alpha-{n}` | 21 | `0,5,10,…,100` | 透明度阶梯 |
| `z-index` | `--op-z-index-{key}` | 6 | `dropdown` / `sticky` / `fixed` / `modal` / `popover` / `tooltip` | 层叠顺序 |

#### `shadow` 键值速查

| 键 | 值 | 典型应用 |
|---|---|---|
| `sm` | `0 1px 2px 0 rgb(0 0 0 / 0.05)` | 微阴影 |
| `base` | `0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)` | 默认卡片 |
| `md` | `0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)` | 浮层 / popover |
| `lg` | `0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)` | 模态框 |
| `xl` | `0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)` | 顶层浮层 |

#### `z-index` 键值速查

| 键 | 值 | 典型应用 |
|---|---|---|
| `dropdown` | `1000` | 下拉菜单 |
| `sticky` | `1100` | 吸顶元素 |
| `fixed` | `1200` | 固定定位条 |
| `modal` | `1300` | 模态对话框 |
| `popover` | `1400` | 浮层卡片 |
| `tooltip` | `1500` | 文字提示 |

### 3.4 非颜色 token 覆盖优先级

`buildCssVariables` 中的合并顺序：

```
getBaseCssVariables()      // DEFAULT_NON_COLOR_TOKENS 内置值（基底）
↓
collectNonColorOverrides(config)  // 用户在 ThemeConfig 上提供的 Presentation 覆盖值
```

`collectNonColorOverrides` 遍历字段映射表：

| ThemeConfig 字段 | CSS 变量分组 |
|---|---|
| `size` | `size` |
| `radius` | `radius` |
| `spacing` | `spacing` |
| `fontSize` | `font-size` |
| `fontWeight` | `font-weight` |
| `leading` | `leading` |
| `fontFamily` | `font-family` |
| `shadow` | `shadow` |
| `alpha` | `alpha` |
| `zIndex` | `z-index` |

---

## 四、视觉层共享样式 token

**前缀**：`--ov-vs-`（`VISUAL_STYLE_PREFIX`）
**基色来源**：`VisualStyleConfig.sharedStyles: SharedStyleTokens`
**生成函数**：`buildVisualStyleCssVariables(shared)`，共 **9 个变量**
**作用域**：与 `ThemeConfig` 解耦，由 `VisualStyle` 层注入；不同视觉风格（明亮 / 暗黑 / 古风 / 科技 / 赛博 / 未来）共享同一组变量名

| CSS 变量 | 取值域 | 作用 | 典型应用 |
|---|---|---|---|
| `--ov-vs-border` | `solid` / `dashed` / `double` / `calligraphic` | 描边样式 | 按钮 / 卡片 / 分割线描边类型 |
| `--ov-vs-radius` | `none` / `subtle` / `round` / `calligraphic` | 描边风格化圆角 | 圆角策略（直角 / 微圆 / 圆润 / 飞檐） |
| `--ov-vs-font-family` | `sans` / `serif` / `kai` / `fangsong` / `mono` | 字体族策略 | 主字体切换（古风→楷体、科技→等宽） |
| `--ov-vs-shadow` | `flat` / `soft` / `ink` / `glow` | 阴影风格 | 投影风格（无 / 柔光 / 水墨 / 霓虹光晕） |
| `--ov-vs-decoration` | `none` / `seal` / `border` / `minimal` | 装饰元素 | 印章 / 边框纹饰 / 极简 |
| `--ov-vs-motion-easing` | 任意 CSS easing 字符串 | 全局缓动曲线 | 所有过渡动画 |
| `--ov-vs-motion-duration-fast` | CSS 时长 | 快速过渡 | hover / 焦点切换（古风 160ms、赛博 60ms） |
| `--ov-vs-motion-duration-base` | CSS 时长 | 默认过渡 | 状态切换、出现消失 |
| `--ov-vs-motion-duration-slow` | CSS 时长 | 慢速过渡 | 大幅过渡、强调动效 |

### 4.1 内置视觉风格差异速查（基于 `visual-style/builtin.ts`）

| 视觉风格 | border | radius | font-family | shadow | decoration | motion fast / base / slow | easing |
|---|---|---|---|---|---|---|---|
| `light` 明亮 | solid | subtle | sans | soft | minimal | 100 / 200 / 300ms | `cubic-bezier(0.4, 0, 0.2, 1)` |
| `dark` 暗黑 | solid | subtle | sans | ink | minimal | 100 / 200 / 300ms | `cubic-bezier(0.4, 0, 0.2, 1)` |
| `ancient` 古风 | calligraphic | calligraphic | kai | ink | seal | 160 / 260 / 420ms | `cubic-bezier(0.25, 1, 0.5, 1)` |
| `tech` 科技 | double | subtle | sans | flat | border | 80 / 160 / 260ms | `cubic-bezier(0.4, 0, 0.2, 1)` |
| `cyber` 赛博 | dashed | round | mono | glow | border | 60 / 120 / 200ms | `cubic-bezier(0.7, 0, 0.3, 1)` |
| `future` 未来 | dashed | round | sans | soft | minimal | 120 / 220 / 360ms | `cubic-bezier(0.16, 1, 0.3, 1)` |

---

## 五、`ThemeTransition`（不序列化为 CSS 变量）

| 字段 | 类型 | 默认值 | 作用 |
|---|---|---|---|
| `duration.fast` | string | `100ms` | 快速过渡时长 |
| `duration.base` | string | `200ms` | 默认过渡时长 |
| `duration.slow` | string | `300ms` | 慢速过渡时长 |
| `easing` | string | `cubic-bezier(0.4, 0, 0.2, 1)` | 默认缓动曲线 |
| `enabled` | boolean | `true` | 全局动效开关（关闭则所有过渡瞬间完成） |

> 注意：`DEFAULT_TRANSITION` 不被 `buildCssVariables` 输出，由 `ThemeManager` 在运行时读取并应用。

---

## 六、装配与导出

### 6.1 函数清单

| 函数 | 来源 | 作用 |
|---|---|---|
| `buildCssVariables(config, vs?)` | `core/variables.ts` | ThemeConfig → CSS 变量对象（含 `--ov-vs-*` 当 `vs` 传入时） |
| `buildVisualStyleCssVariables(shared)` | `core/variables.ts` | SharedStyleTokens → 9 个 `--ov-vs-*` 变量 |
| `cssVariablesToString(vars)` | `core/variables.ts` | 变量对象 → `:root { … }` 字符串 |
| `generateCssVariables(input)` | `core/variables.ts` | 重载：接受 `CssVariables` 或 `ThemeConfig` |
| `countThemeCssVariables(config, vs?)` | `core/variables.ts` | 统计输出变量总数 |
| `getBaseCssVariables()` | `theme/tokens.ts` | 输出 127 个非颜色 `--op-*` 变量 |
| `getLayoutCssVariables()` | `theme/tokens.ts` | 输出 size / radius / spacing 3 组 |
| `getTypographyCssVariables()` | `theme/tokens.ts` | 输出 font-size / weight / leading / family 4 组 |
| `getEffectCssVariables()` | `theme/tokens.ts` | 输出 shadow / alpha / z-index 3 组 |

### 6.2 上限常量

| 常量 | 值 | 含义 |
|---|---|---|
| `MAX_CSS_VARIABLES` | `202` | 主题层（含 70 颜色 + 5 背景 + 127 非颜色） |
| `VISUAL_STYLE_MAX_CSS_VARIABLES` | `9` | 视觉层 `--ov-vs-*` |
| **合计上限** | `211` | 完整输出 |

---

## 七、消费端使用建议

| 场景 | 推荐引用 | 理由 |
|---|---|---|
| 主题敏感按钮（随主题变色） | `--of-primary-{6,9,10}` | 跟随 `ThemeConfig.tokens.primary` 自动派生 |
| 固定中性灰按钮 | `--of-default-*` | 不随主题色改变 |
| 页面背景 | `--ob-primary` / `--ob-secondary` | 5 档阶梯，跨主题稳定 |
| 卡片 / 模态阴影 | `--op-shadow-{md,lg}` | 与主题解耦的阶梯阴影 |
| 行高 / 字号 | `--op-leading-{normal}` / `--op-font-size-{base}` | 主题无关的文字节奏 |
| 动画曲线 | `--ov-vs-motion-{easing,duration-*}` | 跟随视觉风格切换动效节奏 |
| 强调 / 装饰元素 | `--ov-vs-decoration` / `--ov-vs-border` | 视觉风格化差异 |
| 全局动效开关 | `ThemeManager.transition.enabled` | 关闭后所有动效禁用 |