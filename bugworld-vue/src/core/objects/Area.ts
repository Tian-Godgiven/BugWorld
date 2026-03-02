import Area_lib from "../../library/Area/Area_lib.json"
import _ from "lodash"
import { initObject } from "./Object"
import { changeState, pushToState } from "../state/State"
import { useGameStore } from "../../stores/game"

/**
 * 地区对象类
 */
class Area {
    type: string
    key: string
    id: number
    属性: {
        名称: string | null
        参数: Record<string, any>
        状态: any
        虫巢: any[]
        来源: any[]
    }
    隐藏: {
        进行中: {
            工作: any[]
            事件: any[]
        }
    }
    行为: Record<string, any>

    constructor() {
        this.type = "object"
        this.key = ""
        this.id = 0
        this.属性 = {
            名称: null,
            参数: {},
            状态: null,
            虫巢: [],
            来源: []
        }
        this.隐藏 = {
            进行中: {
                工作: [],
                事件: []
            }
        }
        this.行为 = {}
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
