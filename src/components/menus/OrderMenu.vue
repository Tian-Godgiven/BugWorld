<template>
    <Tile
        ref="tileRef"
        title="命令"
        :close-type="'hide'"
        :initial-visible="false"
        :position="menuPosition"
        class="tile-menu"
    >
        <div class="order-menu-container">
            <div
                v-for="(item, index) in orderItems"
                :key="index"
                class="orderTile_orderDiv"
            >
                <!-- 工作信息区 -->
                <div class="orderDiv_workDiv" @click="toggleNumDiv(index)">
                    <ObjectDiv :object="item.work" />
                    <div class="work-states">
                        <StateDisplay :object="item.work" :states="{ 进度: item.work.属性.进度 }" />
                        <div class="state flex">
                            <div>效率：</div>
                            <div class="orderDiv_效率值">{{ item.efficiency }}</div>
                        </div>
                    </div>
                </div>

                <!-- 数量控制区 -->
                <div class="orderDiv_numDiv" :class="{ show: item.showNumDiv }">
                    <div class="flex">
                        <span>参与数量：</span>
                        <input
                            v-model.number="item.inputValue"
                            class="orderDiv_input"
                            type="number"
                            @input="handleInputChange(item)"
                        />
                        <div class="orderDiv_count">
                            <div
                                class="orderDiv_button orderDiv_退出"
                                :class="{ disable: item.inputValue === 0 }"
                                @mousedown="handleMouseDown(item, 'decrease')"
                            >
                                -
                            </div>
                            <div
                                class="orderDiv_button orderDiv_参加"
                                :class="{ disable: item.inputValue >= item.maxNum }"
                                @mousedown="handleMouseDown(item, 'increase')"
                            >
                                +
                            </div>
                        </div>
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
import { getFreeBug } from '@/core/objects/Bug'
import { joinWork, resignWork, countWorkEfficiency } from '@/core/objects/Work'
import { runObjectMovement } from '@/core/state/Movement'

/**
 * 命令菜单组件
 *
 * 从 src/js/Tiles/order_tile/orderMenu.js 迁移
 *
 * 功能需求：
 * 1. 显示虫群单位的命令菜单
 * 2. 空闲单位：显示可参与的工作
 * 3. 忙碌单位：显示正在参与的工作
 * 4. 支持调整参与数量（input + +/- 按钮）
 * 5. 支持长按快速调整数量
 *
 * 原文件位置：src/js/Tiles/order_tile/orderMenu.js (288行)
 */

interface OrderItem {
    work: any
    busyNum: number
    freeNum: number
    maxNum: number
    inputValue: number
    efficiency: string
    showNumDiv: boolean
}

const tileRef = ref<InstanceType<typeof Tile> | null>(null)
const object = ref<any>(null)
const bugNest = ref<any>(null)
const menuType = ref<'free' | 'busy'>('free')
const orderItems = ref<OrderItem[]>([])
const menuPosition = ref<{ left: number; top: number } | undefined>(undefined)

// 长按相关
let longPressTimer: number | null = null
let longPressInterval: number | null = null

// 显示菜单
function show(bugObject: any, bugNestObject: any, type: 'free' | 'busy', parentTileRef?: any): void {
    object.value = bugObject
    bugNest.value = bugNestObject
    menuType.value = type

    // 如果提供了父 Tile 引用，计算菜单位置
    if (parentTileRef?.$el) {
        const parentRect = parentTileRef.$el.getBoundingClientRect()
        menuPosition.value = {
            left: parentRect.right - 4,
            top: parentRect.top - 2
        }
    }

    updateOrderItems()
    tileRef.value?.show()
}

// 更新命令项列表
function updateOrderItems(): void {
    if (!object.value || !bugNest.value) return

    const freeNum = getFreeBug(object.value)
    const items: OrderItem[] = []

    if (menuType.value === 'free') {
        // 空闲单位：显示可参与的工作
        const 进行中工作 = hiddenValue(bugNest.value, ['进行中', '工作']) || []
        for (const work of 进行中工作) {
            // 判断是否满足工作需求
            if (runObjectMovement(work, '需求', object.value)) {
                const efficiency = countWorkEfficiency(work, object.value, 0, 'unit') as string
                items.push({
                    work,
                    busyNum: 0,
                    freeNum,
                    maxNum: freeNum,
                    inputValue: 0,
                    efficiency,
                    showNumDiv: false
                })
            }
        }
    } else if (menuType.value === 'busy') {
        // 忙碌单位：显示正在参与的工作
        const 被占有 = hiddenValue(object.value, '被占有') || []
        for (const occupy of 被占有) {
            const work = occupy.占有来源
            const busyNum = occupy.占有数量
            const efficiency = countWorkEfficiency(work, object.value, busyNum, 'unit') as string
            items.push({
                work,
                busyNum,
                freeNum,
                maxNum: busyNum + freeNum,
                inputValue: busyNum,
                efficiency,
                showNumDiv: false
            })
        }
    }

    orderItems.value = items
}

// 切换数量控制区显示
function toggleNumDiv(index: number): void {
    orderItems.value[index].showNumDiv = !orderItems.value[index].showNumDiv
}

