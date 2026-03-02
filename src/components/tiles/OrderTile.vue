<template>
    <Tile
        ref="tileRef"
        title="命令"
        :close-type="'hide'"
        :initial-visible="false"
    >
        <!-- 空闲虫群 -->
        <div class="order-section">
            <div class="orderTile_title">空闲</div>
            <div
                v-for="bug in freeBugs"
                :key="bug.id"
                class="orderTile_bugDiv orderTile_freeBug"
                :class="{ focusing: focusingBug === bug }"
                @click="handleBugClick(bug, 'free')"
            >
                <ObjectDiv :object="bug" />
                <span>&nbsp;x {{ getFreeBugNum(bug) }}</span>
            </div>
        </div>

        <!-- 占用虫群 -->
        <div class="order-section">
            <div class="orderTile_title">占有</div>
            <div
                v-for="bug in busyBugs"
                :key="bug.id"
                class="orderTile_bugDiv orderTile_busyBug"
                :class="{ focusing: focusingBug === bug }"
                @click="handleBugClick(bug, 'busy')"
            >
                <ObjectDiv :object="bug" />
                <div>
                    <div
                        v-for="(occupy, index) in getBugOccupy(bug)"
                        :key="index"
                        class="flex occupy-item"
                    >
                        <span>&nbsp;x {{ occupy.数量 }} →&nbsp;</span>
                        <ObjectDiv :object="occupy.来源" />
                        <span>：{{ occupy.效率 }}</span>
                    </div>
                </div>
            </div>
        </div>
    </Tile>
    <OrderMenu ref="orderMenuRef" />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Tile from '../common/Tile.vue'
import ObjectDiv from '../common/ObjectDiv.vue'
import OrderMenu from '../menus/OrderMenu.vue'
import { stateValue } from '@/core/state/State'
import { hiddenValue } from '@/core/state/Hidden'
import { getFreeBug } from '@/core/objects/Bug'
import { countWorkEfficiency } from '@/core/objects/Work'

/**
 * 命令Tile组件
 *
 * 从 src/js/Tiles/order_tile/orderTile.js 迁移
 *
 * 功能需求：
 * 1. 显示虫巢中的虫群工作状态
 * 2. 分为"空闲"和"占有"两个区域
 * 3. 空闲区域显示空闲的虫群单位
 * 4. 占有区域显示被占用的虫群单位及其占用来源和效率
 * 5. 点击虫群显示命令菜单
 * 6. 需要配合 OrderMenu 组件使用
 */

const tileRef = ref<InstanceType<typeof Tile> | null>(null)
const orderMenuRef = ref<InstanceType<typeof OrderMenu> | null>(null)
const bugNest = ref<any>(null)
const focusingBug = ref<any>(null)

// 所有虫群
const allBugs = computed(() => {
    if (!bugNest.value) return []
    const bugGroup = stateValue(bugNest.value, '虫群')
    const result: any[] = []
    for (const bugName in bugGroup) {
        const bugs = bugGroup[bugName]
        for (const bug of bugs) {
            result.push(bug)
        }
    }
    return result
})

// 空闲虫群
const freeBugs = computed(() => {
    return allBugs.value.filter((bug) => getFreeBugNum(bug) > 0)
})

// 占用虫群
const busyBugs = computed(() => {
    return allBugs.value.filter((bug) => {
        const freeNum = getFreeBugNum(bug)
        const totalNum = stateValue(bug, '数量')
        return totalNum - freeNum > 0
    })
})

// 获取空闲虫群数量
function getFreeBugNum(bug: any): number {
    return getFreeBug(bug)
}

// 获取虫群占用情况
function getBugOccupy(bug: any): any[] {
    const 被占有 = hiddenValue(bug, '被占有') || []
    return 被占有.map((occupy: any) => {
        const source = occupy.占有来源
        const num = occupy.占有数量
        const 效率 = countWorkEfficiency(source, bug, num, 'unit')
        return {
            来源: source,
            数量: num,
            效率
        }
    })
}

// 点击虫群
function handleBugClick(bug: any, type: 'free' | 'busy'): void {
    focusingBug.value = bug
    if (bugNest.value) {
        orderMenuRef.value?.show(bug, bugNest.value, type, tileRef.value)
    }
}

// 创建命令Tile
function create(bugNestObject: any): void {
    bugNest.value = bugNestObject
    tileRef.value?.show()
}

// 更新命令Tile
function update(bugGroup?: any): void {
    if (bugGroup) {
        // bugGroup 是虫群对象，需要从中获取 bugNest
        // 这里暂时不处理，因为通常是直接更新整个 bugNest
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
/* 从 src/css/Tiles/orderTile.css 迁移 */

.order-section {
    margin-bottom: 16px;
}

.orderTile_title {
    font-size: 20px;
}

.orderTile_bugDiv {
    display: flex;

    padding-left: 10px;
    min-width: 100%;
    cursor: pointer;
}

.orderTile_bugDiv :deep(div) {
    flex-shrink: 0;
}

.orderTile_bugDiv.focusing {
    background-color: lightblue;
}

.occupy-item {
    display: flex;
    align-items: center;
    margin-top: 4px;
    padding-left: 12px;
}
</style>
