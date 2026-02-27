<template>
  <Tile title="工作" :closeable="true" :object="bugNest">
    <div class="work-tile-content">
      <div class="add-work-btn" @click="showWorkMenu">新增工作</div>
      <div class="work-container">
        <div
          v-for="work in 进行中工作"
          :key="work"
          class="work-div"
        >
          <ObjectDiv :object="work" />
          <div class="work-info">
            <div class="state">进度：{{ getProgress(work) }}</div>
            <div class="state">效率：{{ getEfficiency(work) }}</div>
          </div>
          <div class="close-btn work-delete" @click.stop="deleteWork(work)"></div>
        </div>
      </div>
    </div>
  </Tile>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import Tile from '../common/Tile.vue'
import ObjectDiv from '../common/ObjectDiv.vue'
import { hiddenValue } from '../../core/state/Hidden'
import { stateValue, getStateUnit } from '../../core/state/State'
import { stopWork } from '../../core/objects/Work'
import { subscribeObjectUpdate, getUpdateCounter } from '../../utils/reactivity'

const props = defineProps<{
  bugNest: any
}>()

// 订阅更新计数器以触发响应式更新
const updateCounter = getUpdateCounter()

const 进行中工作 = computed(() => {
  // 访问 updateCounter 以建立响应式依赖
  updateCounter.value
  if (!props.bugNest) return []
  return hiddenValue(props.bugNest, ['进行中', '工作']) || []
})

function getProgress(work: any): string {
  // 访问 updateCounter 以建立响应式依赖
  updateCounter.value
  const 当前进度 = stateValue(work, ['进度', 'now'])
  const 最大进度 = stateValue(work, ['进度', 'max'])
  const unit = getStateUnit(work, '进度')
  return `${当前进度}/${最大进度}${unit || ''}`
}

function getEfficiency(work: any): string {
  // 访问 updateCounter 以建立响应式依赖
  updateCounter.value
  const 总效率 = hiddenValue(work, '总效率')
  const unit = getStateUnit(work, '效率')
  return `${总效率}${unit || ''}`
}

function deleteWork(work: any): void {
  stopWork(work, '中断')
}

function showWorkMenu(): void {
  // TODO: 显示工作菜单，由 WorkMenu 组件实现
  console.log('显示工作菜单')
}
</script>

<style scoped lang="scss">
.work-tile-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.add-work-btn {
  max-width: 300px;
  height: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 3px dashed black;
  border-radius: 5px;
  padding: 10px 0;
  margin-top: 4px;
  margin-right: 4px;
  cursor: pointer;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
}

.work-container {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.work-div {
  flex: 1 1 300px;
  min-height: 55px;
  max-width: 300px;
  border: 2px solid black;
  border-radius: 5px;
  position: relative;
  padding: 10px 0;
  display: flex;
  align-items: center;

  > :deep(.object) {
    font-weight: bold;
    font-size: 20px;
    width: 30%;
    text-align: center;
    padding: 0 5px;
  }
}

.work-info {
  text-align: left;

  .state {
    font-size: 14px;
  }
}

.work-delete {
  position: absolute;
  right: 2px;
  top: 2px;
  width: 20px;
  height: 20px;
  cursor: pointer;

  &::before,
  &::after {
    content: '';
    position: absolute;
    width: 12px;
    height: 2px;
    background: black;
    top: 50%;
    left: 50%;
  }

  &::before {
    transform: translate(-50%, -50%) rotate(45deg);
  }

  &::after {
    transform: translate(-50%, -50%) rotate(-45deg);
  }

  &:hover {
    opacity: 0.7;
  }
}
</style>