// 处理输入变化
function handleInputChange(item: OrderItem): void {
    // 限制输入范围
    if (item.inputValue < 0) {
        item.inputValue = 0
    } else if (item.inputValue > item.maxNum) {
        item.inputValue = item.maxNum
    }

    // 计算差值
    const distant = item.inputValue - item.busyNum

    if (distant > 0) {
        // 加入工作
        joinWork(object.value, distant, item.work)
    } else if (distant < 0) {
        // 退出工作
        resignWork(object.value, -distant, item.work)
    }

    // 更新busyNum
    item.busyNum = item.inputValue

    // 更新效率显示
    item.efficiency = countWorkEfficiency(item.work, object.value, item.inputValue, 'unit') as string

    // 更新所有项的freeNum和maxNum
    updateAllItemsNum()
}

// 更新所有项的数量信息
function updateAllItemsNum(): void {
    const freeNum = getFreeBug(object.value)
    for (const item of orderItems.value) {
        item.freeNum = freeNum
        item.maxNum = item.busyNum + freeNum
    }
}

// 处理鼠标按下（+/-按钮）
function handleMouseDown(item: OrderItem, action: 'increase' | 'decrease'): void {
    // 如果按钮被禁用，不处理
    if (action === 'increase' && item.inputValue >= item.maxNum) return
    if (action === 'decrease' && item.inputValue === 0) return

    let count = 1
    const initialValue = item.inputValue

    // 立即执行一次
    if (action === 'increase') {
        item.inputValue = Math.min(item.inputValue + 1, item.maxNum)
    } else {
        item.inputValue = Math.max(item.inputValue - 1, 0)
    }
    handleInputChange(item)

    // 长按1秒后开始连续执行
    longPressTimer = window.setTimeout(() => {
        longPressInterval = window.setInterval(() => {
            count++
            if (action === 'increase') {
                if (item.inputValue >= item.maxNum) {
                    clearLongPress()
                    return
                }
                item.inputValue = Math.min(initialValue + count, item.maxNum)
            } else {
                if (item.inputValue === 0) {
                    clearLongPress()
                    return
                }
                item.inputValue = Math.max(initialValue - count, 0)
            }
            handleInputChange(item)
        }, 100)
    }, 1000)

    // 监听鼠标松开
    const handleMouseUp = () => {
        clearLongPress()
        document.removeEventListener('mouseup', handleMouseUp)
    }
    document.addEventListener('mouseup', handleMouseUp)
}

// 清除长按定时器
function clearLongPress(): void {
    if (longPressTimer) {
        clearTimeout(longPressTimer)
        longPressTimer = null
    }
    if (longPressInterval) {
        clearInterval(longPressInterval)
        longPressInterval = null
    }
}

// 更新菜单
function update(): void {
    updateOrderItems()
}

// 暴露方法
defineExpose({
    show,
    update,
    hide: () => tileRef.value?.hide()
})
</script>

<style scoped>
/* 从 src/css/Tiles/orderTile.css 迁移 */

.order-menu-container {
    display: flex;
    flex-direction: column;
}

/* 命令虫群对象div */
.orderTile_orderDiv {
    position: relative;
    margin: 4px 0px;
    padding: 5px;
    box-sizing: border-box;
    width: calc(100% - 8px);

    min-height: 55px;
    border: 2px solid black;
    border-radius: 5px;
}

.orderDiv_workDiv {
    display: flex;
    align-items: center;
    cursor: pointer;
}

.orderDiv_workDiv:hover {
    background-color: #f0f0f0;
}

/* 工作对象的名称 */
.orderDiv_workDiv :deep(.object) {
    font-size: 20px;
    width: 30%;
    text-align: center;
    font-weight: bold;
    padding: 0px 5px;
}

/* 工作对象的信息 */
.work-states {
    flex: 1;
    text-align: left;
}

/* 命令数量控制div */
.orderDiv_numDiv {
    display: none;
    margin-top: 5px;
    padding-top: 5px;
    border-top: 1px dashed black;
}

.orderDiv_numDiv.show {
    display: block;
}

.orderDiv_numDiv > div {
    display: flex;
    justify-content: center;
    align-items: center;
}

/* 数量控制div的按钮外壳 */
.orderDiv_count {
    display: flex;
    justify-content: center;
    align-items: center;
}

/* 命令数量控制按钮 */
.orderDiv_button {
    font-weight: bold;
    width: 20px;
    height: 20px;

    text-align: center;
    line-height: 100%;

    border: 2px solid black;
    border-radius: 3px;
    margin: 2px;
    cursor: pointer;
    user-select: none;
}

.orderDiv_button:not(.disable):hover {
    background-color: #e0e0e0;
}

.orderDiv_button.disable {
    color: white;
    background-color: black;
    cursor: not-allowed;
}

/* 命令数量显示和输入 */
.orderDiv_input {
    font-size: 20px;
    width: 35%;
    border: none;
    border-bottom: 1px solid black;
    outline: none;
    margin-right: 1px;
    text-align: right;
    margin-left: 10px;
}

/* 移除number input的上下箭头 */
.orderDiv_input::-webkit-inner-spin-button,
.orderDiv_input::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

.orderDiv_input[type='number'] {
    -moz-appearance: textfield;
}
</style>
