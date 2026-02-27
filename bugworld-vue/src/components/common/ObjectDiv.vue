<template>
  <div class="object">
    <!-- 特性对象 -->
    <div
      v-if="isCharacteristic"
      class="object_click object_characteristic"
      @click="showInfo"
    >
      「{{ 名称 }}」
    </div>
    <!-- 普通对象 -->
    <div v-else-if="object?.type === 'object'">
      <span class="object_click object_name" @click="showInfo">{{ 名称 }}</span>
      <span v-if="showNum"> x{{ 数量 }}</span>
      <span v-if="showLevel && 等级 !== '无'"> lv.{{ 等级 }}</span>
    </div>
    <!-- 非对象（纯文本） -->
    <div v-else>{{ object }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { stateValue } from '../../core/state/State'

const props = defineProps<{
  object: any
  showNum?: boolean
  showLevel?: boolean
}>()

const isCharacteristic = computed(() => {
  return props.object?.constructor?.name === 'Characteristic'
})

const 名称 = computed(() => {
  if (props.object?.type === 'object' || isCharacteristic.value) {
    return stateValue(props.object, '名称')
  }
  return props.object
})

const 数量 = computed(() => {
  if (props.object?.type === 'object') {
    return stateValue(props.object, '数量')
  }
  return null
})

const 等级 = computed(() => {
  if (props.object?.type === 'object') {
    return stateValue(props.object, '等级')
  }
  return null
})

function showInfo() {
  // TODO: 显示对象详细信息
  console.log('显示对象信息:', props.object)
}
</script>

<style scoped>
/* 使用原始 CSS，不添加自定义样式 */
.object_click {
  cursor: pointer;
}

.object_click:hover {
  text-decoration: underline;
}
</style>
