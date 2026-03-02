<template>
    <Tile
        ref="tileRef"
        :title="menuTitle"
        :close-type="'hide'"
        :initial-visible="false"
        :position="menuPosition"
        class="tile-menu"
    >
        <div class="facilityMenu_container">
            <!-- 操作区 -->
            <div v-if="facility?.功能.操作" class="facilityMenu_div">
                <span>操作</span>
                <div class="facilityMenu_btnContainer">
                    <div
                        v-for="(action, key) in facility.行为.操作"
                        :key="key"
                        class="button"
                        @click="handleAction(key)"
                    >
                        {{ key }}
                    </div>
                </div>
            </div>

            <!-- 升级区 -->
            <div v-if="facility?.功能.升级 && 升级工作列表.length > 0" class="facilityMenu_div">
                <span>升级</span>
                <div
                    v-for="work in 升级工作列表"
                    :key="work.id"
                    class="facilityMenu_workDiv"
                >
                    <ObjectDiv :object="work" />
                    <div class="work-states">
                        <StateDisplay
                            v-if="isWorkInProgress(work)"
                            :object="work"
                            :states="{ 进度: work.属性.进度 }"
                        />
                        <div v-if="isWorkInProgress(work)" class="state">
                            效率：{{ getWorkEfficiency(work) }}
                        </div>
                        <StateDisplay
                            v-else
                            :object="work"
                            :states="{ 需求: work.属性.需求, 进度: work.属性.进度 }"
                        />
                    </div>
                    <div
                        class="button"
                        @click="isWorkInProgress(work) ? handleStopWork(work) : handleStartWork(work)"
                    >
                        {{ isWorkInProgress(work) ? '结束' : '开始' }}
                    </div>
                </div>
            </div>

            <!-- 拆除区 -->
            <div v-if="facility?.功能.拆除 !== false && 拆除工作" class="facilityMenu_div">
                <span>拆除</span>
                <div class="facilityMenu_workDiv">
                    <ObjectDiv :object="拆除工作" />
                    <div class="work-states">
                        <StateDisplay
                            v-if="isWorkInProgress(拆除工作)"
                            :object="拆除工作"
                            :states="{ 进度: 拆除工作.属性.进度 }"
                        />
                        <div v-if="isWorkInProgress(拆除工作)" class="state">
                            效率：{{ getWorkEfficiency(拆除工作) }}
                        </div>
                        <StateDisplay
                            v-else
                            :object="拆除工作"
                            :states="{ 需求: 拆除工作.属性.需求, 进度: 拆除工作.属性.进度 }"
                        />
                    </div>
                    <div
                        class="button"
                        @click="isWorkInProgress(拆除工作) ? handleStopWork(拆除工作) : handleStartWork(拆除工作)"
                    >
                        {{ isWorkInProgress(拆除工作) ? '结束' : '开始' }}
                    </div>
                </div>
            </div>
        </div>
    </Tile>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Tile from '../common/Tile.vue'
import ObjectDiv from '../common/ObjectDiv.vue'
import StateDisplay from '../common/StateDisplay.vue'
import { hiddenValue } from '@/core/state/Hidden'
import { stateValue, getStateUnit } from '@/core/state/State'
import { startWork, stopWork } from '@/core/objects/Work'
import { runObjectMovement } from '@/core/state/Movement'

/**
 * 设施菜单组件
 *
 * 从 src/js/Tiles/facility_tile/facilityMenu.js 迁移
 *
 * 功能需求：
 * 1. 显示设施的控制菜单
 * 2. 支持操作按钮（facility.功能.操作）
 * 3. 支持升级工作（facility.功能.升级）
 * 4. 支持拆除工作（facility.功能.拆除）
 * 5. 工作可以开始/结束
 *
 * 原文件位置：src/js/Tiles/facility_tile/facilityMenu.js (115行)
 */

const tileRef = ref<InstanceType<typeof Tile> | null>(null)
const facility = ref<any>(null)
const menuPosition = ref<{ left: number; top: number } | undefined>(undefined)

