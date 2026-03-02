<template>
  <span v-if="fragments && fragments.length > 0" class="info-display flex">
    <span
      v-for="(fragment, index) in fragments"
      :key="index"
      :class="fragment.type !== 'text' ? `info_${fragment.type}` : ''"
    >
      <ObjectDiv v-if="fragment.type === 'object'" :object="fragment.data" @click="handleObjectClick" />
      <template v-else>{{ fragment.data }}</template>
    </span>
  </span>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import ObjectDiv from './ObjectDiv.vue'

export interface InfoFragment {
  type: 'text' | 'state' | 'object' | 'code'
  data: any
}

defineProps<{
  fragments: InfoFragment[]
}>()

// 注入 showInformation 方法
const showInformation = inject<(object: any, event: MouseEvent) => void>('showInformation')

// 处理对象点击
function handleObjectClick(object: any, event: MouseEvent) {
    if (showInformation) {
        showInformation(object, event)
    }
}
</script>

<style scoped>
.info-display {
  display: flex;
  flex-wrap: wrap;
}
</style>
