import Bug_lib from "../../library/Bug/Bug_lib.json"
import * as Bug_func_lib from "../../library/Bug/Bug_func_lib"

import { stateValue, pushToState, changeState, State } from "../state/State"
import { Status } from "../state/Status"
import _ from "lodash"
import { bindObjectCharacteristic, Characteristic } from "./Characteristic"
import { initObject, occupySpace } from "./Object"
import type { GameObject } from "./Object"
import { runObjectMovement, MovementContainer } from "../state/Movement"
import { appendLog } from "../../utils/log"
import { updateOrderTile, updateOrderTileBugDiv } from "../../utils/orderTile"
import { hiddenValue } from "../state/Hidden"

/**
 * 虫群对象类
 */
export class Bug {
    type: string
    key: string
    属性: {
        名称: State
        数量: State
        参数: State
        系数: State
        特殊: State
        状态: Status[]
        特性: Characteristic[]
        词条: string[]
        信息: State
        所属: GameObject[]
        创建者: GameObject[]
    }
    单位: {
        寿命: string
        占据: string
        储备: string
        生产: string
        消耗: string
        饥饿: string
        回复: string
    }
    运行时: {
        被占有: Array<{
            占有数量: number
            占有来源: GameObject
        }>
    }
    行为: MovementContainer

    constructor() {
        this.type = "object"
        this.key = ""
        this.属性 = {
            名称: {} as State,
            数量: {} as State,
            参数: {} as State,
            系数: {} as State,
            特殊: {} as State,
            状态: [],
            特性: [],
            词条: [],
            信息: {} as State,
            所属: [],
            创建者: []
        }
        this.单位 = {
            寿命: "回合",
            占据: "空间",
            储备: "营养",
            生产: "营养/回合",
            消耗: "营养/回合",
            饥饿: "生命/回合",
            回复: "生命/回合"
        }
        this.运行时 = {
            被占有: []
        }
        this.行为 = {}
    }
}

/**
 * 创建虫群对象
 */
export async function createBug(
    bug_key: string,
    num: number,
    source: any,
    states?: Record<string, any>
): Promise<Bug> {
    let bug = new Bug()
    // 从lib中获取对象的属性数据
    let bug_state = Bug_lib[bug_key as keyof typeof Bug_lib]
    // 初始化一些属性和参数
    const more_states: Record<string, any> = {
        数量: num,
        参数: {
            寿命: { now: 1 },
            生命: { now: bug_state.参数.生命.max },
            储备: { now: 0 }
        }
    }
    // 将这个属性与传来的"修改属性"所连接
    if (states) {
        Object.assign(more_states, states)
    }
    // 初始化行为
    const bug_func = _.cloneDeep((Bug_func_lib as any)[bug_key])
    // 初始化这个对象
    initObject(bug, bug_key, source, bug_state, bug_func, more_states)

    // 为【虫群对象】绑定【特性】
    await bindObjectCharacteristic(bug, source)

    return bug
}

/**
 * 令虫群对象被一个来源所占有
 */
export function occupyBug(bug: Bug, need_num: number | "剩余", source: any): boolean {
    const free_num = getFreeBug(bug)
    // 如果占有数量为"剩余"，则占有该对象剩余的所有数量
    if (need_num == "剩余") {
        need_num = free_num
    }

    // 占有数量不能大于空闲数量
    if (need_num > free_num) {
        console.log(`空闲的${stateValue(bug, "名称")}数量不足`)
        return false
    }

    // 判断这个占有源是否存在，如果已经存在，则增加其数量
    let temp = false
    const 被占有 = hiddenValue(bug, "被占有")
    for (let i of 被占有) {
        if (source == i.占有来源) {
            i.占有数量 += need_num
            temp = true
            break
        }
    }

    // 否则加入占有
    if (!temp) {
        const occupy = {
            占有数量: need_num,
            占有来源: source
        }
        // 放入被占有属性中
        被占有.push(occupy)
        // 将对象放入占有源的隐藏属性"占有"中
        hiddenValue(source, "占有").push(bug)
    }

    // 刷新命令Tile中对应对象的bugDiv
    updateOrderTileBugDiv(bug)
    return true
}

