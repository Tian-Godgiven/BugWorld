<template>
  <Tile :名称="'虫巢信息'" :功能="{ 关闭: 'cube' }">
    <div v-if="bugNest" class="bugnest-info">
      <div class="info-row">
        <span class="label">名称：</span>
        <ObjectDiv :object="bugNest" />
      </div>
      <div class="info-row">
        <span class="label">所处：</span>
        <ObjectDiv :object="所处" />
      </div>
      <div class="info-row">
        <span class="label">空间：</span>
        <span>{{ 空间now }} / {{ 空间max }}</span>
      </div>
      <div class="info-row">
        <span class="label">生产：</span>
        <span>{{ 生产 }}</span>
      </div>
      <div class="info-row">
        <span class="label">消耗：</span>
        <span>{{ 消耗 }}</span>
      </div>
    </div>
  </Tile>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Tile from '../common/Tile.vue'
import ObjectDiv from '../common/ObjectDiv.vue'
import { stateValue } from '../../core/state/State'
import { useGameStore } from '../../stores/game'
import { getUpdateCounter } from '../../utils/reactivity'

const gameStore = useGameStore()
const bugNest = computed(() => gameStore.focusingBugNest)

// 订阅更新计数器以触发响应式更新
const updateCounter = getUpdateCounter()

const 所处 = computed(() => {
  // 访问 updateCounter 以建立响应式依赖
  updateCounter.value
  if (!bugNest.value) return null
  return stateValue(bugNest.value, '所处')
})

const 空间now = computed(() => {
  // 访问 updateCounter 以建立响应式依赖
  updateCounter.value
  if (!bugNest.value) return 0
  return stateValue(bugNest.value, ['空间', 'now'])
})

const 空间max = computed(() => {
  // 访问 updateCounter 以建立响应式依赖
  updateCounter.value
  if (!bugNest.value) return 0
  return stateValue(bugNest.value, ['空间', 'max'])
})

const 生产 = computed(() => {
  // 访问 updateCounter 以建立响应式依赖
  updateCounter.value
  if (!bugNest.value) return 0
  return stateValue(bugNest.value, '生产')
})

const 消耗 = computed(() => {
  // 访问 updateCounter 以建立响应式依赖
  updateCounter.value
  if (!bugNest.value) return 0
  return stateValue(bugNest.value, '消耗')
})
</script>

<style scoped>
.bugnest-info {
  padding: 8px;
}

.info-row {
  margin-bottom: 8px;
  display: flex;
  align-items: center;
}

.label {
  font-weight: 600;
  margin-right: 8px;
  min-width: 60px;
}
</style>
