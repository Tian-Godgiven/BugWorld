<template>
    <div
        v-if="isVisible"
        ref="tileRef"
        :class="{ 'tile': !isMenu, 'tile-menu': isMenu }"
        :style="tileStyle"
        @mousedown="handleMouseDown"
    >
        <!-- 标题 -->
        <div class="tile-name" :class="{ 'tile-name-center': titleCenter }">{{ title }}</div>

        <!-- 内容区域 -->
        <div class="tile-data">
            <slot></slot>
        </div>

        <!-- 按钮容器 -->
        <div class="tile-button-container">
            <!-- 清空按钮 -->
            <div v-if="showClearButton" class="tile-button button clear-btn" @click="handleClear"></div>
            <!-- 关闭按钮 -->
            <div
                v-if="closeType !== false"
                class="tile-button button close-btn"
                :data-type="closeType"
                @click="handleClose"
            ></div>
        </div>

        <!-- 调整大小的手柄 -->
        <div v-if="resizable" class="resize-handle" @mousedown="handleResizeMouseDown"></div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'

/**
 * Tile 组件 - 可拖动、可调整大小的窗口
 *
 * 从 src/js/Modules/tile/tile.js 迁移
 */

interface TileProps {
    title: string // 标题
    isMenu?: boolean // 是否是菜单
    draggable?: boolean // 是否可拖动（默认 true）
    resizable?: boolean // 是否可调整大小（默认 true）
    closeType?: 'delete' | 'hide' | false // 关闭方式（delete: 删除, hide: 隐藏, false: 无关闭按钮）
    showClearButton?: boolean // 是否显示清空按钮
    titleCenter?: boolean // 标题是否居中
    position?: { left?: number | string; top?: number | string } // 初始位置
    size?: { width?: number | string; height?: number | string } // 初始尺寸
    initialVisible?: boolean // 初始是否可见
}

const props = withDefaults(defineProps<TileProps>(), {
    isMenu: false,
    draggable: true,
    resizable: true,
    closeType: 'delete',
    showClearButton: false,
    titleCenter: false,
    initialVisible: true
})

const emit = defineEmits<{
    close: []
    clear: []
    'update:visible': [visible: boolean]
}>()

const tileRef = ref<HTMLElement | null>(null)
const isVisible = ref(props.initialVisible)
const zIndex = ref(1000)

// 拖动相关状态
const isDragging = ref(false)
const dragStartX = ref(0)
const dragStartY = ref(0)
const tileLeft = ref<number | string>('auto')
const tileTop = ref<number | string>('auto')

// 尺寸相关状态
const tileWidth = ref<number | string>('auto')
const tileHeight = ref<number | string>('auto')

// 计算样式
const tileStyle = computed(() => {
    const style: any = {
        width: typeof tileWidth.value === 'number' ? `${tileWidth.value}px` : tileWidth.value,
        height: typeof tileHeight.value === 'number' ? `${tileHeight.value}px` : tileHeight.value,
        zIndex: zIndex.value
    }

    // 只有在明确设置了位置时才添加 left 和 top
    if (tileLeft.value !== 'auto') {
        style.left = typeof tileLeft.value === 'number' ? `${tileLeft.value}px` : tileLeft.value
    }
    if (tileTop.value !== 'auto') {
        style.top = typeof tileTop.value === 'number' ? `${tileTop.value}px` : tileTop.value
    }

    return style
})

// 初始化位置和尺寸
onMounted(() => {
    initializePosition()
    initializeSize()

    // 如果有 position 属性，说明是动态创建的弹窗，需要置顶
    if (props.position) {
        // 使用 nextTick 确保 DOM 已经渲染
        nextTick(() => {
            bringToTop()
        })
    }
})

// 监听 position 变化（只在有 position 时才监听）
watch(() => props.position, (newPosition) => {
    if (newPosition) {
        if (newPosition.left !== undefined) {
            tileLeft.value = typeof newPosition.left === 'number' ? newPosition.left : parseInt(newPosition.left as string)
        }
        if (newPosition.top !== undefined) {
            tileTop.value = typeof newPosition.top === 'number' ? newPosition.top : parseInt(newPosition.top as string)
        }
    }
}, { immediate: true, deep: true })

// 初始化位置
function initializePosition() {
    if (props.position) {
        if (props.position.left !== undefined) {
            tileLeft.value = typeof props.position.left === 'number' ? props.position.left : parseInt(props.position.left as string)
        }
        if (props.position.top !== undefined) {
            tileTop.value = typeof props.position.top === 'number' ? props.position.top : parseInt(props.position.top as string)
        }
    }
}

// 初始化尺寸
function initializeSize() {
    if (props.size) {
        if (props.size.width !== undefined) {
            tileWidth.value = props.size.width
        }
        if (props.size.height !== undefined) {
            tileHeight.value = props.size.height
        }
    }
}

