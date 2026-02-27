<template>
  <Tile title="设施" :closeable="true" :object="bugNest">
    <div class="facility-container">
      <div
        v-for="facility in 所有设施"
        :key="facility"
        class="facility-div"
      >
        <ObjectDiv :object="facility" show-level />
        <div class="facility-info">
          <div>数量：{{ stateValue(facility, '数量') }}</div>
          <div>{{ getEntryText(facility) }}</div>
          <div>{{ stateValue(facility, '效果') }}</div>
        </div>
        <div class="facility-btn-container">
          <div class="button facility-control-btn" @click="showFacilityMenu(facility)">控制</div>
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
import { getUpdateCounter } from '../../utils/reactivity'

const props = defineProps<{
  bugNest: any
}>()

// 订阅更新计数器以触发响应式更新
const updateCounter = getUpdateCounter()

const 所有设施 = computed(() => {
  // 访问 updateCounter 以建立响应式依赖
  updateCounter.value
  if (!props.bugNest) return []
  const facilities = stateValue(props.bugNest, '设施')
  if (!facilities) return []
  const result: any[] = []
  for (const key in facilities) {
    for (const facility of facilities[key]) {
      result.push(facility)
    }
  }
  return result
})

function getEntryText(facility: any): string {
  // 访问 updateCounter 以建立响应式依赖
  updateCounter.value
  const 词条 = stateValue(facility, '词条')
  if (!词条 || !词条.length) return ''
  return 词条.map((e: string) => `[${e}]`).join('')
}

function showFacilityMenu(facility: any): void {
  // TODO: 显示设施控制菜单
  console.log('显示设施菜单', facility)
}
</script>

<style scoped lang="scss">
.facility-container {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.facility-div {
  display: flex;
  align-items: center;
  padding: 8px;
  border: 2px solid #555;
  border-radius: 5px;
  gap: 10px;

  .facility-info {
    flex: 1;
    font-size: 13px;
    line-height: 1.6;
  }

  .facility-btn-container {
    .button {
      padding: 3px 8px;
      border: 2px solid black;
      border-radius: 3px;
      cursor: pointer;
      font-size: 13px;

      &:hover {
        background-color: rgba(0, 0, 0, 0.1);
      }
    }
  }
}
</style>
