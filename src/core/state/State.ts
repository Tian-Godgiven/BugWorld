import _ from "lodash"
import { createImpact, impactToStateObject, countImpact } from "./Impact"
import type { Impact } from "./Impact"
import { getContentBetween, newError } from "../../utils/global_ability"

/**
 * 信息片段类型
 */
export interface InfoFragment {
    type: "text" | "state" | "object" | "code"
    data: any
}

/**
 * State 类
 */
export class State {
    来源: any[]
    类型: "数值" | "字典" | "数组" | "无"
    数值?: any
    影响?: Impact[]
    字典?: Record<string, any>
    数组?: any[]
    数量?: number | "无限"
    单位?: string

    constructor(source: any, type: "数值" | "字典" | "数组" | "无", unit?: string) {
        this.来源 = [source]
        this.类型 = type
        if (unit) {
            this.单位 = unit
        }
    }
}

// 属性名称→属性类型映射表
const stateNameToTypeLib: Record<string, "数值" | "字典" | "数组"> = {
    "所属": "数组",
    "特性": "数组",
    "参数": "字典",
    "系数": "字典",
    "范围": "数组"
}

/**
 * 创建一个属性对象
 */
function createState(
    source: any,
    type: "数值" | "字典" | "数组" | "无",
    unit?: string,
    num?: number | "无限"
): State {
    const state = new State(source, type, unit)

    if (type === "数值") {
        state.数值 = null
        state.影响 = []
    } else if (type === "字典") {
        state.字典 = {}
    } else if (type === "数组") {
        state.数组 = []
        if (num != null && ((_.isNumber(num) && num >= 0) || num === "无限")) {
            state.数量 = num
        }
    }

    return state
}

/**
 * 读取一个 json_states 数据，将其中[属性-值]键值对变为一个对象的属性+影响
 * 通常用于加载对象的初始属性，也用于添加新的属性
 */
export function loadJsonStatesToObject(
    object: any,
    state_belong: string | string[],
    json_states: Record<string, any>,
    source: any,
    level?: string | number
): void {
    // 依次加载 json_states 中的数据
    for (let state_name in json_states) {
        let state_data = json_states[state_name]

        // 获取属性类型
        let state_type: "数值" | "字典" | "数组" | "无" = "数值" // 默认为"数值"类型

        // 如果 state_data 为 null，则类型为"无"
        if (state_data === null) {
            state_type = "无"
        }
        // 若数据是数组，则类型必定为"数组"
        else if (_.isArray(state_data)) {
            state_type = "数组"
        }
        // 若数据即非数组也不是字典，则类型为"数值"
        else if (!_.isObject(state_data)) {
            state_type = "数值"
        }
        // 只有在其中的数据是字典的时候，才会进行其他查询
        else {
            // 查询类型
            if (state_data["类型"] != null) {
                state_type = state_data["类型"]
            } else {
                // 查询映射表
                if (stateNameToTypeLib[state_name]) {
                    state_type = stateNameToTypeLib[state_name]
                }
                // 查询关键字顺序为数组→字典→数值
                else {
                    const temp = ["数组", "字典", "数值"].find(key => key in state_data)
                    if (temp) {
                        state_type = temp as "数值" | "字典" | "数组"
                    } else if (_.isObject(state_data)) {
                        state_type = "字典"
                    }
                }
            }
        }

        // 获取属性单位
        let state_unit = state_data?.["单位"] ?? null
        // 获取属性优先级
        let state_level = state_data?.["优先级"] ?? level
        // 获取属性数量
        let state_num = state_data?.["数量"] ?? null

        // 生成属性对象
        const state_object = createState(source, state_type, state_unit, state_num)
        // 将这个属性对象添加到 object 中
        appendStateObject(object, state_belong, state_name, state_object)

        // 处理不同类型的属性对象的内容值
        if (state_type === "数值") {
            // 获取属性数值
            let state_value = state_data?.["数值"] ?? state_data
            // 通过属性数值生成 Impact 影响对象并添加给这个属性对象
            const impact = createImpact(source, state_value, state_level)
            impactToStateObject(object, state_object, impact)
        } else if (state_type === "字典") {
            // 获取属性字典，需要先删除其中的关键字
            delete state_data["单位"]
            delete state_data["优先级"]
            let state_dic = state_data?.["字典"] ?? state_data
            // 将 state 字典中的内容加载到属性对象的[字典]中
            loadJsonStatesToObject(state_object, "字典", state_dic, source, state_level)
        } else if (state_type === "数组") {
            // 获取属性数组
            let state_array = state_data?.["数组"] ?? state_data
            // 作为属性对象的"数组"属性的值
            state_object.数组 = state_array
        }
    }
}

