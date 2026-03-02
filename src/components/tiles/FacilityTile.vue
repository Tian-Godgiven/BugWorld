<template>
    <Tile
        ref="tileRef"
        title="设施"
        :close-type="'hide'"
        :initial-visible="false"
    >
        <div class="facility-container">
            <div
                v-for="(facility, index) in facilities"
                :key="index"
                class="facilityTile_div"
            >
                <ObjectDiv :object="facility" method="level" />
                <div>数量：{{ getFacilityNum(facility) }}</div>
                <div>{{ getFacilityEntry(facility) }}</div>
                <div>{{ getFacilityAbility(facility) }}</div>
                <div class="facilityDiv_btnContainer">
                    <div class="button facilityDiv_控制" @click="handleControl(facility)">控制</div>
                </div>
            </div>
        </div>
    </Tile>
    <FacilityMenu ref="facilityMenuRef" />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Tile from '../common/Tile.vue'
import ObjectDiv from '../common/ObjectDiv.vue'
import FacilityMenu from '../menus/FacilityMenu.vue'
import { stateValue } from '@/core/state/State'

/**
 * 设施Tile组件
 *
 * TODO: 从 src/js/Tiles/facility_tile/facilityTile.js 迁移
 *
 * 功能需求：
 * 1. 显示虫巢中的所有设施
 * 2. 每个设施显示：名称、等级、数量、词条、效果
 * 3. 点击"控制"按钮显示设施菜单
 * 4. 需要配合 FacilityMenu 组件使用
 *
 * 原文件位置：src/js/Tiles/facility_tile/facilityTile.js (78 行)
 * 依赖：
 * - src/js/Tiles/facility_tile/facilityMenu.js (showFacilityMenu)
 * - src/js/library/Facility/Facility_Work_lib.json
 * - src/css/Tiles/facility.css
 */

const tileRef = ref<InstanceType<typeof Tile> | null>(null)
const facilityMenuRef = ref<InstanceType<typeof FacilityMenu> | null>(null)
const bugNest = ref<any>(null)

const facilities = computed(() => {
    if (!bugNest.value) return []
    const facilityObj = stateValue(bugNest.value, '设施')
    const result: any[] = []
    for (const key in facilityObj) {
        for (const facility of facilityObj[key]) {
            result.push(facility)
        }
    }
    return result
})

// 获取设施数量
function getFacilityNum(facility: any): number {
    return stateValue(facility, '数量')
}

// 获取设施词条
function getFacilityEntry(facility: any): string {
    const entries = stateValue(facility, '词条')
    return entries.map((e: string) => `[${e}]`).join('')
}

// 获取设施效果
function getFacilityAbility(facility: any): string {
    return stateValue(facility, '效果')
}

// 控制设施
function handleControl(facility: any): void {
    facilityMenuRef.value?.show(facility, tileRef.value)
}

// 创建设施Tile
function create(bugNestObject: any): void {
    bugNest.value = bugNestObject
    tileRef.value?.show()
}

// 更新设施Tile
function update(bugNestObject: any): void {
    bugNest.value = bugNestObject
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
/* 从 src/css/Tiles/facility.css 迁移 */

.facility-container {
    display: flex;
    flex-direction: column;
}

.facilityTile_div {
    position: relative;
    border-bottom: 1px dashed black;
    padding: 5px 0;
}

.facilityTile_div:first-child {
    border-top: 1px dashed black;
}

.facilityTile_div :deep(.object) {
    font-size: 20px;
}

.facilityTile_div :deep(.state) {
    margin: 2px 0;
}

.facilityDiv_btnContainer {
    position: absolute;
    top: 3px;
    right: 0px;

    display: flex;
}

.facilityDiv_btnContainer .button {
    text-align: center;

    min-width: 50px;
    height: auto;
    margin-right: 4px;

    border: 2px solid black;
    border-radius: 3px;
}
</style>
