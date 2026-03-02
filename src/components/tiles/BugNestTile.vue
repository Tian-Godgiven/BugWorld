<template>
    <Tile
        ref="tileRef"
        title="虫巢"
        :close-type="'hide'"
        :initial-visible="false"
        :size="{ width: 300 }"
    >
        <StateDisplay v-if="bugNest" :object="bugNest" />
    </Tile>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Tile from '../common/Tile.vue'
import StateDisplay from '../common/StateDisplay.vue'

/**
 * 虫巢Tile组件
 *
 * 从 src/js/Tiles/bugNestTile.js 迁移
 *
 * 功能：
 * 1. 显示虫巢的属性信息
 * 2. 支持更新虫巢数据
 */

const tileRef = ref<InstanceType<typeof Tile> | null>(null)
const bugNest = ref<any>(null)

// 创建虫巢Tile
function create(bugNestObject: any): void {
    bugNest.value = bugNestObject
    tileRef.value?.show()
}

// 更新虫巢Tile数据
function update(bugNestObject: any): void {
    bugNest.value = bugNestObject
}

// 显示tile
function show(): void {
    tileRef.value?.show()
}

// 隐藏tile
function hide(): void {
    tileRef.value?.hide()
}

// 暴露方法
defineExpose({
    create,
    update,
    show,
    hide
})
</script>

<style scoped>
/* 虫巢Tile样式 */
</style>
