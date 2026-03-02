<template>
    <Teleport to="body">
        <Tile
            v-for="instance in chooseTiles"
            :key="instance.id"
            :title="instance.title"
            :close-type="instance.ability.关闭 === false ? 'none' : 'delete'"
            :initial-visible="true"
            :style="getTileStyle(instance)"
            class="chooseTile"
            :class="{ 'title-center': instance.ability.标题居中 !== false }"
            @close="handleClose(instance)"
        >
            <!-- 选项文本 -->
            <div class="chooseTile_text" v-html="getTextContent(instance.text)"></div>

            <!-- 选项容器 -->
            <div
                class="chooseTile_choiceContainer"
                :class="{ flex: instance.选项排列 === '横向' }"
            >
                <div
                    v-for="(choice, index) in instance.choices"
                    :key="index"
                    class="chooseTile_choiceDiv"
                    :class="[
                        {
                            chooseTile_chosenDiv: instance.已选择.includes(index),
                            chooseTile_竖向: instance.选项排列 === '竖向',
                            unable: choiceDisabled[instance.id]?.[index]
                        },
                        ...(choice.选项样式类 || [])
                    ]"
                    :style="{ ...instance.通用样式, ...choice.选项样式 }"
                    @click="handleChoiceClick(instance, index)"
                >
                    <!-- 复选框 -->
                    <input
                        v-if="instance.复选样式 === 'checkbox'"
                        type="checkbox"
                        class="chooseTile_choiceCheckbox"
                        :checked="instance.已选择.includes(index)"
                        :disabled="choiceDisabled[instance.id]?.[index]"
                        @click.stop
                    />

                    <!-- 复选箭头 -->
                    <div
                        v-if="instance.复选样式 === 'arrow'"
                        class="chooseTile_choiceArrow arrow_right"
                        :style="{ display: instance.已选择.includes(index) ? 'block' : 'none' }"
                    ></div>

                    <!-- 选项内容 -->
                    <span class="chooseTile_choiceText">
                        <template v-if="typeof choice.选项内容 === 'string'">
                            {{ choice.选项内容 }}
                        </template>
                        <component v-else :is="choice.选项内容" />
                    </span>
                </div>
            </div>

            <!-- 额外按钮 -->
            <div class="chooseTile_bonusDiv">
                <div v-if="instance.确认" class="chooseTile_确认" @click="handleSubmit(instance)">
                    确认
                </div>
                <div v-if="instance.取消" class="chooseTile_取消" @click="handleCancel(instance)">
                    取消
                </div>
            </div>
        </Tile>

        <!-- 黑色遮罩 -->
        <BlackScreen v-if="hasImmediateChoice" />
    </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import Tile from '../common/Tile.vue'
import BlackScreen from '../common/BlackScreen.vue'
import {
    getChooseTiles,
    getSubmitEmitter,
    removeChooseTile,
    type ChooseTileInstance
} from '@/composables/useChooseTile'
import { sortByLevel, countValue } from '@/utils/global_ability'

/**
 * 选择Tile组件
 *
 * 从 src/js/Tiles/chooseTile.js 迁移
 *
 * 功能需求：
 * 1. 创建选择对话框，支持单选/多选
 * 2. 支持自定义选项内容
 * 3. 支持确认/取消按钮
 * 4. 支持复选设置（min/max）
 * 5. 支持选项排列（横向、竖向）
 * 6. 支持立即选择模式（显示遮罩）
 * 7. 支持重复处理（关闭、取代、禁止）
 * 8. 支持选项事件
 *
 * 原文件位置：src/js/Tiles/chooseTile.js (442行)
 */

const chooseTiles = getChooseTiles()
const submitEmitter = getSubmitEmitter()

// 选项禁用状态
const choiceDisabled = ref<Record<string, Record<number, boolean>>>({})

// 是否有立即选择的Tile
const hasImmediateChoice = computed(() => {
    return chooseTiles.value.some((t) => t.立即选择)
})

// 获取文本内容
function getTextContent(text: string | HTMLElement): string {
    if (typeof text === 'string') {
        return text
    }
    return ''
}

// 获取Tile样式
function getTileStyle(instance: ChooseTileInstance): Record<string, string> {
    const style: Record<string, string> = {}

    if (instance.ability.位置) {
        const pos = instance.ability.位置
        if (pos.top !== undefined) style.top = `${pos.top}px`
        if (pos.left !== undefined) style.left = `${pos.left}px`
        if (pos.right !== undefined) style.right = `${pos.right}px`
        if (pos.bottom !== undefined) style.bottom = `${pos.bottom}px`
    }

    if (instance.ability.尺寸) {
        const size = instance.ability.尺寸
        if (size.width) style.width = typeof size.width === 'number' ? `${size.width}px` : size.width
        if (size.height)
            style.height = typeof size.height === 'number' ? `${size.height}px` : size.height
    }

    return style
}

// 点击选项
function handleChoiceClick(instance: ChooseTileInstance, index: number): void {
    // 如果已禁用，不处理
    if (choiceDisabled.value[instance.id]?.[index]) return

    const isChosen = instance.已选择.includes(index)

    if (isChosen) {
        // 取消选中
        unchooseChoice(instance, index)
    } else {
        // 选中
        chooseChoice(instance, index)
    }
}

// 选中选项
function chooseChoice(instance: ChooseTileInstance, index: number): void {
    if (instance.已选择.includes(index)) return

    // 检查是否超过最大值
    const max = instance.复选值.max
    if (instance.已选择.length === max) {
        // 移除第一个选中的
        const firstIndex = instance.已选择.shift()
        if (firstIndex !== undefined) {
            unchooseChoice(instance, firstIndex)
        }
    }

    // 添加到已选择
    instance.已选择.push(index)

    // 触发选中事件
    runChoiceEvent(instance, index, '选中时')

    // 判断是否自动提交
    if (instance.已选择.length === max && !instance.确认) {
        handleSubmit(instance)
    }
}

