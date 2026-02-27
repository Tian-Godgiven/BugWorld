<template>
  <div
    ref="tileRef"
    class="tile"
    :id="名称"
    :style="tileStyle"
    v-show="!最小化"
    @mousedown="handleMouseDown"
  >
    <div class="tile_name">{{ 名称 }}</div>
    <div class="tile_data">
      <slot />
    </div>
    <div class="tile_button_container">
      <div
        v-if="功能?.清空"
        class="tile_button button clear_btn"
        @click="$emit('clear')"
      />
      <div
        v-if="功能?.关闭 !== false"
        class="tile_button button close_btn"
        :type="功能?.关闭"
        @click="onClose"
      />
    </div>
    <!-- 调整尺寸手柄 -->
    <div
      v-if="功能?.修改尺寸 !== false"
      class="resize-handle"
      @mousedown.stop="handleResizeStart"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface TileAbility {
  关闭?: boolean | 'cube' | 'hide' | 'delete'
  清空?: boolean
  拖动?: boolean
  修改尺寸?: boolean
  标题居中?: boolean
  位置?: { left?: number; top?: number }
  尺寸?: { width?: number | string; height?: number | string }
  对象?: any
}

const props = withDefaults(
  defineProps<{
    名称: string
    功能?: TileAbility
  }>(),
  {
    功能: () => ({})
  }
)

const emit = defineEmits<{
  close: []
  clear: []
  cube: []
}>()

const tileRef = ref<HTMLElement>()
const 最小化 = ref(false)
const zIndex = ref(1)

// 拖拽相关
const isDragging = ref(false)
const position = ref({ x: 0, y: 0 })
let dragStartX = 0
let dragStartY = 0
let dragOffsetX = 0
let dragOffsetY = 0

// 调整尺寸相关
const isResizing = ref(false)
const size = ref({ width: 300, height: 400 })
let resizeStartX = 0
let resizeStartY = 0
let resizeStartWidth = 0
let resizeStartHeight = 0

const tileStyle = computed(() => {
  const style: any = {
    zIndex: zIndex.value
  }

  if (position.value.x !== 0 || position.value.y !== 0) {
    style.left = position.value.x + 'px'
    style.top = position.value.y + 'px'
  } else if (props.功能?.位置) {
    if (props.功能.位置.left !== undefined) {
      style.left = typeof props.功能.位置.left === 'number'
        ? props.功能.位置.left + 'px'
        : props.功能.位置.left
    }
    if (props.功能.位置.top !== undefined) {
      style.top = typeof props.功能.位置.top === 'number'
        ? props.功能.位置.top + 'px'
        : props.功能.位置.top
    }
  }

  if (props.功能?.尺寸) {
    if (props.功能.尺寸.width !== undefined) {
      style.width = typeof props.功能.尺寸.width === 'number'
        ? props.功能.尺寸.width + 'px'
        : props.功能.尺寸.width
    }
    if (props.功能.尺寸.height !== undefined) {
      style.height = typeof props.功能.尺寸.height === 'number'
        ? props.功能.尺寸.height + 'px'
        : props.功能.尺寸.height
    }
  }

  if (props.功能?.标题居中) {
    style.textAlign = 'center'
  }

  return style
})

function handleMouseDown(e: MouseEvent) {
  const target = e.target as HTMLElement

  // 只允许从 tile_name 拖拽
  if (!target.classList.contains('tile_name')) return
  if (props.功能?.拖动 === false) return

  upToTop()

  isDragging.value = true
  dragStartX = e.clientX
  dragStartY = e.clientY

  const rect = tileRef.value!.getBoundingClientRect()
  dragOffsetX = rect.left
  dragOffsetY = rect.top

  document.addEventListener('mousemove', handleDragMove)
  document.addEventListener('mouseup', handleDragEnd)
  e.preventDefault()
}

function handleDragMove(e: MouseEvent) {
  if (!isDragging.value) return

  const deltaX = e.clientX - dragStartX
  const deltaY = e.clientY - dragStartY

  position.value.x = dragOffsetX + deltaX
  position.value.y = dragOffsetY + deltaY
}

function handleDragEnd() {
  isDragging.value = false
  document.removeEventListener('mousemove', handleDragMove)
  document.removeEventListener('mouseup', handleDragEnd)
}

function handleResizeStart(e: MouseEvent) {
  if (props.功能?.修改尺寸 === false) return

  isResizing.value = true
  resizeStartX = e.clientX
  resizeStartY = e.clientY
  resizeStartWidth = tileRef.value!.offsetWidth
  resizeStartHeight = tileRef.value!.offsetHeight

  document.addEventListener('mousemove', handleResizeMove)
  document.addEventListener('mouseup', handleResizeEnd)
  e.preventDefault()
  e.stopPropagation()
}

function handleResizeMove(e: MouseEvent) {
  if (!isResizing.value) return

  const deltaX = e.clientX - resizeStartX
  const deltaY = e.clientY - resizeStartY

  const newWidth = Math.max(200, resizeStartWidth + deltaX)
  const newHeight = Math.max(50, resizeStartHeight + deltaY)

  size.value.width = newWidth
  size.value.height = newHeight

  if (tileRef.value) {
    tileRef.value.style.width = newWidth + 'px'
    tileRef.value.style.height = newHeight + 'px'
  }
}

function handleResizeEnd() {
  isResizing.value = false
  document.removeEventListener('mousemove', handleResizeMove)
  document.removeEventListener('mouseup', handleResizeEnd)
}

function upToTop() {
  const tiles = document.querySelectorAll('.tile')
  let highest = 0
  tiles.forEach((t) => {
    const z = parseInt(getComputedStyle(t).zIndex) || 0
    highest = Math.max(highest, z)
  })
  zIndex.value = highest + 1
}

function onClose() {
  if (props.功能?.关闭 === 'cube') {
    emit('cube')
    createCube()
  } else if (props.功能?.关闭 === 'hide') {
    最小化.value = true
  } else if (props.功能?.关闭 === 'delete') {
    if (tileRef.value) {
      tileRef.value.remove()
    }
  } else {
    emit('close')
  }
}

function createCube() {
  // TODO: 创建 cube 到 cube_container
  console.log('创建 cube:', props.名称)
}

onMounted(() => {
  upToTop()
})

defineExpose({ upToTop, 最小化 })
</script>

<style scoped>
.resize-handle {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 15px;
  height: 15px;
  cursor: se-resize;
}

.resize-handle::after {
  content: '';
  position: absolute;
  right: 2px;
  bottom: 2px;
  width: 10px;
  height: 10px;
  border-right: 2px solid #999;
  border-bottom: 2px solid #999;
}
</style>
