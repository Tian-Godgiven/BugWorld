import Work_lib from "../../library/Work/Work_lib.json"
import * as Work_func_lib from "../../library/Work/Work_func_lib.js"
import { runObjectMovement, MovementContainer } from "../state/Movement"
import { stateValue, getStateUnit, changeState, State } from "../state/State"
import { getFreeBug, getOccupyBug, occupyBug, unoccupyBug, haveOccupy } from "./Bug"
import { initObject, loseSource, addDependency, removeDependency } from "./Object"
import type { GameObject } from "./Object"
import { appendWorkTileDiv, deleteWorkTileDiv, updateWorkTile } from "../../utils/workTile"
import { countValue, negativeValue } from "../../utils/global_ability"
import { hiddenValue, setHidden } from "../state/Hidden"
import _ from "lodash"

/**
 * 工作对象类
 */
export class Work {
    type: string
    key: string
    id: string | null
    属性: {
        名称: State
        需求: State
        消耗: State
        进度: State
        效率: number | string
        词条: string[]
        信息: State
        所属: GameObject[]
        依赖来源: GameObject[]
    }
    功能: {
        显示: boolean
        选择: boolean
        独立: boolean
        禁用?: boolean
    }
    运行时: {
        进行中: boolean
        总效率: number | string | null
        占有: GameObject[]
    }
    占有: GameObject[]
    行为: MovementContainer

    constructor() {
        this.type = "object"
        this.key = ""
        this.id = null
        this.属性 = {
            名称: {} as State,
            需求: {} as State,
            消耗: {} as State,
            进度: {} as State,
            效率: 0,
            词条: [],
            信息: {} as State,
            所属: [],
            依赖来源: []
        }
        this.功能 = {
            显示: true,
            选择: false,
            独立: false
        }
        this.运行时 = {
            进行中: false,
            总效率: null,
            占有: []
        }
        this.占有 = []
        this.行为 = new MovementContainer()
    }
}

/**
 * 创建一个工作对象
 */
export function createWork(work_key: string, source: any): Work | false {
    // 优先使用work_key中的内容
    let json = Work_lib[work_key as keyof typeof Work_lib]
    if (!json) {
        console.log("不存在指定的work_key：" + work_key)
        return false
    }
    let func = _.cloneDeep((Work_func_lib as any)[work_key])

    const work = createWorkWithData(work_key, source, json, func)

    return work
}

/**
 * 通过数据来创建工作对象
 */
export function createWorkWithData(
    key: string,
    source: any,
    json: any,
    func: any
): Work {
    const work = new Work()
    // Work 需要依赖来源（提供者消失则工作消失）
    // 必须在 initObject 之前调用，否则会被转换为 State 对象
    addDependency(work, source)
    // 初始化
    initObject(work, key, source, json.属性, func)
    // 载入功能
    Object.assign(work.功能, json.功能)
    return work
}

/**
 * 令虫巢解锁一个指定的工作对象
 * 如果传入的work是一个work_key，则必须传入source对象用来产生work
 */
export function unlockWorkToBugNest(
    work: Work | string,
    bugNest: any,
    source: any = null
): void {
    // 如果work不是一个"工作对象"，则尝试用Lib中获取并生成work对象
    if (!(work instanceof Work) && typeof work == "string") {
        const work_key = work
        work = createWork(work_key, source)
        if (work === false) {
            return
        }
    }

    // 保存【工作对象】到【虫巢】的[已解锁→工作]内
    const 已解锁工作 = hiddenValue(bugNest, ["已解锁", "工作"])
    if (_.includes(已解锁工作, work)) {
        console.log("该工作已经解锁过了")
    } else {
        已解锁工作.push(work)
    }
}

/**
 * 从【目标对象】的[已解锁→工作]中删除指定【工作对象】的来源or【工作对象】本身
 */
export function deleteWorkFrom(
    target: any,
    work_source: any,
    work: Work | null = null
): boolean | void {
    const 已解锁工作 = hiddenValue(target, ["已解锁", "工作"])
    // 如果给定了工作对象，则直接删除其依赖来源
    if (work) {
        // 要求这个工作对象在目标内部
        if (_.includes(已解锁工作, work)) {
            // 如果删除依赖来源后，对象的依赖来源为空，则删除这个对象
            if (!removeDependency(work, work_source)) {
                const index = 已解锁工作.indexOf(work)
                已解锁工作.splice(index, 1)
            }
        } else {
            console.log("这个工作对象不在目标的[功能→已解锁→工作]内")
            return false
        }
    } else {
        // 遍历【虫群对象】的[工作]，删除其中的有着对应依赖来源的工作
        for (let i = 已解锁工作.length - 1; i >= 0; i--) {
            const work = 已解锁工作[i]
            if (work.属性.依赖来源 && work.属性.依赖来源.includes(work_source)) {
                if (!removeDependency(work, work_source)) {
                    // 如果删除后，依赖来源为空，则会从虫巢中删除该工作
                    已解锁工作.splice(i, 1)
                }
            }
        }
    }
}

/**
 * 令某个工作开始进行，返回相应的工作对象
 */
