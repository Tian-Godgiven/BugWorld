import _ from "lodash"
import { stateValue, loadJsonStatesToObject, haveState, popFromState } from "../state/State"
import { expandJsObject } from "../../utils/global_ability"
import { initMovement } from "../state/Movement"
import { createImpact, impactToObject } from "../state/Impact"
import { appendLog } from "../../utils/log"

/**
 * 初始化一个对象，加载对应的 json 属性值至该对象中
 */
export function initObject(
    object: any,
    object_key: string,
    source: any,
    object_json: Record<string, any>,
    object_func: Record<string, any>,
    more_states?: Record<string, any>
): void {
    // 令对象获得"来源"
    getSource(object, source)

    // 拷贝 object 的初始属性，读取 object_json 和 more_states 的数据，用以拓充 object 的属性
    let states = _.cloneDeep(object.属性)
    states = expandJsObject(states, object_json)
    if (more_states) {
        states = expandJsObject(states, more_states)
    }

    // 添加 type 标识
    object["type"] = "object"
    // 添加 key 标识
    object["key"] = object_key

    // 将属性加载到对象当中，这些属性都是"基础"属性，优先级均为"basic"
    loadJsonStatesToObject(object, "属性", states, "基础", "basic")

    // 初始化对象的行为函数
    object["行为"] = {}
    initMovement(object, object_func)
}

/**
 * 另一个对象获得来源
 */
export function getSource(object: any, source: any): void {
    // 获取对象的"来源"属性
    let 来源: any[]

    if (haveState(object, ["属性", "来源"])) {
        来源 = stateValue(object, "来源")
    } else {
        来源 = []
    }

    // 若传入的 source 为一个数组，则将其放入对应的上述来源数组中
    if (_.isArray(source)) {
        来源.push(...source)
    } else {
        来源.push(source)
    }

    // 最终将这个来源添加给对象的属性
    object.属性["来源"] = 来源
}

/**
 * 令一个对象失去指定的来源
 * 如果在这之后，对象的来源为空，则返回 false
 */
export function loseSource(object: any, source: any): boolean {
    if (haveState(object, "来源")) {
        popFromState(object, "来源", source)
        const 来源 = stateValue(object, "来源")
        // 修复原代码 bug：来源 == [] 永远为 false，应该判断数组长度
        if (来源.length === 0) {
            return false
        } else {
            return true
        }
    } else {
        return false
    }
}

/**
 * 占据【目标对象】的空间
 */
export function occupySpace(object: any, target: any, level: number = 0): boolean {
    if (spaceEnough(object, target)) {
        // 获取 object 对象占据的空间总量
        const occupy_space = stateValue(object, "占据") * stateValue(object, "数量")
        // 向【目标对象】的"当前空间"添加对应的影响
        const impact = createImpact(object, occupy_space, level)
        impactToObject(impact, target, ["参数", "空间", "now"])
        return true
    } else {
        return false
    }
}

/**
 * 判断目标对象的剩余空间是否满足让指定的对象所占据
 */
export function spaceEnough(object: any, target: any): boolean {
    const need_space = stateValue(object, "数量") * stateValue(object, "占据")
    const free_space = stateValue(target, ["空间", "max"]) - stateValue(target, ["空间", "now"])

    // 允许进入
    if (free_space >= need_space) {
        return true
    } else {
        appendLog([target, "内部的空间不足，", object, "无法进入"])
        return false
    }
}
