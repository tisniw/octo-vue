<!--
  components/AnimationHost.vue · 动画容器 (0.0.7 §3)

  - 提供全局 Driver 上下文(provide/inject)
  - mount 时初始化 Driver,unmount 时清理
  - SSR 安全:window 不存在时跳过副作用
-->
<script setup lang="ts">
import { onMounted, onUnmounted, provide, ref, type Ref } from 'vue'
import { createDriver } from '../engine-core/engines/Driver.js'
import type { Driver } from '../engine-core/engines/Driver.js'
import { ACT_DRIVER_KEY } from './types.js'
import type { AnimationHostProps } from './types.js'

const props = withDefaults(defineProps<AnimationHostProps>(), {
  ssrSafe: true,
})

const emit = defineEmits<{
  ready: [driver: Driver]
  destroy: []
}>()

const driver: Ref<Driver | null> = ref(null)

provide(ACT_DRIVER_KEY, driver)

onMounted(() => {
  if (props.ssrSafe && typeof window === 'undefined') return
  const d = createDriver(props.driverOptions)
  driver.value = d
  emit('ready', d)
})

onUnmounted(() => {
  emit('destroy')
  driver.value = null
})
</script>

<template>
  <div class="act-animation-host">
    <slot />
  </div>
</template>