export function startWork(bugNest: any, work: Work | string): Work | false {
    let work_key: string | null = null
    let haveWork = false
    const 已解锁工作 = hiddenValue(bugNest, ["已解锁", "工作"])
    // 如果传入的是一个work对象，则先查询其是否在bugNest中解锁
    if (work instanceof Work) {
        if (_.includes(已解锁工作, work)) {
            haveWork = true
        }
    }
    // 否则认为传入的是一个work_key
    else {
        work_key = work
        // 查找该工作key是否在bugNest中已经解锁
        for (let i of 已解锁工作) {
            // 找到对应的工作
            if (i.key == work_key) {
                work = i
                haveWork = true
                break
            }
        }
    }

    // 如果指定的【工作】不属于该【虫巢】,则报错
    if (!haveWork) {
        console.log("无法开始指定的工作：虫巢尚未解锁该工作！")
        return false
    }

    // 如果该工作对象的[功能→禁用]为true，或者其已经处于"进行中"，则无法令其开始
    if ((work as Work).功能.禁用) {
        console.log("该工作已被禁用")
        return false
    }

    if (hiddenValue(work, "进行中") == true) {
        console.log("该工作正在进行")
        return false
    }

    // 如果这个工作是"独立"的，则获取这个work对象的深拷贝
    if ((work as Work).功能.独立 == true) {
        work = _.cloneDeep(work)
    }

    // 修改工作对象的"进行中"属性,设置其"总效率"为0,修改其所属
    setHidden(work, "进行中", true)
    setHidden(work, "总效率", 0)
    changeState(work, "所属", bugNest)
    // 将该工作添加到bugNest的"进行中"当中
    const 进行中工作 = hiddenValue(bugNest, ["进行中", "工作"])
    进行中工作.push(work)

    // 执行其[行为→开始]
    runObjectMovement(work as Work, "开始", bugNest)

    // 创建一个工作Tile的div
    appendWorkTileDiv(work)

    return work as Work
}

/**
 * 令指定的工作对象结束，遣散参加该工作的所有对象
 */
export function stopWork(work: Work, type?: string): boolean {
    if (type == "中断") {
        runObjectMovement(work, "中断")
    }

    // 所有被该工作占用的对象分别辞职
    for (let object of work.占有) {
        resignWork(object, "all", work)
    }
    // 使得工作对象的"进行中"为false
    setHidden(work, "进行中", false)
    // 从work[属性→所属]的对象的[进行中→工作]数组中删除work
    const 所属 = stateValue(work, "所属")
    const 进行中工作 = hiddenValue(所属, ["进行中", "工作"])
    const index = 进行中工作.indexOf(work)
    进行中工作.splice(index, 1)
    // 从工作Tile中删除[data→work]为该工作的workDiv
    deleteWorkTileDiv(work)

    return true
}

/**
 * 令指定数量的【虫群对象】的参与指定的【工作对象】，虫群对象被占有，工作对象获得参与，并计算效率
 */
export function joinWork(bug: any, num: number, work: Work): void {
    // 【虫群对象】符合【工作】的需求行为的要求
    if (runObjectMovement(work, "需求", bug, num)) {
        const free_num = getFreeBug(bug)
        // 并且指定的数量 <= 虫群对象当前的空闲数量
        if (num <= free_num) {
            // 令该工作占有指定数量的虫群单位
            occupyBug(bug, num, work)
            // 计算并提升工作的总效率
            let 效率 = countWorkEfficiency(work, bug, num)
            let 总效率 = countValue(hiddenValue(work, "总效率"), 效率)
            setHidden(work, "总效率", 总效率)
            // 刷新工作Tile
            updateWorkTile()
        }
    }
}

/**
 * 令指定虫群对象的指定个数退出指定的工作
 */
export function resignWork(bug: any, num: number | "all", work: Work): void {
    // 对象要具备这个工作
    if (haveOccupy(bug, work)) {
        const work_num = getOccupyBug(bug, work)
        // 如果是全部辞职
        if (num == "all") {
            num = work_num
        }
        // 辞职数不会超过工作数量
        if (num > work_num) {
            num = work_num
        }
        // 令这个对象被该工作占有的数量减少num
        unoccupyBug(bug, num, work)
        // 减少对应的总效率
        let 效率 = countWorkEfficiency(work, bug, num)
        // 将这个值取负
        效率 = negativeValue(效率)
        let 总效率 = countValue(hiddenValue(work, "总效率"), 效率)
        setHidden(work, "总效率", 总效率)
        // 刷新工作Tile
        updateWorkTile()
    }
}

/**
 * 计算对象参加事务后提供的效率并返回。
 * @param work - 工作对象
 * @param object - 参与对象
 * @param num - 参与数量
 * @param type - 计算结果的格式类型，type 的有效值包括：
 *    "no_symbol": 返回的值不会带有符号，是一个纯数字；
 *    "unit": 返回的值会带上对象"效率"属性的单位。
 * @returns 根据 type 参数返回相应格式的效率值。
 */
export function countWorkEfficiency(
    work: Work,
    object: any,
    num: number,
    type?: string
): number | string | false {
    const 效率 = stateValue(work, "效率")
    if (效率 != null) {
        // 计算效率值
        let value: number | string = runObjectMovement(work, "效率", object) * num
        // 如果效率带有+-符号则返回值也会带有,除非效率为0
        if (/[+-]/.test(效率)) {
            if (value != 0) {
                let simbol = value > 0 ? "+" : "-"
                value = simbol + value
            }
        }

        if (type == "unit") {
            const unit = getStateUnit(work, "效率")
            if (unit) {
                value += unit
            }
        }
        return value
    }
    return false
}