// 置顶功能
const bringToTop = () => {
    // 找到所有 tile 的最大 z-index
    const allTiles = document.querySelectorAll('.tile')
    let maxZIndex = 1000
    allTiles.forEach((tile) => {
        const z = parseInt(window.getComputedStyle(tile).zIndex || '0')
        if (z > maxZIndex) {
            maxZIndex = z
        }
    })
    zIndex.value = maxZIndex + 1
}

// 鼠标按下（开始拖动或置顶）
const handleMouseDown = (e: MouseEvent) => {
    bringToTop()

    if (!props.draggable) return
    if ((e.target as HTMLElement).closest('.tile-button')) return // 点击按钮时不拖动

    isDragging.value = true

    // 如果当前位置是 auto，则使用元素的实际位置
    const currentLeft = tileLeft.value === 'auto' ? (tileRef.value?.offsetLeft || 0) : (typeof tileLeft.value === 'number' ? tileLeft.value : parseInt(tileLeft.value as string))
    const currentTop = tileTop.value === 'auto' ? (tileRef.value?.offsetTop || 0) : (typeof tileTop.value === 'number' ? tileTop.value : parseInt(tileTop.value as string))

    dragStartX.value = e.clientX - currentLeft
    dragStartY.value = e.clientY - currentTop

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
}

// 鼠标移动（拖动）
const handleMouseMove = (e: MouseEvent) => {
    if (isDragging.value) {
        tileLeft.value = e.clientX - dragStartX.value
        tileTop.value = e.clientY - dragStartY.value
    } else if (isResizing.value) {
        const newWidth = e.clientX - (tileRef.value?.offsetLeft || 0)
        const newHeight = e.clientY - (tileRef.value?.offsetTop || 0)

        // 设置最小尺寸
        tileWidth.value = Math.max(200, newWidth)
        tileHeight.value = Math.max(50, newHeight)
    }
}

// 鼠标释放（结束拖动或调整大小）
const handleMouseUp = () => {
    isDragging.value = false
    isResizing.value = false
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
}

// 调整大小相关状态
const isResizing = ref(false)

// 开始调整大小
const handleResizeMouseDown = (e: MouseEvent) => {
    if (!props.resizable) return

    e.stopPropagation() // 防止触发拖动
    isResizing.value = true

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
}

// 关闭
const handleClose = () => {
    if (props.closeType === 'delete') {
        isVisible.value = false
        emit('update:visible', false)
    } else if (props.closeType === 'hide') {
        isVisible.value = false
        emit('update:visible', false)
    }
    emit('close')
}

// 清空
const handleClear = () => {
    emit('clear')
}

// 清理事件监听
onUnmounted(() => {
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
})

// 暴露方法
defineExpose({
    bringToTop,
    show: () => {
        isVisible.value = true
        bringToTop()
    },
    hide: () => {
        isVisible.value = false
    },
    toggle: () => {
        if (isVisible.value) {
            isVisible.value = false
        } else {
            isVisible.value = true
            bringToTop()
        }
    },
    isVisible: () => {
        return isVisible.value
    }
})
</script>

<style scoped>
.tile {
    box-sizing: border-box;
    position: fixed;

    width: 300px;
    height: 400px;

    min-width: 200px;
    min-height: 50px;

    padding: 2px;

    outline: 2px solid black;
    outline-offset: -4px;

    border: 2px solid transparent;

    background-color: white;
    z-index: 1;

    display: flex;
    flex-direction: column;
}

.tile-menu {
    box-sizing: border-box;
    position: fixed;

    width: 300px;
    height: 400px;

    left: calc(100% - 4px);
    top: -2px;

    min-width: 200px;
    min-height: 40px;

    padding: 2px;

    outline: 2px solid black;
    outline-offset: -4px;

    border: 2px solid transparent;

    background-color: white;
    z-index: 1;

    display: flex;
    flex-direction: column;
}

.tile-name {
    height: 30px;
    font-size: 25px;
    margin: 5px;
}

.tile-name-center {
    text-align: center;
}

.tile-button-container {
    max-width: 70px;
    overflow: hidden;
    display: flex;
    position: absolute;
    right: 4px;
    top: 4px;
}

.tile-button {
    width: 20px;
    height: 20px;
    margin-left: 2px;

    border: 2px solid black;
    border-radius: 3px;

    box-sizing: border-box;

    background-position: center;
    background-repeat: no-repeat;

    cursor: pointer;
}

.close-btn {
    background-image: url('@/assets/img/close.png');
    background-size: 80%;
}

.clear-btn {
    background-image: url('@/assets/img/clear.png');
    background-size: 120%;
}

.tile-data {
    height: calc(100% - 45px);

    overflow-y: overlay;
    overflow-x: hidden;

    font-size: 18px;
    margin-left: 5px;
    margin-bottom: 5px;

    word-wrap: break-word;
    word-break: break-word;
}

.resize-handle {
    position: absolute;
    right: 0;
    bottom: 0;
    width: 16px;
    height: 16px;
    cursor: se-resize;
    background: linear-gradient(135deg, transparent 50%, #000 50%);
}
</style>
