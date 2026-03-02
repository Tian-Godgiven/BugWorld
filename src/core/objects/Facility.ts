import Facility_lib from "../../library/Facility/Facility_lib.json"
import Facility_Work_lib from "../../library/Facility/Facility_Work_lib.json"
import * as Facility_func_lib from "../../library/Facility/Facility_func_lib"
import * as Facility_Work_func_lib from "../../library/Facility/Facility_Work_func_lib"
import { changeState, stateValue } from "../state/State"
import { initObject } from "./Object"
import { runObjectMovement } from "../state/Movement"
import { updateBugNestTile } from "../../utils/bugNestTile"
import { updateFacilityTile } from "../../utils/facilityTile"
import { appendLog } from "../../utils/log"
import { createWork, createWorkWithData, unlockWorkToBugNest } from "./Work"
import { haveEntry } from "../state/Entry"
import { createImpact, impactToObject } from "../state/Impact"
import { hiddenValue } from "../state/Hidden"
import { newError } from "../../utils/global_ability"
import _ from "lodash"

/**
 * 设施对象类
 */
class Facility {
    type: string
    key: string
    属性: {
        名称: string | null
        等级: number | null
        数量: number
        效果: any
        特性: any[]
        词条: any[]
        信息: string | null
        所属: any[]
    }
    行为: {
        获得: any
        效果: any
        结算: any
        摧毁: any
    }
    功能: {
        升级: boolean
        拆除: boolean
        新增?: boolean
    }
    隐藏: {
        工作: Record<string, any>
    }

    constructor() {
        this.type = "object"
        this.key = ""
        this.属性 = {
            名称: null,
            等级: null,
            数量: 0,
            效果: null,
            特性: [],
            词条: [],
            信息: null,
            所属: []
        }
        this.行为 = {
            获得: null,
            效果: null,
            结算: null,
            摧毁: null
        }
        this.功能 = {
            升级: false,
            拆除: true
        }
        this.隐藏 = {
            工作: {}
        }
    }
}

/**
 * 创建一个设施对象并返回
 */
export function createFacility(
    facility_key: string,
    source: any,
    num: number | null = null,
    states?: Record<string, any>
): Facility | false {
    const facility = new Facility()
    // 初始化
    const json = Facility_lib[facility_key as keyof typeof Facility_lib]
    if (!json) {
        console.log("指定的facility_key不存在")
        return false
    }
    const more_states: Record<string, any> = {}
    if (num) {
        more_states["数量"] = num
    }

    Object.assign(more_states, states)
    const facility_func = _.cloneDeep((Facility_func_lib as any)[facility_key])
    // 绑定来源，函数，以及额外属性
    initObject(facility, facility_key, source, json.属性, facility_func, more_states)
    // 载入功能
    Object.assign(facility.功能, json.功能)

    const 设施工作 = hiddenValue(facility, "工作")
    // 填装设施工作
    if (facility.功能.升级) {
        设施工作["升级"] = []
        const 升级s = (Facility_Work_lib as any)[facility_key]["升级"]
        for (let key in 升级s) {
            const work = createFacilityWork(facility_key, ["升级", key], facility)
            if (work) {
                设施工作["升级"].push(work)
            }
        }
    }
    // 拆除
    if (facility.功能.拆除 !== false) {
        const work = createFacilityWork(facility_key, "拆除", facility)
        设施工作["拆除"] = work
    }

    return facility
}

/**
 * 创建一个设施的指定work对象并返回
 */
