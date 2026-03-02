<template>
    <Tile
        ref="tileRef"
        title="工作"
        :close-type="'hide'"
        :initial-visible="false"
        :size="{ width: 300 }"
    >
        <div class="flex work-add-button" @click="handleAddWork">新增工作</div>
        <div class="work-container">
            <div
                v-for="work in works"
                :key="work.id"
                class="workTile_div flex"
            >
                <ObjectDiv :object="work" />
                <div class="work-info">
                    <StateDisplay :object="work" :states="{ 进度: work.属性.进度 }" />
                    <div class="state">效率：{{ getWorkEfficiency(work) }}</div>
                </div>
                <div class="button close_btn work_delete" @click="handleDeleteWork(work)"></div>
            </div>
        </div>
    </Tile>
    <WorkMenu ref="workMenuRef" />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Tile from '../common/Tile.vue'
import ObjectDiv from '../common/ObjectDiv.vue'
import StateDisplay from '../common/StateDisplay.vue'
import WorkMenu from '../menus/WorkMenu.vue'
import { hiddenValue } from '@/core/state/Hidden'
import { getStateUnit } from '@/core/state/State'
import { stopWork } from '@/core/objects/Work'

/**
 * 工作Tile组件
 *
 * TODO: 从 src/js/Tiles/work_tile/workTile.js 迁移
 *
 * 功能需求：
 * 1. 显示虫巢中进行中的工作列表
 * 2. 每个工作显示：名称、进度、效率
 * 3. 支持删除工作（中断）
 * 4. 点击"新增工作"显示工作菜单
 * 5. 需要配合 WorkMenu 组件使用
 *
 * 原文件位置：src/js/Tiles/work_tile/workTile.js (97 行)
 * 依赖：
 * - src/js/Tiles/work_tile/workMenu.js (showWorkMenu)
 * - src/js/Object/Work.js (startWork, stopWork)
 * - src/js/State/Hidden.js (hiddenValue)
 * - src/css/Tiles/workTile.css
 */

const tileRef = ref<InstanceType<typeof Tile> | null>(null)
const workMenuRef = ref<InstanceType<typeof WorkMenu> | null>(null)
const bugNest = ref<any>(null)

const works = computed(() => {
    if (!bugNest.value) return []
    return hiddenValue(bugNest.value, ['进行中', '工作']) || []
})

// 获取工作效率
function getWorkEfficiency(work: any): string {
    const efficiency = hiddenValue(work, '总效率')
    const unit = getStateUnit(work, '效率')
    return `${efficiency}${unit}`
}

// 删除工作
function handleDeleteWork(work: any): void {
    stopWork(work, '中断')
}

// 新增工作
function handleAddWork(): void {
    if (bugNest.value) {
        workMenuRef.value?.show(bugNest.value, tileRef.value)
    }
}

// 创建工作Tile
function create(bugNestObject: any): void {
    bugNest.value = bugNestObject
    tileRef.value?.show()
}

// 更新工作Tile
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
/* 从 src/css/Tiles/workTile.css 迁移 */

.work-add-button {
    max-width: 300px;
    height: 20px;

    justify-content: center;
    align-items: center;
    border: 3px dashed black;

    border-radius: 5px;

    position: relative;
    padding: 10px 0px;
    align-items: center;

    margin-top: 4px;
    margin-right: 4px;

    cursor: pointer;
}

.work-container {
    display: flex;
    flex-wrap: wrap;
}

.workTile_div {
    flex: 1 1 300px;
    min-height: 55px;
    max-width: 300px;
    border: 2px solid black;
    border-radius: 5px;

    position: relative;
    padding: 10px 0px;
    align-items: center;

    margin-top: 4px;
    margin-right: 4px;
}

/* 工作对象的名称 */
.workTile_div > :deep(div:nth-child(1)) {
    font-weight: bold;
    font-size: 20px;
    width: 30%;
    text-align: center;
    padding: 0px 5px;
}

/* 工作对象的信息 */
.work-info {
    text-align: left;
}

.workTile_div > .work_delete {
    position: absolute;
    right: 2px;
    top: 2px;
}
</style>
