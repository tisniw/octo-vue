<!--
  components/PhysicsLayer.vue · 物理引擎层 (0.0.7 §4)

  - 挂载物理世界到 viewport
  - 子组件可 inject body 参与物理仿真
  - 使用 useAdapter 异步加载物理引擎 adapter
-->
<script setup lang="ts">
import { onMounted, onUnmounted, provide, ref, type Ref } from 'vue'
import { useAdapter } from '../composables/useAdapter.js'
import { ACT_PHYSICS_WORLD_KEY } from './types.js'
import type { PhysicsLayerProps } from './types.js'

const props = withDefaults(defineProps<PhysicsLayerProps>(), {
  gravity: () => ({ x: 0, y: 9.8 }),
  timeStep: 1 / 60,
})

const emit = defineEmits<{
  worldReady: [world: unknown]
  step: [time: number]
}>()

const { adapter, state } = useAdapter(props.engine)
const world: Ref<unknown> = ref(null)

provide(ACT_PHYSICS_WORLD_KEY, world)

onMounted(() => {
  if (state.value === 'ready' && adapter.value) {
    const engine = adapter.value as unknown as {
      createWorld?: (opts: PhysicsLayerProps) => unknown
    }
    world.value = engine.createWorld?.(props) ?? null
    emit('worldReady', world.value)
  }
})

onUnmounted(() => {
  world.value = null
})
</script>

<template>
  <div class="act-physics-layer" :style="{ position: 'relative' }">
    <slot />
  </div>
</template>