export function createFacilityWork(
    facility_key: string | Facility,
    work_key: string | string[],
    work_source: any
): any {
    // 如果传入的是一个设施对象，则获取其key
    if (facility_key instanceof Facility) {
        facility_key = facility_key.key
    }
    // 获取设施对应的工作
    let facilityWork: any = (Facility_Work_lib as any)[facility_key]
    let facilityWorkFunc: any = (Facility_Work_func_lib as any)[facility_key]
    if (!facilityWork) {
        console.log("不存在指名的设施key：" + facility_key)
        return false
    }
    // 获取指名的工作对象
    let json: any, func: any
    // 如果传入的work_key是数组，则按数组的顺序寻找工作对象
    if (_.isArray(work_key)) {
        for (let key of work_key) {
            facilityWork = facilityWork[key]
            facilityWorkFunc = facilityWorkFunc[key]
        }
        json = facilityWork
        func = facilityWorkFunc
    } else {
        json = facilityWork[work_key]
        func = facilityWorkFunc[work_key]
    }

    if (!json) {
        console.log("不存在指名的工作key：" + work_key)
        return false
    }
    if (!func) {
        console.log("不存在指名的工作对应的工作函数：" + work_key)
        return false
    }

    func = _.cloneDeep(func)
    // 创建work对象
    const work = createWorkWithData(work_key as any, work_source, json, func)
    // 所有的设施work，其[功能→新增]均为false,不会显示在新增工作menu中
    // 需要通过特定的方式来开始
    work.功能.新增 = false
    return work
}

/**
 * 为虫巢对象解锁一个设施对象
 */
export function unlockFacilityToBugNest(
    facility_key: string,
    work_source: any,
    bugNest: any
): void {
    // 判断该设施对象是否存在
    if (Facility_lib[facility_key as keyof typeof Facility_lib]) {
        // 创建对应的设施对象的"建造"工作
        const build = createFacilityWork(facility_key, "建造", work_source)
        // 解锁这个"建造"工作
        unlockWorkToBugNest(build, bugNest, work_source)
        const 设施建造 = hiddenValue(bugNest, ["已解锁", "设施建造"])
        设施建造[facility_key] = build
    } else {
        newError("000", ["该设施不存在"])
    }
}

/**
 * 令虫巢获得指定设施
 */
export function facilityJoinToBugNest(facility: Facility, bugNest: any): boolean | void {
    // 判断该虫巢是否满足添加设施对象的需求
    if (runObjectMovement(facility, "加入需求", bugNest)) {
        // 触发该设施的获得行为
        runObjectMovement(facility, "获得", bugNest)

        // 修改设施的所属
        changeState(facility, "所属", bugNest)
        // 如果对象的"设施"属性中已有同key的对象，则令其加入
        const facility_key = facility.key
        const num = stateValue(facility, "数量")
        const 设施 = stateValue(bugNest, "设施")
        if (_.has(设施, facility_key)) {
            // 如果这个设施有"堆叠"词条，则检查同key的设施是否具备"堆叠"词条
            if (haveEntry(facility, "堆叠")) {
                for (let old_facility of 设施[facility_key]) {
                    if (haveEntry(old_facility, "堆叠")) {
                        // 令原有的设施对象的数量提升该设施的数量
                        const source = stateValue(facility, "来源")
                        addFacilityNum(old_facility, source, num, undefined)
                    }
                }
            }
            // 否则直接将这个设施添加到对应的字典数组中
            else {
                设施[facility_key].push(facility)
            }
        }
        // 如果还没有同key的设施，则创建对应的数组
        else {
            设施[facility_key] = [facility]
        }

        // 为虫巢解锁这个设施的升级工作和拆除工作
        const 升级works = hiddenValue(facility, ["工作", "升级"])
        if (升级works) {
            for (let work_key in 升级works) {
                const 升级work = 升级works[work_key]
                unlockWorkToBugNest(升级work, bugNest, facility)
            }
        }
        const 拆除work = hiddenValue(facility, ["工作", "拆除"])
        if (拆除work) {
            unlockWorkToBugNest(拆除work, bugNest, facility)
        }

        // 日志输出
        appendLog([bugNest, "获得了设施：", facility, "x" + num])
        // 刷新Tile显示
        updateBugNestTile(bugNest)
        updateFacilityTile(bugNest)
    } else {
        // 未满足的情况下,无法进入虫巢
        appendLog([bugNest, "未能满足", facility, "的加入需求"])
        return false
    }
}

/**
 * 增加一个设施对象的数量
 */
export function addFacilityNum(
    facility: Facility,
    source: any,
    num: number,
    level?: number | string
): void {
    // 添加一个影响至设施对象的数量
    const impact = createImpact(source, num, level)
    impactToObject(impact, facility, "数量")
}
