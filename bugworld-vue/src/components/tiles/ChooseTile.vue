<template>
  <Tile
    :title="title"
    :closeable="closeable"
    :center-title="centerTitle"
    :position="position"
    :size="size"
    class="choose-tile"
  >
    <!-- 选项文本 -->
    <div class="choose-text" v-html="text"></div>

    <!-- 选项容器 -->
    <div
      class="choice-container"
      :class="{ flex: 选项排列 === '横向' }"
    >
      <div
        v-for="(choice, index) in choices"
        :key="index"
        class="choice-div"
        :class="{
          'chosen': isChosen(index),
          'unable': submitted,
          'choice-vertical': 选项排列 === '竖向'
        }"
        :style="{ ...通用样式, ...choice.选项样式 }"
        @click="toggleChoice(index)"
      >
        <!-- 复选框 -->
        <input
          v-if="复选样式 === 'checkbox'"
          type="checkbox"
          class="choice-checkbox"
          :checked="isChosen(index)"
          :disabled="submitted"
        />
        <!-- 箭头 -->
        <div
          v-if="复选样式 === 'arrow'"
          class="choice-arrow arrow-right"
          :style="{ display: isChosen(index) ? 'block' : 'none' }"
        ></div>
        <!-- 选项内容 -->
        <span class="choice-text">
          <component v-if="choice.选项内容Component" :is="choice.选项内容Component" />
          <span v-else v-html="choice.选项内容"></span>
        </span>
      </div>
    </div>

    <!-- 额外按键 -->
    <div class="bonus-div">
      <div v-if="showConfirm" class="button confirm-btn" @click="submitChoose">确认</div>
      <div v-if="showCancel" class="button cancel-btn" @click="cancelChoose">取消</div>
    </div>
  </Tile>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import Tile from '../common/Tile.vue'
import { sortByLevel, countValue } from '../../utils/global_ability'
import mitt, { type Emitter } from 'mitt'

interface ChoiceOption {
  选项内容: string | any
  选项内容Component?: any
  选项事件?: {
    选中时?: (containerObject?: any, choiceObject?: any, index?: number) => any
    失去选中时?: (containerObject?: any, choiceObject?: any, index?: number) => any
    选择时?: (containerObject?: any, choiceObject?: any, index?: number) => any
    未选择时?: (containerObject?: any, choiceObject?: any, index?: number) => any
  }
  选项样式?: Record<string, any>
  选项样式类?: string[]
  对象?: any
  优先级?: number | string
  默认选中?: boolean
}

interface ChooseAbility {
  chooseTile_id?: string
  重复?: boolean | '关闭' | '取代'
  标题居中?: boolean
  对象?: any
  立即选择?: boolean
  关闭?: boolean
  复选?: { max?: number; min?: number }
  复选样式?: 'checkbox' | 'arrow' | false
  确认?: boolean
  取消?: boolean
  返回?: boolean | 'auto'
  选项排列?: '横向' | '竖向'
  通用样式?: Record<string, any>
  位置?: { top?: number; left?: number }
  尺寸?: { width?: string | number; height?: string | number }
}

const props = defineProps<{
  title?: string
  text: string
  choices: ChoiceOption[]
  ability?: ChooseAbility
  emitter: Emitter<any>
  submitId: string
}>()

const emit = defineEmits<{
  close: []
}>()

// 解析 ability 配置
const ability = computed(() => props.ability || {})
const centerTitle = computed(() => ability.value.标题居中 !== false)
const closeable = computed(() => {
  if (ability.value.关闭 === true) return true
  if (ability.value.关闭 === false) return false
  return 'delete'
})
const position = computed(() => ability.value.位置)
const size = computed(() => ability.value.尺寸)
const 通用样式 = computed(() => ability.value.通用样式 || {})

// 复选配置
const 复选值 = computed(() => {
  const 复选 = ability.value.复选
  let max = 1
  let min = 1
  if (复选) {
    max = 复选.max && 复选.max >= 1 ? 复选.max : 1
    min = 复选.min && 复选.min >= 1 ? 复选.min : 1
  }
  if (max < min) {
    throw new Error('错误：在设置选项容器的复选值时，复选值的max小于了min')
  }
  return { max, min }
})

const 复选样式 = computed(() => {
  if (ability.value.复选样式 != null) {
    return ability.value.复选样式
  }
  return 复选值.value.max > 1 ? 'checkbox' : false
})

const 选项排列 = computed(() => {
  if (ability.value.选项排列) {
    return ability.value.选项排列
  }
  return 复选值.value.max > 1 ? '竖向' : '横向'
})

const showConfirm = computed(() => ability.value.确认 !== false)
const showCancel = computed(() => ability.value.取消 !== false)
const 需要确认 = computed(() => ability.value.确认 !== false)
const 返回设置 = computed(() => {
  if (ability.value.返回 === true || ability.value.返回 === false) {
    return ability.value.返回
  }
  return 'auto'
})
const 自动关闭 = computed(() => ability.value.关闭 !== true && ability.value.关闭 !== false)