/**
 * 将一个指定的【属性对象State】添加到对象的指定位置中
 * 如果指定位置已经存在了一个属性对象，则会合并两者的"来源"和"影响"
 */
export function appendStateObject(
    object: any,
    state_belong: string | string[],
    state_name: string,
    state_object: State
): void {
    let the_object: any

    // 如果传入的 state_belong 是一个数组，则依次读取这样一个数组
    if (_.isArray(state_belong)) {
        // 遍历 state_belong，找到这个属性应当设置的位置
        let tmp_object = object
        for (let i = 0; i < state_belong.length; i++) {
            tmp_object = tmp_object[state_belong[i]]
        }
        the_object = tmp_object
    } else {
        the_object = object[state_belong]
    }

    // 若存在对应的 state_object 则将来源与影响合并
    if (the_object[state_name] instanceof State) {
        const old_state = the_object[state_name]
        const new_source = state_object.来源[0]
        // 要求来源不重复
        if (!_.includes(old_state.来源, new_source)) {
            old_state.来源.push(new_source)
        }
        // 合并影响
        const new_impact = state_object.影响
        // 要求原本的属性中也包含了影响
        if (old_state.影响 && new_impact) {
            old_state.影响.push(...new_impact)
        }
    } else {
        // 否则将对应的 state_object 放入该位置
        the_object[state_name] = state_object
    }
}

/**
 * 向对象的指定位置中添加一个新的属性对象
 * 对象内部若有值，则设定其优先级为"基础"
 */
export function addStateTo(
    object: any,
    source: any,
    state_path: string | string[],
    state: any
): void {
    // 获取 state_belong
    let state_belong: string | string[]

    // 如果传入了一个数组，state_belong 为 state_path 第一个元素的路径 + state_path 剩余的元素
    if (_.isArray(state_path)) {
        let belong = findStatePath(object, state_path[0])
        if (belong) {
            state_belong = [...belong, ...state_path.slice(1)]
        } else {
            throw new Error("错误的 state_path 值：" + state_path)
        }
    } else {
        const path = findStatePath(object, state_path)
        if (!path) {
            throw new Error("错误的 state_path 值：" + state_path)
        }
        state_belong = path
    }

    // 产生可读取的 json 数据
    const state_json: Record<string, any> = {}
    addStateTo_stateToJson(state, state_json)

    function addStateTo_stateToJson(state: any, state_json: Record<string, any>): void {
        // 获取属性名
        const state_name = state.属性名
        state_json[state_name] = {}

        // 获取数值或子属性
        if (state.数值 != null) {
            state_json[state_name].数值 = state.数值
        } else if (state.数组 != null) {
            state_json[state_name].数组 = state.数组
        } else if (state.字典 != null) {
            state_json[state_name].字典 = state.字典
        } else if (state.子属性 != null) {
            // 遍历子元素，并将其放置到 state_json[state_name] 中
            for (let childState of state.子属性) {
                addStateTo_stateToJson(childState, state_json[state_name])
            }
        } else {
            throw new Error('state 必须具备 "数值" 或 "子元素" 其一且不为空：' + state)
        }

        // 获取单位
        if (state.单位 != null) {
            state_json[state_name].单位 = state.单位
        }

        // 获取优先级，若未设置优先级则默认为 basic
        state_json[state_name].优先级 = state.优先级 == null ? "basic" : state.优先级
    }

    if (Object.keys(state_json).length > 0) {
        // 加载对应的 state_json 到对象当中
        loadJsonStatesToObject(object, state_belong, state_json, source)
    } else {
        newError("000", ["错误的 state 值，无法正确产生 state_json：", state])
    }
}

