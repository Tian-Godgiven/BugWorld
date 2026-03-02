<template>
    <Tile
        ref="tileRef"
        title="事件"
        :close-type="'hide'"
        :initial-visible="false"
    >
        <!-- 事件信息 -->
        <div class="eventTile_container event-info">
            <div>下一回合的事件信息</div>
            <div>事件概率：{{ eventInfo.概率 }}</div>
            <div>事件倾向：{{ eventInfo.倾向 }}</div>
            <div>事件强度：{{ eventInfo.强度 }}</div>
        </div>

        <!-- 预告事件 -->
        <div class="eventTile_container">
            <div class="event-title" @click="toggleSection('预告')">预告</div>
            <div v-show="expandedSections.预告" class="eventTile_eventContainer">
                <div
                    v-for="(event, index) in 预告事件"
                    :key="index"
                    class="eventTile_eventDiv"
                >
                    <ObjectDiv :object="event" />
                    <div class="eventDiv_预告时间">{{ getEventTime(event, '预告') }}后发生</div>
                    <div><InfoDisplay :fragments="getEventEffect(event)" /></div>
                </div>
            </div>
        </div>

        <!-- 进行中事件 -->
        <div class="eventTile_container">
            <div class="event-title" @click="toggleSection('进行')">正在进行</div>
            <div v-show="expandedSections.进行" class="eventTile_eventContainer">
                <div
                    v-for="(event, index) in 进行事件"
                    :key="index"
                    class="eventTile_eventDiv"
                >
                    <ObjectDiv :object="event" />
                    <div class="eventDiv_持续时间">持续{{ getEventTime(event, '持续') }}</div>
                    <div><InfoDisplay :fragments="getEventEffect(event)" /></div>
                </div>
            </div>
        </div>

        <!-- 留存事件 -->
        <div class="eventTile_container">
            <div class="event-title" @click="toggleSection('留存')">留存</div>
            <div v-show="expandedSections.留存" class="eventTile_eventContainer">
                <div
                    v-for="(event, index) in 留存事件"
                    :key="index"
                    class="eventTile_eventDiv"
                >
                    <ObjectDiv :object="event" />
                    <div class="eventDiv_留存时间">已经结束</div>
                    <div><InfoDisplay :fragments="getEventEffect(event)" /></div>
                </div>
            </div>
        </div>
    </Tile>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import Tile from '../common/Tile.vue'
import ObjectDiv from '../common/ObjectDiv.vue'
import InfoDisplay from '../common/InfoDisplay.vue'
import { stateValue, getStateUnit, getInformation } from '@/core/state/State'
import type { InfoFragment } from '@/core/state/State'
import { hiddenValue } from '@/core/state/Hidden'

/**
 * 事件Tile组件
 *
 * 从 src/js/Tiles/event_tile/eventTile.js 迁移
 *
 * 功能需求：
 * 1. 显示下一回合的事件信息（概率、倾向、强度）
 * 2. 显示预告中的事件
 * 3. 显示进行中的事件
 * 4. 显示留存的事件
 * 5. 支持折叠/展开各个事件分类
 */

const tileRef = ref<InstanceType<typeof Tile> | null>(null)
const bugNest = ref<any>(null)

const expandedSections = reactive({
    预告: false,
    进行: false,
    留存: false
})

// 事件信息
const eventInfo = computed(() => {
    if (!bugNest.value) {
        return { 概率: '0%', 倾向: '', 强度: '' }
    }

    const area = stateValue(bugNest.value, '所处')
    const 总概率 = stateValue(area, '繁荣', 'num') + 100
    const 当前概率 = 总概率 - hiddenValue(bugNest.value, ['事件信息', '概率边界'])
    const 事件概率 = Math.round((当前概率 / 总概率) * 100) + '%'

    const 倾向边界 = hiddenValue(bugNest.value, ['事件信息', '倾向边界'])
    const 好事倾向 = stateValue(area, '平和', 'num') + 5
    const 坏事倾向 = stateValue(area, '威胁', 'num') + 5
    const 倾向总值 = 好事倾向 + 坏事倾向
    const 好事概率 = Math.round(((好事倾向 - 倾向边界) / 倾向总值) * 100)
    const 坏事概率 = 100 - 好事概率
    const 事件倾向 = `[好事：${好事概率}%/坏事：${坏事概率}%]`

    const 收益 = stateValue(area, '收益', 'num')
    const 险恶 = stateValue(area, '险恶', 'num')
    const 事件强度 = `[好事：${收益}~${收益 + 10}/坏事：${险恶}~${险恶 + 10}]`

    return {
        概率: 事件概率,
        倾向: 事件倾向,
        强度: 事件强度
    }
})

// 获取所有事件
const allEvents = computed(() => {
    if (!bugNest.value) return []
    return hiddenValue(bugNest.value, ['进行中', '事件']) || []
})

// 预告事件
const 预告事件 = computed(() => {
    return allEvents.value.filter((event: any) => hiddenValue(event, '预告中') === true)
})

// 进行中事件
const 进行事件 = computed(() => {
    return allEvents.value.filter((event: any) => hiddenValue(event, '进行中') === true)
})

// 留存事件
const 留存事件 = computed(() => {
    return allEvents.value.filter((event: any) => hiddenValue(event, '存留中') === true)
})

// 切换分类展开/折叠
function toggleSection(section: '预告' | '进行' | '留存'): void {
    expandedSections[section] = !expandedSections[section]
}

// 获取事件时间
function getEventTime(event: any, type: string): string {
    const value = stateValue(event, type)
    const unit = getStateUnit(event, type)
    return `${value}${unit}`
}

// 获取事件效果
function getEventEffect(event: any): InfoFragment[] {
    const effect = stateValue(event, '效果')
    return getInformation(event, effect)
}

// 创建事件Tile
function create(bugNestObject: any): void {
    bugNest.value = bugNestObject
    tileRef.value?.show()
}

// 更新事件Tile
function update(bugNestObject?: any): void {
    if (bugNestObject) {
        bugNest.value = bugNestObject
    }
}

// 暴露方法
defineExpose({
    create,
    update,
    show: () => tileRef.value?.show(),
    hide: () => tileRef.value?.hide()
})
</script>

<style scoped>
/* 从 src/css/Tiles/eventTile.css 迁移 */

.eventTile_container {
    border-top: 2px solid black;
}

.event-info {
    padding: 8px;
}

.event-title {
    cursor: pointer;
    padding: 8px;
    font-weight: bold;
}

.eventTile_eventContainer {
    padding: 8px;
}

.eventTile_eventDiv {
    border: 1px solid black;
    margin-right: 4px;
    margin-bottom: 4px;
    overflow: hidden;
    position: relative;
    padding: 8px;
}

.eventDiv_持续时间 {
    position: absolute;
    top: 0px;
    right: 10px;
}

.eventDiv_预告时间 {
    position: absolute;
    top: 0px;
    right: 10px;
}

.eventDiv_留存时间 {
    position: absolute;
    top: 0px;
    right: 10px;
}
</style>