// 状态
const 已选择 = ref<number[]>([])
const submitted = ref(false)

// 初始化默认选中
onMounted(() => {
  props.choices.forEach((choice, index) => {
    if (choice.默认选中) {
      chooseChoice(index)
    }
  })
})

function isChosen(index: number): boolean {
  return 已选择.value.includes(index)
}

function toggleChoice(index: number): void {
  if (submitted.value) return

  if (isChosen(index)) {
    unchooseChoice(index)
  } else {
    chooseChoice(index)
  }
}

function chooseChoice(index: number): void {
  if (isChosen(index)) return

  // 检测已选择数量是否超过最大值
  if (已选择.value.length === 复选值.value.max) {
    const shiftIndex = 已选择.value.shift()
    if (shiftIndex !== undefined) {
      unchooseChoice(shiftIndex)
    }
  }

  // 选中
  已选择.value.push(index)

  // 触发选中时事件
  runChoiceEvent(index, '选中时')

  // 判断是否自动提交
  if (已选择.value.length === 复选值.value.max && !需要确认.value) {
    submitChoose()
  }
}

function unchooseChoice(index: number): void {
  if (!isChosen(index)) return

  // 取消选中
  const idx = 已选择.value.indexOf(index)
  if (idx !== -1) {
    已选择.value.splice(idx, 1)
  }

  // 触发失去选中时事件
  runChoiceEvent(index, '失去选中时')
}

function submitChoose(): void {
  // 验证选择数量
  if (已选择.value.length < 复选值.value.min) {
    console.log('需要选择更多选项')
    return
  }
  if (已选择.value.length > 复选值.value.max) {
    console.log('选择的选项过多')
    return
  }

  // 按优先级排序
  const array = props.choices.map((choice, index) => ({
    对象: index,
    优先级: choice.优先级 || 0
  }))
  const sorted_indices = sortByLevel(array)

  // 执行选项事件并计算返回值
  let returnValue: any
  for (const index of sorted_indices) {
    if (isChosen(index)) {
      const value = runChoiceEvent(index, '选择时')
      returnValue = countValue(returnValue, value)
    } else {
      const value = runChoiceEvent(index, '未选择时')
      returnValue = countValue(returnValue, value)
    }
  }

  submitted.value = true

  // 判断是否返回值
  let ifReturn = false
  if (返回设置.value === true) {
    ifReturn = true
  } else if (返回设置.value === 'auto' && returnValue) {
    ifReturn = true
  }

  // 发送事件
  if (ifReturn) {
    props.emitter.emit(props.submitId, returnValue)
  } else {
    props.emitter.emit(props.submitId, false)
  }

  // 自动关闭
  if (自动关闭.value) {
    emit('close')
  }
}

function cancelChoose(): void {
  // 取消所有选中
  const chosen = [...已选择.value]
  chosen.forEach(index => unchooseChoice(index))
}

function runChoiceEvent(index: number, eventName: string): any {
  const choice = props.choices[index]
  if (!choice.选项事件) return

  const func = choice.选项事件[eventName as keyof typeof choice.选项事件]
  if (func) {
    const choiceObject = choice.对象
    const containerObject = ability.value.对象
    return func(containerObject, choiceObject, index)
  }
}
</script>

<style scoped lang="scss">
.choose-tile {
  :deep(.tile-data) > div {
    width: 90%;
    margin: auto;
  }
}

.choose-text {
  margin: 8px 0;
}

.choice-container {
  margin: 10px 0;
  margin-right: 8px;

  &.flex {
    display: flex;
    align-items: stretch;
    justify-content: center;
    gap: 1px 5px;
  }
}

.choice-div {
  border: 1px solid black;
  min-width: 50px;
  max-width: 200px;
  padding: 0 5px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;

  &.chosen {
    background-color: lightgray;
  }

  &.unable {
    pointer-events: none;
    opacity: 0.6;
  }

  &.choice-vertical {
    border: none;
    padding: 1px 0;
    margin: 0;
    margin-right: 8px;
    flex-direction: row;
  }

  .choice-text {
    width: 100%;
    word-wrap: break-word;
    hyphens: auto;
  }

  .choice-checkbox {
    margin-right: 4px;
  }

  .choice-arrow {
    width: 0;
    height: 0;
    border-style: solid;
    margin-right: 6px;

    &.arrow-right {
      border-width: 5px 0 5px 8px;
      border-color: transparent transparent transparent #000;
    }
  }
}

.bonus-div {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: right;

  > div {
    border: 1px solid black;
    padding: 2px 4px;
    margin: 5px;
    margin-left: 0;
    cursor: pointer;

    &:hover {
      background-color: rgba(0, 0, 0, 0.1);
    }
  }
}
</style>