/**
 * 删除一个对象的指定【属性名】对应的 source
 * 若这个属性对象不再具备来源，则删除这个属性
 */
export function deleteStateFrom(
    object: any,
    source: any,
    state_path: string | string[]
): void {
    // 找到指定属性的路径和对应的值
    let state_belong = findState(object, state_path, "belong")

    // 如果传入的 state_path 是一个数组，则获取最末尾的属性名
    let state_name: string
    if (_.isArray(state_path)) {
        state_name = _.last(state_path) as string
    } else {
        state_name = state_path
    }

    // 从 state_belong 中获取目标属性对象
    let state = state_belong[state_name]
    if (!state) {
        throw new Error("没有在 object 中找到对应的 state_path 的位置：\n object:" + object + "\n state_path" + state_path)
    }

    // 如果 source 为 "all" 则直接删除这个 state 对象
    if (source === "all") {
        delete state_belong[state_name]
    } else {
        // 将这个 state 对象的"来源"中 == source 删除
        const index = state.来源.indexOf(source)
        if (index === -1) {
            throw new Error("这个 state 对象的来源中不包含指定的 source：\n state：" + state + "\n source：" + source)
        } else {
            state.来源.splice(index, 1)
            // 如果在这之后来源为空，则删除这个 state
            if (state.来源.length === 0) {
                delete state_belong[state_name]
            }
        }
    }
}

/**
 * 根据指定的对象和属性路径获取值
 * @param object 要获取值的对象
 * @param state_path 属性路径，可以是一个数组，会获取最后一位属性的值
 * @param type 类型：'stateObject' 返回属性对象；'num' 返回纯数字属性值；'symbol' 返回带符号的数字值
 * @returns 返回根据指定类型处理后的值，如果值为 null 则返回 "无"
 */
export function stateValue(object: any, state_path: string | string[], type?: 'stateObject' | 'num' | 'symbol'): any {
    if (object == undefined) {
        throw new Error('该对象不存在')
    }

    // 找到指定位置的属性对象
    let state_object = findState(object, state_path)
    if (!state_object) {
        return false
    }

    // 如果 type == "stateObject" 则将获得的 state 对象返回
    if (type === "stateObject") {
        return state_object
    }

    // 否则，返回这个 state 对象的值
    let value: any
    const state_type = state_object["类型"]

    // 如果这个 state 为数值类
    if (state_type === "数值") {
        value = state_object["数值"]
    }
    // 如果这个 state 为数组类
    else if (state_type === "数组") {
        value = state_object["数组"]
        // 如果数组类属性的数量 = 1，则返回其中唯一一个值
        if (state_object["数量"] === 1) {
            value = value[0]
        }
    }
    // 如果这个 state 为字典类
    else if (state_type === "字典") {
        value = state_object["字典"]
    }
    else if (state_type === "无") {
        value = null
    }
    else {
        console.error("属性对象的类型有误：", state_object)
        throw new Error("000错误")
    }

    // 如果 type == "symbol"，且 value 是纯数字，则返回带符号的字符串
    if (type === "symbol" && _.isNumber(value)) {
        let symbol = value > 0 ? "+" : ""
        value = symbol + value
    } else if (type === "num") {
        value = parseInt(value)
    }

    // 如果要求传回的是"信息"，则调用"获取信息"函数，将这个值加工一下
    if (state_path === "信息") {
        value = getInformation(object, value)
    }

    return value
}

/**
 * 向一个【目标对象】的【数组属性】中添加一个值
 */
export function pushToState(object: any, state_path: string | string[], value: any): boolean {
    const state_object = findState(object, state_path)

    // 如果这个属性是一个数组，则直接 push 指定的值
    if (state_object["类型"] === "数组" && _.isArray(state_object["数组"])) {
        let max_num = state_object["数量"]
        if (max_num && max_num !== "无限") {
            // 获取其中的元素数量
            const old_num = state_object["数组"].length
            const new_num = _.isArray(value) ? value.length : 1
            if (old_num + new_num > max_num) {
                console.log(state_object, old_num, value, new_num)
                return false
            }
        }
        state_object["数组"].push(value)
        return true
    } else {
        newError("000", [
            "该属性不是一个数组属性，或其[数组]属性不是一个数组！", state_object
        ])
        return false
    }
}

