<template>
    <Tile
        ref="tileRef"
        title="虫群"
        :close-type="'hide'"
        :initial-visible="false"
        :size="{ width: 300 }"
    >
        <table id="bugGroupTileGrid"></table>
    </Tile>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import Tile from '../common/Tile.vue'
import GridManager from 'gridmanager'
import 'gridmanager/index.css'
import { stateValue } from '@/core/state/State'
import { createObjectDiv } from '@/utils/objectDiv'

/**
 * 虫群Tile组件
 *
 * 从 src/js/Tiles/bugGroupTile.js 迁移
 *
 * 功能：
 * 1. 以表格形式显示虫巢中的虫群状态
 * 2. 表格列：名称、数量、生命、寿命、工作、攻击、防御
 * 3. 支持树形数据（同名虫群可折叠展开）
 */

const tileRef = ref<InstanceType<typeof Tile> | null>(null)
const bugNest = ref<any>(null)
let bugObjects: any[] = [] // 存储参与形成虫群表格的虫群对象
let gridInitialized = false

const bugGroupGridCol = [
    { key: '名称', text: '名称' },
    { key: '数量', text: '数量' },
    { key: '生命', text: '生命' },
    { key: '寿命', text: '寿命' },
    { key: '工作', text: '工作' },
    { key: '攻击', text: '攻击' },
    { key: '防御', text: '防御' }
]

// 初始化GridManager
function initGrid(bugNestObject: any): void {
    nextTick(() => {
        const table = document.querySelector('#bugGroupTileGrid')
        if (!table) return

        ;(table as any).GM(
            {
                gridManagerName: 'bugGroupTileGrid',
                ajaxData: { data: [] },
                supportCheckbox: false,
                supportAutoOrder: false,
                supportAdjust: false,
                supportDrag: false,
                columnData: bugGroupGridCol,
                supportTreeData: true,
                treeConfig: {
                    treeKey: '子元素'
                }
            },
            () => {
                gridInitialized = true
                updateGrid(bugNestObject)
            }
        )
    })
}

// 更新表格数据
function updateGrid(bugNestObject: any): void {
    if (!gridInitialized) return

    const gridData = makeBugGroupGridData(stateValue(bugNestObject, '虫群'))
    const table = document.querySelector('#bugGroupTileGrid')
    if (!table) return

    GridManager.setAjaxData(table, gridData, () => {
        // 将bugObjects依次放入"名称"列
        let bug_num = 0
        const tbody = table.querySelector('tbody')
        if (!tbody) return

        const rows = tbody.querySelectorAll('tr')
        rows.forEach((row) => {
            const td = row.querySelector('td[td-name="名称"]')
            if (td && td.textContent?.trim() === '') {
                const div = createObjectDiv(bugObjects[bug_num])
                bug_num += 1
                td.appendChild(div)
            }
        })
    })
}

// 生成虫群表格所需要的数据
function makeBugGroupGridData(bugGroup: any): any {
    const gridData: any[] = []
    bugObjects = []

    for (const bugName in bugGroup) {
        const bugs = bugGroup[bugName]
        if (bugs.length === 1) {
            const bug = bugs[0]
            const line_data = createBugGroupGridLine(bug)
            gridData.push(line_data)
            bugObjects.push(bug)
        } else {
            let bugNum_all = 0
            const bugGroup_children: any[] = []
            for (const bug of bugs) {
                bugNum_all += stateValue(bug, '数量')
                const line_data = createBugGroupGridLine(bug)
                bugGroup_children.push(line_data)
                bugObjects.push(bug)
            }
            const line_data = {
                名称: bugName,
                数量: bugNum_all,
                子元素: bugGroup_children
            }
            gridData.push(line_data)
        }
    }
    return { data: gridData }
}

// 通过虫群对象生成并填装对应的虫群行信息
function createBugGroupGridLine(bug: any): any {
    return {
        数量: stateValue(bug, '数量'),
        生命: stateValue(bug, ['生命', 'now']) + '/' + stateValue(bug, ['生命', 'max']),
        寿命: stateValue(bug, ['寿命', 'now']) + '/' + stateValue(bug, ['寿命', 'max']),
        工作: stateValue(bug, '工作'),
        攻击: stateValue(bug, '攻击'),
        防御: stateValue(bug, '防御')
    }
}

// 创建虫群Tile
function create(bugNestObject: any): void {
    bugNest.value = bugNestObject
    tileRef.value?.show()
    if (!gridInitialized) {
        initGrid(bugNestObject)
    } else {
        updateGrid(bugNestObject)
    }
}

// 更新虫群Tile数据
function update(bugNestObject: any): void {
    bugNest.value = bugNestObject
    updateGrid(bugNestObject)
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
/* 从 src/css/Tiles/bugGroup.css 迁移 */
#bugGroupTileGrid {
    width: 100%;
    table-layout: fixed;
}

:deep(.objectArray_inner > div) {
    position: relative;
    padding-left: 10px;
}
</style>
