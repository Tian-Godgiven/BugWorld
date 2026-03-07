import _ from "lodash"
import { stateValue, loadJsonStatesToObject, haveState, popFromState } from "../state/State"
import { expandJsObject } from "../../utils/global_ability"
import { initMovement } from "../state/Movement"
import { MovementContainer } from "../state/Movement"
import { createImpact, impactToObject } from "../state/Impact"
import { appendLog } from "../../utils/log"

/**
 * 游戏实体对象基础接口
 */
export type GameObject = {
    type: "object"
    key: string
    属性: any
    行为: Record<string, any>
}

// 运行时占位符，确保模块导出不为空
export const GameObjectType = "GameObject" as const

/**
 * GOD 对象 - 系统初始化对象
 * 用于作为系统创建对象的来源，包括：
 * 1. 游戏初始化时创建的第一批对象（初始虫巢、初始地区等）
 * 2. 测试/试用对象
 * 3. 系统随机事件
 */
export const GOD = {
    type: "system" as const,
    key: "GOD",
    属性: {
        名称: "系统"
    }
}

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
    // 为对象添加创建者（必须在属性加载之前，否则会被转换为 State）
    addCreator(object, source)

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
    object["行为"] = new MovementContainer()
    initMovement(object, object_func)
}

/**
 * 令一个对象失去指定的来源
 * 如果在这之后，对象的来源为空，则返回 false
 * 注意：此函数主要用于 Characteristic 等动态内容，一般对象请使用 removeDependency
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
 * 为对象添加创建者
 * 创建者消失不影响对象的存在（如虫巢由工作创建，工作消失虫巢仍存在）
 */
export function addCreator(object: any, creator: any): void {
    if (!object.属性.创建者) {
        object.属性.创建者 = []
    }
    if (_.isArray(creator)) {
        object.属性.创建者.push(...creator)
    } else {
        object.属性.创建者.push(creator)
    }
}

/**
 * 为对象添加依赖来源
 * 依赖来源消失则对象也应消失（如工作依赖设施，设施消失工作也消失）
 * 返回：依赖来源移除后是否还有剩余依赖
 */
export function addDependency(object: any, dependency: any): void {
    if (!object.属性.依赖来源) {
        object.属性.依赖来源 = []
    }
    if (_.isArray(dependency)) {
        object.属性.依赖来源.push(...dependency)
    } else {
        object.属性.依赖来源.push(dependency)
    }
}

/**
 * 移除对象的依赖来源
 * 如果依赖来源为空，返回 false（表示对象应该被删除）
 */
export function removeDependency(object: any, dependency: any): boolean {
    if (!object.属性.依赖来源) return false
    const index = object.属性.依赖来源.indexOf(dependency)
    if (index !== -1) {
        object.属性.依赖来源.splice(index, 1)
    }
    return object.属性.依赖来源.length > 0
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
