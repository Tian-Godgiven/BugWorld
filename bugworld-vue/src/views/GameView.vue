<template>
    <div id="game-container">
        <!-- 顶部区域：Tile容器 -->
        <div id="top_area">
            <div id="tile_container">
                <!-- 日志Tile -->
                <LogTile ref="logTileRef" />

                <!-- 虫巢Tile -->
                <BugNestTile ref="bugNestTileRef" />

                <!-- 虫群Tile -->
                <BugGroupTile ref="bugGroupTileRef" />

                <!-- 工作Tile -->
                <WorkTile ref="workTileRef" />

                <!-- 命令Tile -->
                <OrderTile ref="orderTileRef" />

                <!-- 设施Tile -->
                <FacilityTile ref="facilityTileRef" />

                <!-- 事件Tile -->
                <EventTile ref="eventTileRef" />
            </div>
        </div>

        <!-- 底部区域 -->
        <div id="bottom_area">
            <!-- 下一回合按钮 -->
            <div id="next_turn" @click="handleNextTurn">下一回合</div>

            <!-- Cube容器 -->
            <CubeContainer />
        </div>

        <!-- 信息弹窗 -->
        <InformationModal ref="informationModalRef" />

        <!-- 选择对话框 -->
        <ChooseTile />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, provide } from 'vue'
import LogTile from '@/components/tiles/LogTile.vue'
import BugNestTile from '@/components/tiles/BugNestTile.vue'
import BugGroupTile from '@/components/tiles/BugGroupTile.vue'
import WorkTile from '@/components/tiles/WorkTile.vue'
import OrderTile from '@/components/tiles/OrderTile.vue'
import FacilityTile from '@/components/tiles/FacilityTile.vue'
import EventTile from '@/components/tiles/EventTile.vue'
import ChooseTile from '@/components/tiles/ChooseTile.vue'
import CubeContainer from '@/components/common/CubeContainer.vue'
import InformationModal from '@/components/common/InformationModal.vue'
import { useGameStart } from '@/composables/useGameStart'
import { setLogTileRef } from '@/utils/log'
import { setWorkTileRef } from '@/utils/workTile'
import { setOrderTileRef } from '@/utils/orderTile'
import { setBugNestTileRef } from '@/utils/bugNestTile'
import { setFacilityTileRef } from '@/utils/facilityTile'
import { setEventTileRef } from '@/utils/eventTile'

/**
 * 游戏主视图
 *
 * 从 src/index.html 和 src/js/app/start.js 迁移
 *
 * 功能：
 * 1. 游戏主界面布局
 * 2. 包含所有Tile组件
 * 3. 包含CubeContainer组件
 * 4. 包含下一回合按钮
 * 5. 初始化游戏
 */

// Tile组件引用
const logTileRef = ref<any>(null)
const bugNestTileRef = ref<any>(null)
const bugGroupTileRef = ref<any>(null)
const workTileRef = ref<any>(null)
const orderTileRef = ref<any>(null)
const facilityTileRef = ref<any>(null)
const eventTileRef = ref<any>(null)
const informationModalRef = ref<any>(null)

// 游戏启动逻辑
const { bugNest, area, start, setTileRefs } = useGameStart()

// 提供 showInformation 方法给子组件
provide('showInformation', (object: any, event: MouseEvent) => {
    if (informationModalRef.value) {
        informationModalRef.value.showInformation(object, event)
    }
})

// 下一回合
function handleNextTurn(): void {
    console.log('下一回合')
    // TODO: 实现下一回合逻辑
}

// 初始化游戏
onMounted(async () => {
    // 设置所有Tile引用
    if (logTileRef.value) {
        setLogTileRef(logTileRef.value)
    }
    if (bugNestTileRef.value) {
        setBugNestTileRef(bugNestTileRef.value)
    }
    if (workTileRef.value) {
        setWorkTileRef(workTileRef.value)
    }
    if (orderTileRef.value) {
        setOrderTileRef(orderTileRef.value)
    }
    if (facilityTileRef.value) {
        setFacilityTileRef(facilityTileRef.value)
    }
    if (eventTileRef.value) {
        setEventTileRef(eventTileRef.value)
    }

    // 设置Tile引用（用于游戏启动）
    setTileRefs({
        logTile: logTileRef.value,
        bugNestTile: bugNestTileRef.value,
        bugGroupTile: bugGroupTileRef.value,
        workTile: workTileRef.value,
        orderTile: orderTileRef.value,
        facilityTile: facilityTileRef.value,
        eventTile: eventTileRef.value
    })

    // 启动游戏
    await start()
})
</script>

<style>
/* 从 src/css/main.css 迁移 */

#game-container {
    width: 100%;
    height: 100%;
}

#top_area {
    width: 100%;
    height: calc(100% - 150px);
    border-bottom: 2px solid black;
    padding: 5px;
    box-sizing: border-box;
    overflow-y: auto;
    overflow-x: hidden;
}

#tile_container {
    position: relative;
    width: 100%;
    min-height: 100%;
    box-sizing: border-box;
}

#bottom_area {
    width: 100%;
    height: 150px;
}

#next_turn {
    background-color: black;
    color: white;
    font-size: 20px;
    text-align: center;
    height: 30px;
    width: 100px;
    position: absolute;
    left: 50%;
    bottom: 100px;
    border: 2px solid black;
    border-radius: 3px;
    cursor: pointer;
    user-select: none;
}

#next_turn:hover {
    background-color: #333;
}

#next_turn:active {
    background-color: #000;
}
</style>
