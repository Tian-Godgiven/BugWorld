import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * 游戏全局状态 Store
 *
 * 管理游戏中的全局状态，包括：
 * - 当前聚焦的地区和虫巢
 * - ID 计数器
 * - 其他游戏全局状态
 */
export const useGameStore = defineStore('game', () => {
    // ========== 地区相关 ==========

    /**
     * 当前聚焦的地区对象
     */
    const focusingArea = ref<any>(null)

    /**
     * 地区 ID 计数器
     */
    const areaIdCounter = ref(0)

    /**
     * 获取下一个地区 ID 并自增
     */
    function getNextAreaId(): number {
        const id = areaIdCounter.value
        areaIdCounter.value++
        return id
    }

    /**
     * 设置当前聚焦的地区
     */
    function setFocusingArea(area: any): void {
        focusingArea.value = area
    }

    // ========== 虫巢相关 ==========

    /**
     * 当前聚焦的虫巢对象
     */
    const focusingBugNest = ref<any>(null)

    /**
     * 设置当前聚焦的虫巢
     */
    function setFocusingBugNest(bugNest: any): void {
        focusingBugNest.value = bugNest
    }

    /**
     * 获取当前聚焦的虫巢
     */
    function getFocusingBugNest(): any {
        return focusingBugNest.value
    }

    return {
        // 地区
        focusingArea,
        areaIdCounter,
        getNextAreaId,
        setFocusingArea,

        // 虫巢
        focusingBugNest,
        setFocusingBugNest,
        getFocusingBugNest
    }
})