// 取消选中
function unchooseChoice(instance: ChooseTileInstance, index: number): void {
    const chosenIndex = instance.已选择.indexOf(index)
    if (chosenIndex === -1) return

    // 从已选择中移除
    instance.已选择.splice(chosenIndex, 1)

    // 触发失去选中事件
    runChoiceEvent(instance, index, '失去选中时')
}

// 确认选择
function handleSubmit(instance: ChooseTileInstance): void {
    const 已选择 = instance.已选择
    const min = instance.复选值.min
    const max = instance.复选值.max

    // 检查选择数量
    if (已选择.length < min) {
        console.log('需要选择更多选项')
        return
    }
    if (已选择.length > max) {
        console.log('选择的选项过多')
        return
    }

    // 按优先级排序选项
    const array = instance.choices.map((choice, index) => ({
        对象: index,
        优先级: choice.优先级 || 0
    }))
    const sortedIndices = sortByLevel(array) as number[]

    // 执行选项事件并计算返回值
    let returnValue: any
    for (const index of sortedIndices) {
        if (已选择.includes(index)) {
            // 执行"选择时"事件
            const value = runChoiceEvent(instance, index, '选择时')
            returnValue = countValue(returnValue, value)
        } else {
            // 执行"未选择时"事件
            const value = runChoiceEvent(instance, index, '未选择时')
            returnValue = countValue(returnValue, value)
        }

        // 禁用选项
        if (!choiceDisabled.value[instance.id]) {
            choiceDisabled.value[instance.id] = {}
        }
        choiceDisabled.value[instance.id][index] = true
    }

    // 判断是否返回值
    let ifReturn = false
    if (instance.返回 === true) {
        ifReturn = true
    } else if (instance.返回 === 'auto' && returnValue) {
        ifReturn = true
    }

    // 发送事件
    if (ifReturn) {
        submitEmitter.emit(instance.submitId, returnValue)
    } else {
        submitEmitter.emit(instance.submitId, false)
    }

    // 自动关闭
    if (instance.自动关闭) {
        removeChooseTile(instance.id)
    }
}

// 取消选择
function handleCancel(instance: ChooseTileInstance): void {
    // 取消所有已选中的选项
    const selectedCopy = [...instance.已选择]
    for (const index of selectedCopy) {
        unchooseChoice(instance, index)
    }
}

// 关闭Tile
function handleClose(instance: ChooseTileInstance): void {
    removeChooseTile(instance.id)
}

// 触发选项事件
function runChoiceEvent(
    instance: ChooseTileInstance,
    index: number,
    eventName: '选中时' | '失去选中时' | '选择时' | '未选择时'
): any {
    const choice = instance.choices[index]
    if (!choice.选项事件) return

    const func = choice.选项事件[eventName]
    if (!func) return

    const choiceObject = choice.对象
    const containerObject = instance.ability.对象

    return func(containerObject, choiceObject, null)
}

// 监听默认选中
watch(
    chooseTiles,
    (newTiles) => {
        for (const instance of newTiles) {
            // 处理默认选中
            instance.choices.forEach((choice, index) => {
                if (choice.默认选中 && !instance.已选择.includes(index)) {
                    chooseChoice(instance, index)
                }
            })
        }
    },
    { deep: true, immediate: true }
)
</script>

<style scoped>
/* 从 src/css/Tiles/chooseTile.css 迁移 */

.chooseTile {
    z-index: 1000;
}

.chooseTile :deep(.tile_data > div) {
    width: 90%;
    margin: auto;
}

.chooseTile_text {
    margin-bottom: 10px;
    font-size: 16px;
}

.chooseTile_choiceContainer {
    margin: 10px 0px;
    margin-right: 8px;
}

.chooseTile_choiceContainer.flex {
    display: flex;
    align-items: stretch;
    justify-content: center;
    gap: 1px 5px;
}

.chooseTile_choiceDiv {
    border: 1px solid black;
    min-width: 50px;
    max-width: 200px;
    padding: 0px 5px;
    margin: 0px auto;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    user-select: none;
}

.chooseTile_choiceDiv:hover:not(.unable) {
    background-color: #f0f0f0;
}

.chooseTile_choiceDiv > .chooseTile_choiceText {
    width: 100%;
    word-wrap: break-word;
    hyphens: auto;
}

.chooseTile_choiceDiv.chooseTile_竖向 {
    border: none;
    padding: 1px 0px;
    margin: 0;
    margin-right: 8px;
    flex-direction: row;
}

.chooseTile_chosenDiv {
    background-color: lightgray;
}

.chooseTile_choiceDiv.unable {
    opacity: 0.5;
    cursor: not-allowed;
}

.chooseTile_choiceCheckbox {
    cursor: pointer;
}

.chooseTile_choiceArrow {
    width: 0;
    height: 0;
    border-top: 5px solid transparent;
    border-bottom: 5px solid transparent;
    border-left: 8px solid black;
}

.chooseTile_bonusDiv {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: right;
}

.chooseTile_bonusDiv > div {
    border: 1px solid black;
    padding: 2px 4px;
    margin: 5px;
    margin-left: 0px;
    cursor: pointer;
    user-select: none;
}

.chooseTile_确认:hover {
    background-color: #e0e0e0;
}

.chooseTile_取消:hover {
    background-color: #e0e0e0;
}
</style>