// 菜单标题
const menuTitle = computed(() => {
    if (!facility.value) return '控制'
    return `控制→${stateValue(facility.value, '名称')}`
})

// 升级工作列表
const 升级工作列表 = computed(() => {
    if (!facility.value) return []
    return hiddenValue(facility.value, ['工作', '升级']) || []
})

// 拆除工作
const 拆除工作 = computed(() => {
    if (!facility.value) return null
    return hiddenValue(facility.value, ['工作', '拆除'])
})

// 判断工作是否进行中
function isWorkInProgress(work: any): boolean {
    return hiddenValue(work, '进行中') === true
}

// 获取工作效率
function getWorkEfficiency(work: any): string {
    const efficiency = hiddenValue(work, '总效率')
    const unit = getStateUnit(work, '效率')
    return `${efficiency}${unit}`
}

// 处理操作按钮
function handleAction(actionKey: string): void {
    if (!facility.value) return
    runObjectMovement(facility.value, ['操作', actionKey])
}

// 开始工作
function handleStartWork(work: any): void {
    if (!facility.value) return

    const bugNest = stateValue(facility.value, '所属')
    if (startWork(bugNest, work)) {
        // 刷新菜单（通过重新赋值触发响应式更新）
        facility.value = { ...facility.value }
    }
}

// 结束工作
function handleStopWork(work: any): void {
    if (stopWork(work)) {
        // 刷新菜单（通过重新赋值触发响应式更新）
        facility.value = { ...facility.value }
    }
}

// 显示菜单
function show(facilityObject: any, parentTileRef?: any): void {
    if (facility.value === facilityObject && tileRef.value?.isVisible()) {
        tileRef.value?.hide()
    } else {
        facility.value = facilityObject

        // 如果提供了父 Tile 引用，计算菜单位置
        if (parentTileRef?.$el) {
            const parentRect = parentTileRef.$el.getBoundingClientRect()
            menuPosition.value = {
                left: parentRect.right - 4,
                top: parentRect.top - 2
            }
        }

        tileRef.value?.show()
    }
}

// 更新菜单
function update(facilityObject?: any): void {
    if (facilityObject) {
        facility.value = facilityObject
    }
}

// 暴露方法
defineExpose({
    show,
    update,
    hide: () => tileRef.value?.hide()
})
</script>

<style scoped>
/* 从 src/css/Tiles/facility.css 迁移 */

.facilityMenu_container .facilityMenu_div:first-child {
    border-top: 1px dashed black;
}

.facilityMenu_div {
    position: relative;
    border-bottom: 1px dashed black;
    padding: 5px 0;
}

.facilityMenu_div > span {
    font-size: 20px;
}

.facilityMenu_btnContainer {
    display: flex;
}

.facilityMenu_btnContainer .button {
    text-align: center;
    flex-shrink: 0;

    min-width: 50px;
    height: auto;
    width: auto;
    padding: 4px;
    margin-right: 4px;

    border: 2px solid black;
    border-radius: 3px;
    cursor: pointer;
}

.facilityMenu_btnContainer .button:hover {
    background-color: #e0e0e0;
}

.facilityMenu_workDiv {
    position: relative;
    margin: 4px 0px;
    padding: 5px;
    box-sizing: border-box;
    width: calc(100% - 8px);

    min-height: 55px;
    border: 2px solid black;
    border-radius: 5px;

    display: flex;
    align-items: center;
}

.facilityMenu_workDiv :deep(.object) {
    width: 30%;
    text-align: center;

    padding: 0px 5px;

    font-size: 20px;
    font-weight: bold;
}

.work-states {
    flex: 1;
    text-align: left;
}

.facilityMenu_workDiv .button {
    flex-shrink: 0;
    width: 45px;
    height: auto;
    border: 2px solid black;
    padding: 2px;
    border-radius: 3px;
    margin-left: auto;
    position: relative;
    top: 50%;
    right: -2px;
    cursor: pointer;
}

.facilityMenu_workDiv .button:hover {
    background-color: #e0e0e0;
}
</style>
