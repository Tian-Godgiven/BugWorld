import BugNest_lib from "../../library/BugNest/BugNest_lib.json"
import { updateBugNestTile } from "../../utils/bugNestTile"
import _ from "lodash"
import { initObject } from "./Object"
import type { GameObject } from "./Object"
import { bugJoinTo, Bug } from "./Bug"
import { useGameStore } from "../../stores/game"
import { State } from "../state/State"
import { Status } from "../state/Status"
import { Characteristic } from "./Characteristic"
import { MovementContainer } from "../state/Movement"
import { Work } from "./Work"

/**
 * 虫巢对象类
 */
export class BugNest {
    type: string
    key: string
    属性: {
        名称: State
        参数: State
        系数: State
        虫群: Record<string, Bug[]>
        设施: Record<string, GameObject[]>
        状态: Status[]
        特殊: State
        特性: Characteristic[]
        词条: string[]
        所处: {
            数组: GameObject[]
            数量: number
        }
        信息: State
        其他: any[]
        创建者: GameObject[]
    }
    单位: {
        生产: string
        消耗: string
    }
    运行时: {
        已解锁: {
            工作: Work[]
            设施建造: Record<string, Work>
        }
        进行中: {
            事件: GameObject[]
            工作: Work[]
        }
        事件信息: {
            概率边界: number
            倾向边界: number
        }
    }
    行为: MovementContainer

    constructor() {
        this.type = "object"
        this.key = ""
        this.属性 = {
            名称: {} as State,
            参数: {} as State,
            系数: {} as State,
            虫群: {},
            设施: {},
            状态: [],
            特殊: {} as State,
            特性: [],
            词条: [],
            所处: {
                数组: [],
                数量: 1
            },
            信息: {} as State,
            其他: [],
            创建者: []
        }
        this.单位 = {
            生产: "营养/回合",
            消耗: "营养/回合"
        }
        this.运行时 = {
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
