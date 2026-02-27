<template>
  <Tile :名称="'日志'" :功能="{ 关闭: 'cube', 清空: true }" @clear="clearLog">
    <div v-for="(log, index) in logs" :key="index" class="log_div">
      <span v-for="(item, i) in log.内容" :key="i">
        <ObjectDiv v-if="isObject(item)" :object="item" />
        <span v-else>{{ item }}</span>
      </span>
    </div>
  </Tile>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Tile from '../common/Tile.vue'
import ObjectDiv from '../common/ObjectDiv.vue'
import { useLogStore } from '../../stores/log'

const logStore = useLogStore()
const logs = computed(() => logStore.logs)

function clearLog() {
  logStore.clearLog()
}

function isObject(item: any): boolean {
  return item && typeof item === 'object' && item.type === 'object'
}
</script>

<style scoped>
.log_div {
  padding: 4px 8px;
  border-bottom: 1px solid #eee;
}
</style>