/**
 * 将一个【目标对象】的[数组属性]中的指定的值删除并返回
 * 如果不设定 value，则删除并返回最后一位的值
 */
export function popFromState(object: any, state_path: string | string[], value?: any): any {
    const state_object = findState(object, state_path)

    // 要求这个属性必须是一个数组
    if (state_object["类型"] === "数组" && _.isArray(state_object["数组"])) {
        const array = state_object["数组"]

        // 如果传入的 value 不为空，则找到对应的 value，删除并返回
        if (value) {
            // 如果该 value 是一个数组，则遍历进行，将返回值存储在数组中返回
            if (_.isArray(value)) {
                const return_array = []
                for (let value_i of value) {
                    return_array.push(popFromState_inner(array, value_i))
                }
                return return_array
            } else {
                return popFromState_inner(array, value)
            }
        }
        // 如果传入的 value 为空，则默认删除并返回最后一个值
        else {
            return array.pop()
        }
    } else {
        throw new Error("该属性对象不是一个数组属性，或其[数组]不是一个数组！" + state_object)
    }

    function popFromState_inner(array: any[], value: any): any {
        const index = array.indexOf(value)
        if (index !== -1) {
            return array.splice(index, 1)[0] // 删除这个值并返回删除值
        } else {
            console.log(`值 ${value} 在数组中不存在。`)
            return false // 如果值不存在，则返回 false
        }
    }
}

/**
 * 修改一个对象的数组属性的值
 */
export function changeState(object: any, state_path: string | string[], value: any): void {
    // 找到 state_path 所在的位置
    const state_object = findState(object, state_path)

    // 如果 value 不是一个数组，并且是一个属性名→值字典，依次进行该属性对象的对应名称的子属性的值的修改
    if (!_.isArray(value) && _.isObject(value) && (value as any).type !== "object") {
        // 要求此时的 state_object 是一个字典类属性
        if (state_object["类型"] === "字典") {
            for (let state_name in value) {
                let value_i = value[state_name]
                let state_object_i = state_object["字典"][state_name]
                changeState_inner(state_object_i, value_i)
            }
        } else {
            newError("000", [
                "对于此类字典 value，要求 state_path 所指向的属性对象为字典类型",
                "\nstate_path:", state_path,
                "\nstate_object:", state_object,
                "\nvalue:", value
            ])
        }
    }
    // 也允许只传入单个的属性名和值
    else {
        changeState_inner(state_object, value)
    }

    function changeState_inner(state_object: any, value: any): void {
        // 要求这个属性对象是一个数组属性
        if (state_object["类型"] === "数组") {
            // 要求 value 的数量不超过上限
            if (state_object["数量"]) {
                const value_num = _.isArray(value) ? value.length : 1
                if (value_num > state_object["数量"]) {
                    newError("000", [
                        "超过了 state_object 的数量上限：",
                        state_object,
                        value
                    ])
                }
            }
            // 若传入值是单个值
            if (!_.isArray(value)) {
                value = [value]
            }
            // 修改该属性的值
            state_object["数组"] = value
        } else {
            newError("000", [
                "只允许修改对象的指定位置的数组属性的值",
                object,
                state_path,
                state_object
            ])
        }
    }
}

/**
 * 返回对象是否具有某个属性
 */
