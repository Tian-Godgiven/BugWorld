<template>
    <Teleport to="body">
        <Tile
            v-for="modal in modals"
            :key="modal.name"
            :ref="(el) => setTileRef(modal.name, el)"
            :title="modal.name"
            :close-type="'delete'"
            :initial-visible="true"
            :position="modal.position"
            :size="{ width: 300 }"
            class="information-modal"
            :style="{ height: modal.height }"
            @close="closeModal(modal.name)"
        >
            <!-- 如果是对象信息，显示StateDisplay -->
            <StateDisplay v-if="modal.isObject" :object="modal.object" :states="modal.object.属性" />

            <!-- 如果是文本信息，直接显示 -->
            <div v-else class="information-text" v-html="modal.content"></div>
        </Tile>
    </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import Tile from './Tile.vue'
import StateDisplay from './StateDisplay.vue'
import { stateValue } from '@/core/state/State'
import { appendLog } from '@/utils/log'
import InformationLib from '@/library/Information_lib.json'

/**
 * 信息弹窗组件
 *
 * 从 src/js/Modules/information.js 迁移
 *
 * 功能需求：
 * 1. 显示对象的详细信息
 * 2. 显示属性的介绍信息（从 Information_lib.json 读取）
 * 3. 如果已存在相同名称的信息框，则置顶显示
 * 4. 支持关闭按钮
 * 5. 根据内容自动调整高度
 *
 * 原文件位置：src/js/Modules/information.js (58 行)
 */

interface Modal {
    name: string
    content: string
    object?: any
    isObject: boolean
    height: string
    position?: { left: number; top: number }
}

const modals = ref<Modal[]>([])
const tileRefs = ref<Map<string, any>>(new Map())

// 设置Tile引用
function setTileRef(name: string, el: any): void {
    if (el) {
        tileRefs.value.set(name, el)
    }
}

// 创建信息框
function createInformation(name: string, content: string | any, object?: any, position?: { left: number; top: number }): void {
    // 如果已经存在对应名称的modal，则置顶
    const existingIndex = modals.value.findIndex((m) => m.name === name)
    if (existingIndex !== -1) {
        // 将已存在的modal移到最后（最上层）
        const existing = modals.value.splice(existingIndex, 1)[0]
        modals.value.push(existing)

        // 置顶对应的Tile
        const tileRef = tileRefs.value.get(name)
        if (tileRef && tileRef.bringToTop) {
            tileRef.bringToTop()
        }
        return
    }

    // 创建新的modal
    const isObject = typeof content !== 'string'
    let height = 'auto'

    // 根据内容调整高度
    if (typeof content === 'string') {
        height = `${100 + content.length}px`
    }

    modals.value.push({
        name,
        content: isObject ? '' : content,
        object: isObject ? content : object,
        isObject,
        height,
        position
    })

    // 记录到日志
    if (object) {
        appendLog(['信息：', object])
    }
}

// 显示对象信息
function showInformation(object: any, event?: MouseEvent): void {
    const name = stateValue(object, '名称')
    const position = event ? { left: event.clientX, top: event.clientY } : undefined
    createInformation(name, object, object, position)
}

// 显示属性介绍
function showStateInformation(stateName: string, event?: MouseEvent): void {
    const information = (InformationLib as any)[stateName]
    if (information) {
        const position = event ? { left: event.clientX, top: event.clientY } : undefined
        createInformation(stateName, information, undefined, position)
    }
}

// 关闭信息框
function closeModal(name: string): void {
    const index = modals.value.findIndex((m) => m.name === name)
    if (index !== -1) {
        modals.value.splice(index, 1)
        tileRefs.value.delete(name)
    }
}

// 点击属性名显示属性介绍
function handleStateClick(event: MouseEvent): void {
    const target = event.target as HTMLElement
    if (target.classList.contains('state') || target.closest('.state > div:first-child')) {
        event.stopPropagation()
        const stateDiv = target.closest('.state > div:first-child') as HTMLElement
        if (stateDiv) {
            const stateName = stateDiv.textContent?.replace('：', '') || ''
            showStateInformation(stateName, event)
        }
    }
}

// 监听全局点击事件
onMounted(() => {
    document.addEventListener('click', handleStateClick)
})

onUnmounted(() => {
    document.removeEventListener('click', handleStateClick)
})

// 暴露方法
defineExpose({
    createInformation,
    showInformation,
    showStateInformation
})
</script>

<style scoped>
.information-modal {
    /* 信息弹窗样式 */
    min-height: 100px;
}

.information-text {
    padding: 10px;
    line-height: 1.6;
}

.information-text :deep(br) {
    display: block;
    margin: 8px 0;
}
</style>
