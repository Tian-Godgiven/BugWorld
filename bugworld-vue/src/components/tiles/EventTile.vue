<template>
  <Tile title="事件" :closeable="true" :object="bugNest">
    <!-- 事件概率信息 -->
    <div class="event-info">
      <div>下一回合的事件信息</div>
      <div>事件概率：{{ 事件概率 }}</div>
      <div>事件倾向：{{ 事件倾向 }}</div>
      <div>事件强度：{{ 事件强度 }}</div>
    </div>

    <!-- 预告中事件 -->
    <div class="event-container">
      <div class="event-section-title" @click="toggle预告">预告</div>
      <div v-show="show预告" class="event-section-body">
        <div v-for="event in 预告中事件" :key="event" class="event-div">
          <ObjectDiv :object="event" />
          <div class="event-time">{{ stateValue(event, '预告') + getStateUnit(event, '预告') }}后发生</div>
          <div>{{ stateValue(event, '效果') }}</div>
        </div>
      </div>
    </div>

    <!-- 进行中事件 -->
    <div class="event-container">
      <div class="event-section-title" @click="toggle进行">正在进行</div>
      <div v-show="show进行" class="event-section-body">
        <div v-for="event in 进行中事件" :key="event" class="event-div">
          <ObjectDiv :object="event" />
          <div class="event-time">持续{{ stateValue(event, '持续') + getStateUnit(event, '持续') }}</div>
          <div>{{ stateValue(event, '效果') }}</div>
        </div>
      </div>
    </div>

    <!-- 留存中事件 -->
    <div class="event-container">
      <div class="event-section-title" @click="toggle留存">留存</div>
      <div v-show="show留存" class="event-section-body">
        <div v-for="event in 留存中事件" :key="event" class="event-div">
          <ObjectDiv :object="event" />
          <div class="event-time">已经结束</div>
          <div>{{ stateValue(event, '效果') }}</div>
        </div>
      </div>
    </div>
  </Tile>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Tile from '../common/Tile.vue'
import ObjectDiv from '../common/ObjectDiv.vue'
import { stateValue, getStateUnit } from '../../core/state/State'
import { hiddenValue } from '../../core/state/Hidden'
import { getUpdateCounter } from '../../utils/reactivity'

const props = defineProps<{
  bugNest: any
}>()

// 订阅更新计数器以触发响应式更新
const updateCounter = getUpdateCounter()

const show预告 = ref(true)
const show进行 = ref(true)
const show留存 = ref(false)

const toggle预告 = () => { show预告.value = !show预告.value }
const toggle进行 = () => { show进行.value = !show进行.value }
const toggle留存 = () => { show留存.value = !show留存.value }

const 进行中事件列表 = computed(() => {
  // 访问 updateCounter 以建立响应式依赖
  updateCounter.value
  if (!props.bugNest) return []
  return hiddenValue(props.bugNest, ['进行中', '事件']) || []
})

const 预告中事件 = computed(() =>
  进行中事件列表.value.filter((e: any) => hiddenValue(e, '预告中') === true)
)
const 进行中事件 = computed(() =>
  进行中事件列表.value.filter((e: any) => hiddenValue(e, '进行中') === true)
)
const 留存中事件 = computed(() =>
  进行中事件列表.value.filter((e: any) => hiddenValue(e, '存留中') === true)
)

const 事件概率 = computed(() => {
  // 访问 updateCounter 以建立响应式依赖
  updateCounter.value
  if (!props.bugNest) return '-'
  const area = stateValue(props.bugNest, '所处')
  if (!area) return '-'
  const 总概率 = stateValue(area, '繁荣', 'num') + 100
  const 当前概率 = 总概率 - hiddenValue(props.bugNest, ['事件信息', '概率边界'])
  return Math.round(当前概率 / 总概率 * 100) + '%'
})

const 事件倾向 = computed(() => {
  // 访问 updateCounter 以建立响应式依赖
  updateCounter.value
  if (!props.bugNest) return '-'
  const area = stateValue(props.bugNest, '所处')
  if (!area) return '-'
  const 倾向边界 = hiddenValue(props.bugNest, ['事件信息', '倾向边界'])
  const 好事倾向 = stateValue(area, '平和', 'num') + 5
  const 坏事倾向 = stateValue(area, '威胁', 'num') + 5
  const 倾向总值 = 好事倾向 + 坏事倾向
  const 好事概率 = Math.round((好事倾向 - 倾向边界) / 倾向总值 * 100)
  const 坏事概率 = 100 - 好事概率
  return `[好事：${好事概率}%/坏事：${坏事概率}%]`
})

const 事件强度 = computed(() => {
  // 访问 updateCounter 以建立响应式依赖
  updateCounter.value
  if (!props.bugNest) return '-'
  const area = stateValue(props.bugNest, '所处')
  if (!area) return '-'
  const 收益 = stateValue(area, '收益', 'num')
  const 险恶 = stateValue(area, '险恶', 'num')
  return `[好事：${收益}~${收益 + 10}/坏事：${险恶}~${险恶 + 10}]`
})
</script>

<style scoped lang="scss">
.event-info {
  border-top: 2px solid black;
  padding: 6px 0;
  font-size: 13px;
  line-height: 1.8;
}

.event-container {
  border-top: 2px solid black;

  .event-section-title {
    padding: 4px 6px;
    font-weight: bold;
    cursor: pointer;
    user-select: none;

    &:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }
  }

  .event-section-body {
    padding: 4px;
  }
}

.event-div {
  position: relative;
  border: 1px solid black;
  margin-right: 4px;
  margin-bottom: 4px;
  overflow: hidden;
  padding: 6px;
  font-size: 13px;

  .event-time {
    position: absolute;
    top: 0;
    right: 10px;
    font-size: 12px;
    color: #666;
  }
}
</style>
