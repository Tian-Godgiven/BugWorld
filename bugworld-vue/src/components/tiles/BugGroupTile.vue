<template>
  <Tile :名称="'虫群信息'" :功能="{ 关闭: 'cube' }">
    <div v-if="bugNest" class="buggroup-info">
      <div v-for="(bugs, key) in 虫群" :key="key" class="bug-group">
        <div class="bug-type">{{ key }}：</div>
        <div v-for="(bug, index) in bugs" :key="index" class="bug-item">
          <ObjectDiv :object="bug" method="num" />
        </div>
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

const 虫群 = computed(() => {
  // 访问 updateCounter 以建立响应式依赖
  updateCounter.value
  if (!bugNest.value) return {}
  return stateValue(bugNest.value, '虫群')
})
</script>

<style scoped>
.buggroup-info {
  padding: 8px;
}

.bug-group {
  margin-bottom: 12px;
}

.bug-type {
  font-weight: 600;
  margin-bottom: 4px;
}

.bug-item {
  margin-left: 16px;
  margin-bottom: 4px;
}
</style>
