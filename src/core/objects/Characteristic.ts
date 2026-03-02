import { runObjectMovement } from "../state/Movement"
import { stateValue, popFromState, pushToState, changeState } from "../state/State"
import Chara_lib from "../../library/Charactereistic/Characteristic_lib.json"
import _ from "lodash"
import { initObject, loseSource } from "./Object"

/**
 * 特性对象类
 */
class Characteristic {
    type: string
    key: string
    属性: {
        名称: string | null
        参数: Record<string, any>
        词条: any[]
        优先级: string | number | null
        信息: string | null
        所属: any[]
        来源: any[]
    }
    行为: Record<string, any>

    constructor() {
        this.type = "object"
        this.key = ""
        this.属性 = {
            名称: null,
            参数: {},
            词条: [],
            优先级: null,
            信息: null,
            所属: [],
            来源: []
        }
        this.行为 = {}
    }
}

/**
 * 创建一个特性对象
 * 使用动态导入加载函数库，避免循环依赖
 */
export async function createCharacteristic(chara_key: string, source: any): Promise<Characteristic> {
    const chara = new Characteristic()
    const chara_state = Chara_lib[chara_key as keyof typeof Chara_lib]

    // 动态导入函数库，打破循环依赖
    const Chara_func_lib = await import("../../library/Charactereistic/Characteristic_func_lib")
    const chara_func = (Chara_func_lib as any)[chara_key]

    // 初始化
    initObject(chara, chara_key, source, chara_state, chara_func)

    return chara
}

/**
 * 在对象初始化时，为其绑定属性中指定的特性对象
 */
export async function bindObjectCharacteristic(object: any, source: any): Promise<void> {
    // 这里需要将原本填装着chara_key的属性清空，再装入【特性对象】
    // 因此需要先将这个"特性"属性深复制下来，再遍历
    const 特性 = _.cloneDeep(stateValue(object, "特性"))
    changeState(object, "特性", [])
    // 遍历其"特性"属性,为其添加对应的特性对象
    for (let chara_key of 特性) {
        // 创建特性对象
        let chara = await createCharacteristic(chara_key, source)
        // 使得对象获得特性对象
        getCharacteristic(object, chara)
    }
}

/**
 * 令一个对象获得指定chara_key的特性对象,并触发其"获得"行为
 */
export function getCharacteristic(object: any, chara: Characteristic): void {
    // 修改【特性对象】的"所属"
    changeState(chara, "所属", object)
    // 将特性对象加入指定对象的"特性"属性当中
    pushToState(object, "特性", chara)
    // 触发【特性对象】的获得行为
    runCharaFunction(chara, "获得")
}

/**
 * 触发特性对象的"失去"行为，并使得指定对象失去该的特性
 */
export function loseCharacteristic(object: any, chara: Characteristic, source: any): void {
    // 触发其"失去"行为
    runCharaFunction(chara, "失去")
    // 令对象中对应的特性对象失去对应的"source"，如果来源为空，则返回false
    if (!loseSource(chara, source)) {
        // 来源为空时，删除对象中的特性对象
        popFromState(object, "特性", chara)
    }
}

/**
 * 触发一个特性的指定函数
 */
export function runCharaFunction(chara: Characteristic, func_key: string): any {
    // 触发指定的函数
    const chara_belong = stateValue(chara, "所属")
    return runObjectMovement(chara, func_key, chara_belong)
}
