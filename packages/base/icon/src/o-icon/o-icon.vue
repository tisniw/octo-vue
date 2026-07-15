<template>
  <component
    :is="rootTag"
    :class="iconClasses"
    :style="iconStyles"
    v-bind="componentAttrs"
  >
    <!-- SVG 图标 -->
    <span
      v-if="renderType === 'svg' && iconContent"
      class="o-icon__svg"
      :style="svgContainerStyle"
      v-html="iconContent"
    />

    <!-- 字体图标 -->
    <i
      v-else-if="renderType === 'font'"
      :class="fontIconClasses"
    />

    <!-- Emoji 图标(直接渲染,无嵌套) -->
    <template v-else-if="renderType === 'emoji'">{{ iconContent || name }}</template>

    <!-- 图片图标 -->
    <img
      v-else-if="renderType === 'image'"
      :src="iconContent || name"
      :alt="props.decorative ? '' : (props.ariaLabel || props.name || '')"
      loading="lazy"
    />

    <!-- 默认/回退:slot > 显示 "?" 字符,确保用户能看到"图标找不到"的反馈 -->
    <template v-else>
      <slot>
        <span v-if="!props.decorative" class="o-icon__fallback" aria-hidden="true">?</span>
      </slot>
    </template>
  </component>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { IconProps } from './cpns/types'
import { getIconLibrary, coreIcons } from './cpns'

defineOptions({
  name: 'OIcon',
})

const props = withDefaults(defineProps<IconProps>(), {
  name: '',
  library: 'static-base',
  size: 'medium',
  color: undefined,
  spin: false,
  rotate: undefined,
  flip: undefined,
  type: undefined,
  disabled: false,
  decorative: true,
  ariaLabel: undefined,
})

/**
 * 根元素标签
 *
 * 设计变更:统一用 <span>(语义化 + 跨场景安全)
 * - 旧版用 <i> 是字体图标时代的惯例,HTML5 中 <i> 表示"备用语态",不是图标语义
 * - <span> 配合 role="img"(componentAttrs 已加)是无障碍最佳实践
 * - 唯一例外:image 类型用 <img>(自带 alt)
 */
const rootTag = computed(() => {
  if (renderType.value === 'image') return 'img'
  return 'span'
})

/**
 * 渲染类型
 * 优先级:显式 type prop > emoji > image URL > 字体图标前缀 > raw <svg> 字符串 > svg(默认走 registry)
 */
const renderType = computed(() => {
  if (props.type) return props.type
  if (!props.name) return 'unknown'
  if (isEmoji(props.name)) return 'emoji'
  if (isImageUrl(props.name)) return 'image'
  if (isFontIconName(props.name)) return 'font'
  if (props.name.trim().startsWith('<svg')) return 'svg'
  return 'svg'
})

/** 图标内容 */
const iconContent = ref<string | null>(null)

/**
 * 实例级 load token(替代旧版的模块级 let)
 * 每个 OIcon 实例独立维护版本号,避免跨实例的 race condition 互相覆盖
 */
const loadToken = ref(0)

/**
 * 加载图标
 *
 * watch + immediate:true 替代手动 onMounted 调用,避免 race condition
 * (用户在 setup 后才设置 name prop,onMounted 不会重跑)
 */
async function loadIcon() {
  const token = ++loadToken.value

  if (!props.name || !props.library) {
    iconContent.value = null
    return
  }

  if (renderType.value === 'emoji' || renderType.value === 'image') {
    iconContent.value = props.name
    return
  }

  if (renderType.value === 'svg' && props.name.startsWith('<svg')) {
    iconContent.value = props.name
    return
  }

  // 字体图标走 fontIconClasses,无需异步内容
  if (renderType.value === 'font') {
    iconContent.value = null
    return
  }

  // 确保图标库已预加载
  await coreIcons.preload()
  if (token !== loadToken.value) return

  // 从注册表获取图标库配置
  const libraryConfig = getIconLibrary(props.library)
  if (!libraryConfig) {
    if (import.meta.env?.DEV) {
      console.warn(`[OIcon] library "${props.library}" not registered (icon: "${props.name}")`)
    }
    iconContent.value = null
    return
  }

  // 优先从 icons 字典同步获取
  if (libraryConfig.icons && libraryConfig.icons[props.name]) {
    iconContent.value = libraryConfig.icons[props.name]
    return
  }

  // 通过 resolver 异步获取
  if (libraryConfig.resolver) {
    try {
      const result = await libraryConfig.resolver(props.name)
      if (token !== loadToken.value) return
      if (!result && import.meta.env?.DEV) {
        console.warn(`[OIcon] resolver returned empty for "${props.library}:${props.name}"`)
      }
      iconContent.value = result || null
    } catch (err) {
      if (token !== loadToken.value) return
      if (import.meta.env?.DEV) {
        console.warn(`[OIcon] resolver failed for "${props.library}:${props.name}"`, err)
      }
      iconContent.value = null
    }
    return
  }

  // 走到这说明既没有 icons 字典命中也没有 resolver
  if (import.meta.env?.DEV) {
    console.warn(`[OIcon] icon "${props.name}" not found in library "${props.library}"`)
  }
  iconContent.value = null
}

