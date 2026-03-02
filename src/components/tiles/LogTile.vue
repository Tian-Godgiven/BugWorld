<template>
    <Tile
        ref="tileRef"
        title="日志"
        :close-type="'hide'"
        :show-clear-button="true"
        :initial-visible="true"
        @clear="handleClear"
    >
        <div class="log-container">
            <div v-for="(log, index) in logs" :key="index" class="log-div">
                <template v-for="(item, i) in log" :key="i">
                    <ObjectDiv v-if="isObject(item)" :object="item" />
                    <span v-else>{{ item }}</span>
                </template>
            </div>
        </div>
    </Tile>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Tile from '../common/Tile.vue'
import ObjectDiv from '../common/ObjectDiv.vue'

/**
 * 日志Tile组件
 *
 * 从 src/js/Tiles/logTile.js 迁移
 *
 * 功能：
 * 1. 显示游戏日志信息
 * 2. 支持清空日志
 * 3. 日志内容可以包含对象和文本
 */

const tileRef = ref<InstanceType<typeof Tile> | null>(null)
const logs = ref<any[][]>([])

// 判断是否为对象
function isObject(value: any): boolean {
    return value !== null && typeof value === 'object' && !Array.isArray(value)
}

// 添加日志
function appendLog(information: any[]): void {
    logs.value.push(information)
}

// 清空日志
function handleClear(): void {
    logs.value = []
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
    appendLog,
    show,
    hide
})
</script>

<style scoped>
/* 从 src/css/Tiles/log.css 迁移 */

.log-container {
    display: flex;
    flex-direction: column;
}

.log-div {
    display: flex;
    flex-shrink: 0;
    padding: 2px 0;
}

.log-div :deep(.object) {
    margin: 0 2px;
}
</style>