/**
 * 解除虫群对象的占用
 */
export function unoccupyBug(bug: Bug, bug_num: number | "all", source: any): boolean {
    let occupy: { 占有数量: number; 占有来源: any } | undefined
    let occupy_index: number | undefined
    const 被占有 = hiddenValue(bug, "被占有")
    for (let i of 被占有) {
        if (source == i.占有来源) {
            occupy = i
            occupy_index = 被占有.indexOf(occupy)
            break
        }
    }

    if (!occupy || occupy_index === undefined) {
        console.log(bug, source)
        throw new Error("无法解除对象(1)的占有，对应来源(2)的占有对象在其中不存在")
    }

    if (bug_num == "all") {
        bug_num = occupy.占有数量
    }

    // 减少对应的占有数量
    if (bug_num < occupy.占有数量) {
        occupy.占有数量 -= bug_num
    }
    // 若减少数量刚好为占有数量，则删除对应的占用对象
    else if (bug_num == occupy.占有数量) {
        被占有.splice(occupy_index, 1)
        const 占有 = hiddenValue(source, "占有")
        const source_index = 占有.indexOf(bug)
        占有.splice(source_index, 1)
    } else {
        console.log("解除占用的数量错误！", bug_num)
        return false
    }
    // 刷新命令Tile中对应bug的bugDiv
    updateOrderTileBugDiv(bug)
    return true
}

/**
 * 获得一个指定占有对应的占有信息
 */
export function getOccupyBug(bug: Bug, source: any): number {
    const 被占有 = hiddenValue(bug, "被占有")
    for (let i of 被占有) {
        if (source == i.占有来源) {
            return i.占有数量
        }
    }

    // 如果不存在source的占有来源，则认定没有被对应来源所占有
    return 0
}

/**
 * 获得一个虫群对象当中未被占有的数量
 */
export function getFreeBug(bug: Bug): number {
    let 数量 = stateValue(bug, "数量")
    // 遍历其占有对象，依次减去被占有的数量
    const 被占有 = hiddenValue(bug, "被占有")
    for (let occupy of 被占有) {
        数量 -= occupy.占有数量
    }
    return 数量
}

/**
 * 令虫群单位加入一个对象,修改虫群对象的所属为这个对象
 * 要求这个对象必须具备"虫群"属性用于放置虫群单位
 */
export function bugJoinTo(bug: Bug, target: any, source: any): boolean {
    // 判断目标是否满足bug对象的加入需求
    if (runObjectMovement(bug, "加入需求", target)) {
        // 触发该对象的加入行为，若加入过程中返回了false，则加入失败
        runObjectMovement(bug, "加入", target)
        // 令该虫群对象占据目标的空间,如果空间不足，会返回false
        if (!occupySpace(bug, target)) {
            return false
        }

        // 修改虫群单位的所属
        changeState(bug, "所属", target)
        // 如果对象的"虫群"属性中已有同key的对象，则令其加入
        const bug_key = bug.key
        const bugGroup = stateValue(target, "虫群")
        if (_.has(bugGroup, bug_key)) {
            bugGroup[bug_key].push(bug)
        }
        // 否则直接加入"虫群"当中
        else {
            bugGroup[bug_key] = [bug]
        }

        // 日志输出
        appendLog([bug, "x" + stateValue(bug, "数量"), "进入了", target])
        return true
    } else {
        // 未满足的情况下,无法进入虫巢
        appendLog([target, "未能满足", bug, "的加入需求"])
        return false
    }
}

/**
 * 返回对象是否参与了某个事务
 */
export function haveOccupy(object: Bug, source: any): boolean {
    // 遍历对象的[被占有]属性
    const 被占有 = hiddenValue(object, "被占有")
    for (let occupy of 被占有) {
        if (occupy.占有来源 == source) {
            return true
        }
    }
    return false
}