export function haveState(object: any, state_path: string | string[]): boolean {
    // 如果 state_path 是一个数组，则先找到第一个值所在位置
    if (_.isArray(state_path)) {
        // 获得第一个属性名所在的路径
        let path = findStatePath(object, state_path[0])
        // 如果没有找到路径的话直接返回 false
        if (!path) {
            return false
        }
        // 顺着加入其他属性名
        for (let i = 1; i < state_path.length; i++) {
            path.push(state_path[i])
        }
        // 遍历这个路径，并尝试在对象中寻找对应的属性
        let the_object: any = object
        for (let key of path) {
            if (the_object instanceof State) {
                the_object = the_object["字典"][key]
            } else {
                the_object = the_object[key]
            }
            // 只要过程中存在任意一个中间值为空，则不存在该路径下的对应的属性，返回 false
            if (!the_object) {
                return false
            }
        }
        // 如果过程中没有返回 false，并且最终得到的是一个属性对象，则说明找到了，返回 true
        if (the_object instanceof State) {
            return true
        } else {
            return false
        }
    } else {
        // 先找到对应属性的位置数组
        let path = findStatePath(object, state_path)
        // 如果找得到对应的路径，则说明存在该属性
        if (path) {
            return true
        } else {
            return false
        }
    }
}

/**
 * 获取一个对象的指定属性的单位
 */
export function getStateUnit(object: any, state_path: string | string[]): string {
    // 找到这个属性中的单位
    if (!object) {
        newError("000", ['该对象不存在：', object])
    }

    // 找到指定属性对象
    const state_object = findState(object, state_path)
    // 要求对应的属性对象不为空，并且不是一个 object
    if (!state_object || (state_object as any).type === "object") {
        return ""
    }

    // 获取这个属性的单位
    let unit = state_object["单位"]
    // 如果这个属性内部没有定义单位，则从通用单位中寻找
    if (!unit) {
        const units = object["单位"]
        if (units && !_.isArray(state_path)) {
            unit = units[state_path]
        }
    }

    // 如果最后都没有找到对应的单位，返回一个空字符串
    if (unit) {
        return unit
    } else {
        return ""
    }
}

/**
 * 返回对象的指定属性对象
 * 如果传入一个数组，则会顺着数组找到最后一位属性对象
 */
export function findState(object: any, state_path: string | string[], type?: "belong"): any {
    let path: string[] | false

    // 允许传入一个数组作为 state_name
    if (_.isArray(state_path)) {
        // 获得第一个属性名所在的位置数组
        path = findStatePath(object, state_path[0])
        if (path) {
            // 然后顺着加入其他属性的位置数组
            for (let i = 1; i < state_path.length; i++) {
                path.push(state_path[i])
            }
        }
    } else {
        // 先找到对应属性的位置数组
        path = findStatePath(object, state_path)
    }

    // 只要 path 不为空，就使用这个 path 数组找到对应属性对象所在的对象
    if (path) {
        let the_object: any = object
        // 如果需求的是属性对象所属的位置，也就是属性对象所在的对象
        if (type === "belong") {
            // 弹出最后一个属性位置，因为返回的对象是属性所在的对象
            path.pop()
        }
        // 遍历剩余的 path 数组，获得 the_object
        for (let key of path) {
            if (the_object instanceof State) {
                the_object = the_object["字典"][key]
            } else {
                the_object = the_object[key]
            }
            // 如果 the_object 出现异常则报错
            if (!the_object) {
                newError("000", [
                    "指定路径有误，无法沿该路径寻找属性，请确认该路径是否在对象中有效：",
                    "\n对象：", object,
                    "\n路径：", state_path
                ])
            }
        }
        // 遍历到最后即是需要返回的对象
        return the_object
    }
    // 没有找到 path 时，说明对应的属性并不存在
    else {
        console.error(`未在`, object, `中找到对应的属性：${state_path}`)
        throw new Error("000")
    }
}

/**
 * 通过递归获得找到属性的路径，若没有找到则返回 false
 */
