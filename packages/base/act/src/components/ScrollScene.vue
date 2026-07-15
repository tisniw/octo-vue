<!--
  components/ScrollScene.vue · 滚动场景 (0.0.7 §5)

  - 基于 useScrollProgress + useInView
  - 暴露 progress / inView 给 slot
  - emit 'progress' / 'enter' / 'leave'
-->
<script setup lang="ts">
import { ref, watch } from 'vue'
import { useScrollProgress } from '../composables/useScrollProgress.js'
import { useInView } from '../composables/useInView.js'
import type { ScrollSceneProps } from './types.js'

const props = withDefaults(defineProps<ScrollSceneProps>(), {
  scrub: false,
  playOnEnter: false,
  inViewThreshold: 0.1,
})

const emit = defineEmits<{
  progress: [p: number]
  enter: []
  leave: []
}>()

const sceneRef = ref<HTMLElement | null>(null)
const { progress } = useScrollProgress(props.scrollOptions)
const { inView } = useInView(sceneRef, { threshold: props.inViewThreshold })

watch(progress, (p) => emit('progress', p))
watch(inView, (v) => {
  if (v) emit('enter')
  else emit('leave')
})
</script>

<template>
  <div ref="sceneRef" class="act-scroll-scene">
    <slot :progress="progress" :inView="inView" />
  </div>
</template>