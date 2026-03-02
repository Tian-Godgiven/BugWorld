<template>
  <div v-if="object" class="object" :class="objectClass">
    <!-- 特性对象 -->
    <span
      v-if="isCharacteristic"
      class="object_click object_characteristic"
      @click.stop="handleClick"
    >
      「{{ 名称 }}」
    </span>

    <!-- 普通对象 -->
    <template v-else-if="object.type === 'object'">
      <span class="object_click object_name" @click.stop="handleClick">
        {{ 名称 }}
      </span>
    </template>

    <!-- 非对象类型，直接显示 -->
    <template v-else>
      {{ object }}
    </template>

    <!-- 显示数量 -->
    <span v-if="method === 'num' && 数量">
      x {{ 数量 }}
    </span>

    <!-- 显示等级 -->
    <span v-if="method === 'level' && 等级 && 等级 !== '无'">
      lv.{{ 等级 }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'
import { stateValue } from '../../core/state/State'

const props = defineProps<{
  object: any
  method?: 'num' | 'level'
}>()

const emit = defineEmits<{
  click: [object: any, event: MouseEvent]
}>()

// 注入 showInformation 方法
const showInformation = inject<(object: any, event: MouseEvent) => void>('showInformation')

// 判断是否是特性对象
const isCharacteristic = computed(() => {
  return props.object?.constructor?.name === 'Characteristic'
})

// 获取对象类名
const objectClass = computed(() => {
  return props.object?.constructor?.name?.toLowerCase() || ''
})

// 获取对象名称
const 名称 = computed(() => {
  if (!props.object || props.object.type !== 'object') return ''
  return stateValue(props.object, '名称')
})

// 获取对象数量
const 数量 = computed(() => {
  if (!props.object || props.object.type !== 'object') return null
  return stateValue(props.object, '数量')
})

// 获取对象等级
const 等级 = computed(() => {
  if (!props.object || props.object.type !== 'object') return null
  return stateValue(props.object, '等级')
})

// 处理点击事件
const handleClick = (event: MouseEvent) => {
  // 先发出事件给父组件
  emit('click', props.object, event)

  // 如果有全局的 showInformation，也调用它
  if (showInformation) {
    showInformation(props.object, event)
  }
}
</script>

<style scoped>
/* 从 src/css/modules/objectDiv.css 迁移 */
.object {
    flex: none;
    display: inline-block;
}

.object_click {
    cursor: pointer;
}

.object_click:hover {
    text-decoration: underline;
}

.object_name {
    font-weight: normal;
}

.object_characteristic {
    font-style: italic;
}
</style>
