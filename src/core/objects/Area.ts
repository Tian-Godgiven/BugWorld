import Area_lib from "../../library/Area/Area_lib.json"
import _ from "lodash"
import { initObject } from "./Object"
import type { GameObject } from "./Object"
import { changeState, pushToState, State } from "../state/State"
import { useGameStore } from "../../stores/game"
import { Status } from "../state/Status"
import { MovementContainer } from "../state/Movement"
import { Work } from "./Work"
import { Event } from "./Event"

/**
 * 地区对象类
 */
export class Area {
    type: string
    key: string
    id: number
    属性: {
        名称: State
        参数: State
        状态: Status[]
        虫巢: GameObject[]
        来源: GameObject[]
        创建者: GameObject[]
    }
    运行时: {
        进行中: {
            工作: Work[]
            事件: Event[]
        }
    }
    行为: MovementContainer

    constructor() {
        this.type = "object"
        this.key = ""
        this.id = 0
        this.属性 = {
            名称: {} as State,
            参数: {} as State,
            状态: [],
            虫巢: [],
            来源: [],
            创建者: []
        }
        this.运行时 = {
            进行中: {
                工作: [],
                事件: []
            }
        }
        this.行为 = new MovementContainer()
    }
}

/**
 * 创建一个指定key的地区
 */
export function createArea(
    area_key: string,
    source: any,
    states?: Record<string, any>
): Area {
    const gameStore = useGameStore()

    let area = new Area()
    let area_json = _.cloneDeep(Area_lib[area_key as keyof typeof Area_lib])
    const area_func = null
    // 初始化
    initObject(area, area_key, source, area_json.属性, area_func, states)

    // 分配 ID
    area.id = gameStore.getNextAreaId()

    // 设置为当前聚焦的地区
    gameStore.setFocusingArea(area)

    return area
}

/**
 * 返回当前聚焦的地区
 */
export function returnFocusingArea(): any {
    const gameStore = useGameStore()
    return gameStore.focusingArea
}

/**
 * 令虫巢加入一个地区
 */
export function bugNestJoinArea(bugNest: any, area: Area): void {
    // 令该虫巢的[属性→所处]为该地区
    changeState(bugNest, "所处", area)
    // 将其加入该地区的"虫巢"当中
    pushToState(area, "虫巢", bugNest)
}
