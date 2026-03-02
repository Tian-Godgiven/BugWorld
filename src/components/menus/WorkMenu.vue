<template>
    <Tile
        ref="tileRef"
        title="新增工作"
        :close-type="'hide'"
        :initial-visible="false"
        :position="menuPosition"
        class="tile-menu"
    >
        <div class="work-menu-container">
            <div
                v-for="work in availableWorks"
                :key="work.id"
                class="addWork_div"
                @click="handleStartWork(work)"
            >
                <ObjectDiv :object="work" />
                <div class="work-states">
                    <StateDisplay :object="work" :states="{ 需求: work.属性.需求, 进度: work.属性.进度 }" />
                </div>
                <div
                    v-if="work.功能.选择"
                    class="btn addWorkDiv_选择"
                    @click.stop="handleChoose(work, $event)"
                >
                    选择
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
import { startWork } from '@/core/objects/Work'
import { runObjectMovement } from '@/core/state/Movement'

/**
 * 工作菜单组件
 *
 * 从 src/js/Tiles/work_tile/workMenu.js 迁移
 *
 * 功能需求：
 * 1. 显示虫巢中已解锁的工作列表
 * 2. 过滤掉正在进行中的工作（除非功能.独立=true）
 * 3. 点击工作项开始该工作
 * 4. 支持"选择"功能的工作（显示"选择"按钮）
 *
 * 原文件位置：src/js/Tiles/work_tile/workMenu.js (85行)
 */

const tileRef = ref<InstanceType<typeof Tile> | null>(null)
const bugNest = ref<any>(null)
const menuPosition = ref<{ left: number; top: number } | undefined>(undefined)

// 获取可用的工作列表
const availableWorks = computed(() => {
    if (!bugNest.value) return []

    const 已解锁工作 = hiddenValue(bugNest.value, ['已解锁', '工作']) || []

    // 过滤工作：不显示进行中的工作（除非独立），且显示和新增标志为true
    return 已解锁工作.filter((work: any) => {
        const 进行中 = hiddenValue(work, '进行中')
        return 进行中 !== true && work.功能.显示 !== false && work.功能.新增 !== false
    })
})

// 开始工作
function handleStartWork(work: any): void {
    if (!bugNest.value) return

    // 开始工作
    const result = startWork(bugNest.value, work)

    // 如果工作不是"独立"的，则隐藏菜单
    if (result && work.功能.独立 !== true) {
        tileRef.value?.hide()
    }
}

// 处理选择功能
function handleChoose(work: any, event: Event): void {
    // 触发工作的"选择"行为
    runObjectMovement(work, '选择', event.target)
}

// 显示菜单
function show(bugNestObject: any, parentTileRef?: any): void {
    bugNest.value = bugNestObject

    // 如果提供了父 Tile 引用，计算菜单位置
    if (parentTileRef?.$el) {
        const parentRect = parentTileRef.$el.getBoundingClientRect()
        menuPosition.value = {
            left: parentRect.right - 4,
            top: parentRect.top - 2
        }
    }

    tileRef.value?.toggle()
}

// 更新菜单
function update(bugNestObject?: any): void {
    if (bugNestObject) {
        bugNest.value = bugNestObject
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
/* 从 src/css/Tiles/workTile.css 迁移 */

.work-menu-container {
    display: flex;
    flex-direction: column;
}

/* 新增工作div */
.addWork_div {
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
    cursor: pointer;
}

.addWork_div:hover {
    background-color: #f0f0f0;
}

.addWork_div :deep(.object) {
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

/* 工作对象可能存在的选择按键 */
.addWorkDiv_选择 {
    flex-shrink: 0;
    width: 45px;
    border: 2px solid black;
    padding: 2px;
    border-radius: 3px;
    margin-left: auto;
    margin-bottom: auto;
    position: relative;
    top: -2px;
    right: -2px;
    text-align: center;
}

.addWorkDiv_选择:hover {
    background-color: #e0e0e0;
}
</style>
