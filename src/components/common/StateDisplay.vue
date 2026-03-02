<template>
    <div class="state-display data">
        <div
            v-for="(stateItem, index) in stateItems"
            :key="index"
            class="state flex"
        >
            <div>{{ stateItem.name }}：</div>
            <div :class="{ flex: stateItem.isInline }">
                <template v-if="stateItem.type === 'empty'">无</template>
                <template v-else-if="stateItem.type === 'number'">
                    {{ stateItem.value }}{{ stateItem.unit }}
                </template>
                <template v-else-if="stateItem.type === 'minNowMax'">
                    {{ stateItem.value }}{{ stateItem.unit }}
                </template>
                <template v-else-if="stateItem.type === 'objectArray'">
                    <component
                        :is="getObjectArrayComponent(stateItem.value)"
                        v-bind="getObjectArrayProps(stateItem.value)"
                    />
                </template>
                <template v-else-if="stateItem.type === 'objects'">
                    <ObjectDiv
                        v-for="(obj, i) in stateItem.value"
                        :key="i"
                        :object="obj"
                        :method="stateItem.method"
                        @click="handleObjectClick"
                    />
                </template>
                <template v-else-if="stateItem.type === 'entries'">
                    <span v-for="(entry, i) in stateItem.value" :key="i">[{{ entry }}]</span>
                </template>
                <template v-else-if="stateItem.type === 'nested'">
                    <StateDisplay :object="object" :states="stateItem.value" />
                </template>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, h, inject } from 'vue'
import ObjectDiv from './ObjectDiv.vue'
import { getStateUnit } from '@/core/state/State'
import { objectArrayToDiv } from '@/utils/objectDiv'

/**
 * 属性显示组件
 *
 * 从 src/js/Modules/stateDiv.js 迁移
 */

const props = defineProps<{
    object: any
    states?: any
}>()

// 注入 showInformation 方法
const showInformation = inject<(object: any, event: MouseEvent) => void>('showInformation')

// 处理对象点击
function handleObjectClick(object: any, event: MouseEvent) {
    if (showInformation) {
        showInformation(object, event)
    }
}

// 获取要显示的属性对象
const displayStates = computed(() => {
    return props.states || props.object?.属性 || {}
})

// 处理属性数据
const stateItems = computed(() => {
    const items: any[] = []

    for (const name in displayStates.value) {
        // 跳过"来源"属性
        if (name === '来源') continue

        const stateObject = displayStates.value[name]
        if (!stateObject) continue

        const item = processState(name, stateObject)
        if (item) {
            items.push(item)
        }
    }

    return items
})

// 处理单个属性
function processState(name: string, stateObject: any): any {
    const unit = getStateUnit(props.object, name)

    // 特殊属性映射
    const specialMappings: any = {
        虫群: () => ({ type: 'objectArray', value: stateObject['字典'], isInline: false }),
        设施: () => ({ type: 'objectArray', value: stateObject['字典'], isInline: false }),
        所处: () => processObjects(stateObject, false),
        所属: () => processObjects(stateObject, false),
        特性: () => processObjects(stateObject, true),
        词条: () => processEntries(stateObject)
    }

    if (specialMappings[name]) {
        const result = specialMappings[name]()
        return { name, unit, ...result }
    }

    // 根据类型处理
    const stateType = stateObject['类型']
    switch (stateType) {
        case '数值':
            return processNumber(name, stateObject, unit)
        case '数组':
            return processArray(name, stateObject, unit)
        case '字典':
            return processDictionary(name, stateObject, unit)
        default:
            return null
    }
}

// 处理数值类型
function processNumber(name: string, stateObject: any, unit: string): any {
    const value = stateObject['数值']
    if (value == null) {
        return { name, type: 'empty', unit, isInline: false }
    }
    return { name, type: 'number', value, unit, isInline: false }
}

// 处理数组类型
function processArray(name: string, stateObject: any, unit: string): any {
    const array = stateObject['数组']
    if (!array || array.length === 0) {
        return { name, type: 'empty', unit, isInline: true }
    }

    // 判断是对象数组还是其他
    if (array[0]?.type === 'object') {
        return { name, type: 'objects', value: array, unit, isInline: true }
    }

    return { name, type: 'objects', value: array, unit, isInline: true }
}

// 处理字典类型
function processDictionary(name: string, stateObject: any, unit: string): any {
    const dict = stateObject['字典']
    if (!dict || Object.keys(dict).length === 0) {
        return { name, type: 'empty', unit, isInline: false }
    }

    // 特殊处理 min/now/max 格式
    if (dict.min || dict.now || dict.max) {
        const min = dict.min?.数值 != null ? dict.min.数值 + '/' : ''
        const now = dict.now?.数值 != null ? dict.now.数值 + '/' : ''
        const max = dict.max?.数值 != null ? dict.max.数值 : ''
        const value = min + now + max
        return { name, type: 'minNowMax', value, unit, isInline: false }
    }

    // 递归显示字典
    return { name, type: 'nested', value: dict, unit, isInline: false }
}

// 处理对象
function processObjects(stateObject: any, isInline: boolean): any {
    const value = stateObject['数组'] || stateObject['字典']
    if (!value || (Array.isArray(value) && value.length === 0)) {
        return { type: 'empty', isInline }
    }
    return { type: 'objects', value: Array.isArray(value) ? value : [value], isInline }
}

// 处理词条
function processEntries(stateObject: any): any {
    const entries = stateObject['数组']
    if (!entries || entries.length === 0) {
        return { type: 'empty', isInline: true }
    }
    return { type: 'entries', value: entries, isInline: true }
}

// 获取对象数组组件（用于虫群、设施等）
function getObjectArrayComponent(value: any) {
    // 返回一个渲染函数组件
    return {
        setup() {
            return () => {
                const dom = objectArrayToDiv(value)
                const div = document.createElement('div')
                div.appendChild(dom)
                return h('div', { innerHTML: div.innerHTML })
            }
        }
    }
}

function getObjectArrayProps(value: any) {
    return {}
}
</script>

<style scoped>
/* 从 src/css/modules/tile/tile.css 迁移 */

.state-display {
    /* 数据容器 */
}

.data {
    margin-right: 5px;
}

.state {
    margin-bottom: 5px;
}

.state > div:first-child {
    line-height: 21px;
    flex-shrink: 0;
}

.state > div:nth-child(2) {
    line-height: 21px;
    flex-wrap: wrap;
}

.flex {
    display: flex;
}
</style>