export function findStatePath(object: any, state_name: string): string[] | false {
    // 我们要求从一个实体对象的[属性]开始寻找
    let the_object = object
    if (object.type === "object") {
        the_object = object.属性
    }
    const path = ["属性"]
    const tmp = findStatePath_inner(the_object, state_name, path)
    // 如果没有对应的属性名存在，则会返回 false
    if (!tmp) {
        return false
    } else {
        return tmp
    }

    function findStatePath_inner(the_object: any, state_name: string, path: string[]): string[] | false {
        // 遍历对象属性中的各个属性对象
        for (let key in the_object) {
            // 找到了等于 state_name 的 key 时，返回包含了 state_name 的路径
            if (key === state_name) {
                return path.concat(key)
            }
            // 否则，若 key 的属性是一个字典，且不是一个 object
            else {
                // 否则向 key 对应的属性对象内部递归，要求这个属性对象是字典类型
                const state_object = the_object[key]
                if (state_object instanceof State && state_object["类型"] === "字典") {
                    // 则在其中的[字典]中尝试寻找 state_name
                    const result = findStatePath_inner(state_object["字典"], state_name, path.concat(key))
                    // 如果返回值不为空，则将这个 path 递归返回
                    if (result) {
                        return result
                    }
                }
            }
        }
        return false
    }
}

/**
 * 获取一个对象内部的"信息"，或者传入一个"信息"，将对象的属性传递给其中的变量
 * 返回信息片段数组，用于在 Vue 组件中渲染
 */
export function getInformation(object: any, info?: string): InfoFragment[] | any {
    // 传入一个信息的情况
    if (info) {
        const info_array: InfoFragment[] = []

        // 遍历这个字符串
        for (let i = 0; i < info.length; i++) {
            // 优先匹配 ￥{...}
            if (info[i] === "￥" && info[i + 1] === "{" && info.indexOf("}", i + 2) !== -1) {
                // 获取其中的内容和最后的位置
                const { content, endIndex } = getContentBetween(info, i + 1, "{", "}")
                // 将其中的 ${...} 替换为对应的属性值
                const regex = /\${([^}]*)}/g
                const code = content.replace(regex, (match, key) => {
                    return getDolValue(object, key) // 调用函数获取替换值，并返回给 replace 方法
                })

                // 获取 ￥{} 中的值的执行结果，填装到 info_array 中
                const value = getYenValue(code)
                pushToInfoArray(value, "code")
                // 将 i 移动到 ￥{} 的末尾
                i = endIndex
            }
            // 次优先匹配 ${}
            else if (info[i] === "$" && info[i + 1] === "{" && info.indexOf("}", i + 2) !== -1) {
                // 获取其中的值和最后的位置
                const { content, endIndex } = getContentBetween(info, i + 1, "{", "}")
                // 获取对应的属性值
                const value = getDolValue(object, content)
                // 如果这个值是一个数组，则依次处理其中的数据
                if (_.isArray(value)) {
                    for (let value_i of value) {
                        pushDolValueType(value_i)
                    }
                } else {
                    pushDolValueType(value)
                }

                function pushDolValueType(value: any): void {
                    let value_type: "text" | "state" | "object" | "code"
                    // 如果这个值是一个对象，则标记为 object 类型
                    if (value?.type === "object") {
                        value_type = "object"
                    } else {
                        value_type = "state"
                    }
                    pushToInfoArray(value, value_type)
                }

                // 将 i 移动到 ${} 的末尾
                i = endIndex
            }
            // 如果都不是，则视作字符串，将其添加到数组最末尾类型为 text 中，若不为 text 则创建
            else {
                // 获得数组最末尾
                const arrayLast = info_array[info_array.length - 1]
                if (arrayLast && arrayLast.type === "text") {
                    arrayLast.data += info[i]
                } else {
                    pushToInfoArray(info[i], "text")
                }
            }
        }

        // 返回信息片段数组
        return info_array

        function pushToInfoArray(data: any, type: "text" | "state" | "object" | "code"): void {
            const info_data: InfoFragment = {
                data: data,
                type: type
            }
            info_array.push(info_data)
        }
    }
    // 没有指定 info 的情况
    else {
        return stateValue(object, "信息")
    }
}

/**
 * 执行 ￥{} 中的代码
 */
function getYenValue(code: string): any {
    let result = new Function('return ' + code)()
    return result
}

/**
 * 获取 ${} 中的属性值
 */
function getDolValue(object: any, key: string): any {
    // 获得 ${属性名} 对应的属性值存储进数组中
    const state_path = key.trim()
    let value = stateValue(object, state_path)
    return value
}
