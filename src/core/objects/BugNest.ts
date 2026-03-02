import BugNest_lib from "../../library/BugNest/BugNest_lib.json"
import { updateBugNestTile } from "../../utils/bugNestTile"
import _ from "lodash"
import { initObject } from "./Object"
import { bugJoinTo } from "./Bug"
import { useGameStore } from "../../stores/game"

/**
 * 虫巢对象类
 */
class BugNest {
    type: string
    key: string
    属性: {
        名称: string | null
        参数: Record<string, any>
        系数: Record<string, any>
        虫群: Record<string, any>
        设施: Record<string, any>
        状态: any[]
        特殊: Record<string, any>
        特性: any[]
        词条: any[]
        所处: {
            数组: any[]
            数量: number
        }
        信息: string | null
        其他: any[]
    }
    单位: {
        生产: string
        消耗: string
    }
    隐藏: {
        已解锁: {
            工作: any[]
            设施建造: Record<string, any>
        }
        进行中: {
            事件: any[]
            工作: any[]
        }
        事件信息: {
            概率边界: number
            倾向边界: number
        }
    }
    行为: Record<string, any>

    constructor() {
        this.type = "object"
        this.key = ""
        this.属性 = {
            名称: null,
            参数: {},
            系数: {},
            虫群: {},
            设施: {},
            状态: [],
            特殊: {},
            特性: [],
            词条: [],
            所处: {
                数组: [],
                数量: 1
            },
            信息: null,
            其他: []
        }
        this.单位 = {
            生产: "营养/回合",
            消耗: "营养/回合"
        }
        this.隐藏 = {
            已解锁: {
                工作: [],
                设施建造: {}
            },
            进行中: {
                事件: [],
                工作: []
            },
            事件信息: {
                概率边界: 50,
                倾向边界: 0
            }
        }
        this.行为 = {}
    }
}

/**
 * 返回当前聚焦中的虫巢对象
 */
export function getFocusingBugNest(): any {
    const gameStore = useGameStore()
    return gameStore.getFocusingBugNest()
}

/**
 * 创建一个指定类型的虫巢对象
 */
export function createBugNest(
    bugNest_key: string,
    source: any,
    more_state?: Record<string, any>
): BugNest {
    // 创建对象
    const bugNest = new BugNest()
    // 初始化
    const bugNest_json = BugNest_lib[bugNest_key as keyof typeof BugNest_lib]
    const bugNest_func = null
    initObject(bugNest, bugNest_key, source, bugNest_json, bugNest_func, more_state)

    return bugNest
}

/**
 * 移动到指定的虫巢对象（设置为当前聚焦的虫巢）
 */
export function moveToBugNest(bugNest: BugNest): void {
    const gameStore = useGameStore()
    gameStore.setFocusingBugNest(bugNest)
}

/**
 * 令虫群对象加入虫巢
 */
export function bugJoinToBugNest(bug: any, bugNest: BugNest): void {
    if (bugJoinTo(bug, bugNest, null)) {
        // 刷新BugNest Tile显示
        updateBugNestTile(bugNest)
    }
}
