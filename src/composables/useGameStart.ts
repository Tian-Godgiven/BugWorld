import { ref } from 'vue'
import { createArea, bugNestJoinArea } from '@/core/objects/Area'
import { createBug } from '@/core/objects/Bug'
import { createBugNest, bugJoinToBugNest, moveToBugNest } from '@/core/objects/BugNest'
import { createFacility, facilityJoinToBugNest, unlockFacilityToBugNest } from '@/core/objects/Facility'
import { unlockWorkToBugNest, startWork, joinWork } from '@/core/objects/Work'
import { createEvent, startEvent } from '@/core/objects/Event'
import { appendLog } from '@/utils/log'
import { random } from 'lodash'

/**
 * 游戏启动逻辑
 *
 * 从 src/js/app/start.js 迁移
 *
 * 功能：
 * 1. 初始化游戏世界
 * 2. 创建初始区域和虫巢
 * 3. 创建初始虫群单位
 * 4. 解锁初始工作
 * 5. 创建初始设施
 * 6. 创建初始事件
 *
 * 原文件位置：src/js/app/start.js (101行)
 */

export function useGameStart() {
    const bugNest = ref<any>(null)
    const area = ref<any>(null)

    // Tile组件引用
    const logTileRef = ref<any>(null)
    const bugNestTileRef = ref<any>(null)
    const bugGroupTileRef = ref<any>(null)
    const workTileRef = ref<any>(null)
    const orderTileRef = ref<any>(null)
    const facilityTileRef = ref<any>(null)
    const eventTileRef = ref<any>(null)

    /**
     * 启动游戏
     */
    async function start(): Promise<void> {
        appendLog(['游戏开始'])

        // 创建区域
        area.value = createArea('平原', '测试')
        appendLog(['创建区域：', area.value])

        // 在区域内创建一座虫巢并移动过去
        bugNest.value = createBugNest('genisis-nest', '测试')
        bugNestJoinArea(bugNest.value, area.value)
        moveToBugNest(bugNest.value)
        appendLog(['创建虫巢：', bugNest.value])

        // 创建虫巢和虫群信息栏
        if (bugNestTileRef.value) {
            bugNestTileRef.value.create(bugNest.value)
        }
        if (bugGroupTileRef.value) {
            bugGroupTileRef.value.create(bugNest.value)
        }

        // 为虫巢创建虫群单位
        const Queen = await createBug('虫后', 2, '测试')
        const Worker = await createBug('工虫', 10, '测试')
        const Worker2 = await createBug('工虫', 10, '测试')
        const Soldier = await createBug('兵虫', 10, '测试')

        bugJoinToBugNest(Queen, bugNest.value)
        bugJoinToBugNest(Worker, bugNest.value)
        bugJoinToBugNest(Worker2, bugNest.value)
        bugJoinToBugNest(Soldier, bugNest.value)

        // 为虫巢解锁工作
        unlockWorkToBugNest('觅食', bugNest.value, bugNest.value)
        unlockWorkToBugNest('探索', bugNest.value, bugNest.value)
        unlockWorkToBugNest('哺育', bugNest.value, bugNest.value)
        unlockWorkToBugNest('修建设施', bugNest.value, bugNest.value)

        // 创建工作信息栏
        if (workTileRef.value) {
            workTileRef.value.create(bugNest.value)
        }

        // 开始这些工作
        const findFood = startWork(bugNest.value, '觅食')
        const adventure1 = startWork(bugNest.value, '探索')
        const adventure2 = startWork(bugNest.value, '探索')
        const feed = startWork(bugNest.value, '哺育')

        // 安排虫群参与工作
        if (findFood) joinWork(Worker, 5, findFood)
        if (adventure1) joinWork(Worker, 2, adventure1)
        if (adventure2) joinWork(Soldier, 3, adventure2)
        if (feed) joinWork(Queen, 2, feed)

        // 创建命令信息栏
        if (orderTileRef.value) {
            orderTileRef.value.create(bugNest.value)
        }

        // 添加可修建设施
        unlockFacilityToBugNest('虫母室', '测试', bugNest.value)
        unlockFacilityToBugNest('孵化室', '测试', bugNest.value)

        // 为虫巢添加设施
        const facility = createFacility('虫母室', '测试', 1)
        const facility2 = createFacility('孵化室', '测试', 1)
        facilityJoinToBugNest(facility, bugNest.value)
        facilityJoinToBugNest(facility2, bugNest.value)

        // 创建设施信息栏
        if (facilityTileRef.value) {
            facilityTileRef.value.create(bugNest.value)
        }

        // 创建一个事件
        const event1 = createEvent('虫群折损', '测试')
        const eventpower = random(1, 10)
        startEvent(event1, bugNest.value, '测试', eventpower)

        // 创建事件信息Tile
        if (eventTileRef.value) {
            eventTileRef.value.create(bugNest.value)
        }
    }

    /**
     * 设置Tile引用
     */
    function setTileRefs(refs: {
        logTile?: any
        bugNestTile?: any
        bugGroupTile?: any
        workTile?: any
        orderTile?: any
        facilityTile?: any
        eventTile?: any
    }): void {
        if (refs.logTile) logTileRef.value = refs.logTile
        if (refs.bugNestTile) bugNestTileRef.value = refs.bugNestTile
        if (refs.bugGroupTile) bugGroupTileRef.value = refs.bugGroupTile
        if (refs.workTile) workTileRef.value = refs.workTile
        if (refs.orderTile) orderTileRef.value = refs.orderTile
        if (refs.facilityTile) facilityTileRef.value = refs.facilityTile
        if (refs.eventTile) eventTileRef.value = refs.eventTile
    }

    return {
        bugNest,
        area,
        start,
        setTileRefs
    }
}