watch(
  () => [props.name, props.library, props.type],
  () => loadIcon(),
  { immediate: true },
)

/** 图标类名 */
const iconClasses = computed(() => {
  const classes = ['o-icon']
  // 命名尺寸走 class(预设 5 档)
  if (typeof props.size === 'string') {
    classes.push(`o-icon--${props.size}`)
  }
  if (props.spin) classes.push('o-icon--spin')
  if (props.flip) classes.push(`o-icon--flip-${props.flip}`)
  if (props.disabled) classes.push('o-icon--disabled')
  return classes
})

/**
 * 图标样式
 * - 数字尺寸通过 inline width/height/font-size 渲染(不再依赖预定义 class)
 * - 显式 color 通过 inline color 传递
 */
const iconStyles = computed(() => {
  const styles: Record<string, string> = {}
  if (typeof props.size === 'number') {
    styles.width = `${props.size}px`
    styles.height = `${props.size}px`
    styles.fontSize = `${props.size}px`
  }
  if (props.color) styles.color = props.color
  return styles
})

/** SVG 容器样式(rotate 单独作用在这,与 flip 的 transform 互不冲突) */
const svgContainerStyle = computed(() => {
  if (props.rotate === undefined) return undefined
  return { transform: `rotate(${props.rotate}deg)` }
})

/** 字体图标类名 */
const fontIconClasses = computed(() => {
  const classes: string[] = []
  const library = getIconLibrary(props.library)
  if (library?.prefix) classes.push(library.prefix)
  classes.push(props.name)
  return classes
})

/**
 * 组件属性
 * - decorative=true(默认):aria-hidden="true",屏幕阅读器忽略
 * - decorative=false:role="img" + aria-label,作为有语义内容朗读
 * - <img> 根元素由 alt 属性承载语义,不再加 role/aria
 */
const componentAttrs = computed(() => {
  // img 根元素:alt 在模板里直接绑定,不需要 role/aria
  if (renderType.value === 'image') {
    return {}
  }

  if (props.decorative) {
    return { 'aria-hidden': 'true' }
  }

  const attrs: Record<string, string> = {
    role: 'img',
    'aria-label': props.ariaLabel || props.name || 'icon',
  }
  if (props.disabled) attrs['aria-disabled'] = 'true'
  return attrs
})

/**
 * 检测 emoji(Unicode Extended_Pictographic)
 */
function isEmoji(str: string): boolean {
  if (!str) return false
  return /\p{Extended_Pictographic}/u.test(str)
}

/**
 * 检测图片 URL(http(s) / data: / 相对路径)
 */
function isImageUrl(str: string): boolean {
  if (!str) return false
  return (
    /^https?:\/\/.*\.(png|jpg|jpeg|gif|svg|webp|ico|avif)/i.test(str) ||
    /^data:image\/(png|jpe?g|gif|svg\+xml|webp|avif);/i.test(str) ||
    /^(\.\/|\.\.\/|\/)[^/].*\.(png|jpg|jpeg|gif|svg|webp|ico|avif)$/i.test(str)
  )
}

/**
 * 检测字体图标名(常见前缀约定)
 * 覆盖 FontAwesome(fa-)、Material Icons(mdi-)、自定义(icon-/iconfont-)、Iconify(<set>:<name>)
 * 注意:Iconify 走远程 svg resolver 路径,会被前面的 isEmoji/isImageUrl 跳过,
 *       而 isFontIconName 通过冒号也能区分(<set>:<name> 不会进 font 分支)
 */
function isFontIconName(str: string): boolean {
  if (!str) return false
  // 含冒号(如 logos:vue / mdi:home)是 Iconify-style name,走 svg resolver,不是字体图标
  if (str.includes(':')) return false
  return /^(fa-|mdi-|icon-|iconfont-|bi-|ti-)/.test(str)
}
</script>

<style lang="scss" scoped>
@use './cpns/index.scss';
</style>