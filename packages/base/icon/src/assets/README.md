# OctoVue 图标系统

## 目录结构

```
icons/
├── animated/     # 内置动画图标（SVG 自带动画效果）
├── dynamic/     # 动态图标（需 JS 控制状态）
├── interaction/  # 交互图标（不同交互状态）
├── static/      # 静态图标（无动画）
└── README.md
```

## 目录说明

### animated - 内置动画
图标自带动画代码（SMIL/CSS），开箱即用自动播放。

适用场景：加载状态、刷新、心跳等持续动画效果。

### dynamic - 动态图标
图标状态随数据/业务逻辑变化，需要通过 props 或事件控制。

适用场景：数据可视化、进度指示、实时状态展示。

### interaction - 交互图标
不同交互状态使用不同图标，通过状态切换显示。

适用场景：hover、active、disabled、loading 等状态切换。

### static - 静态图标
无动画效果的基础图标，适用于大多数场景。

适用场景：通用导航、操作按钮、内容标识等。

## 风格子目录

每个主目录下包含 26 种风格分类：

| 目录 | 风格 | 目录 | 风格 |
|------|------|------|------|
| 3d | 立体 | minimal | 极简 |
| base | 基础 | monochrome-line | 单色线性 |
| bold | 粗线 | neumorphism | 新拟态 |
| cartoon | 卡通 | outline | 轮廓 |
| crystal-white | 晶白 | pixel | 像素 |
| cyberpunk | 赛博朋克 | retro | 复古 |
| duotone-line | 双色线性 | rounded | 圆角 |
| filled | 面性 | sharp | 尖角 |
| flat | 扁平 | skeuomorphic | 拟物 |
| glassmorphism | 毛玻璃 | subtle-texture | 微质感 |
| gradient | 渐变 | ui | UI组件 |
| hand-drawn | 手绘 | vintage | 复古怀旧 |
| illustration | 插画 | | |

## 使用方式

```vue
<!-- 静态图标 -->
<o-icon name="static-base-home" />

<!-- 内置动画 -->
<o-icon name="animated-loading" />

<!-- 动态图标 -->
<o-icon name="dynamic-chart" />

<!-- 交互图标 -->
<o-icon name="interaction-button-hover" />

<!-- 指定风格 -->
<o-icon name="static-rounded-home" />
<o-icon name="static-crystal-white-diamond" />
```

命名格式：`{主目录}-{风格?}-{图标名}`