//对象通用的函数

import { loadStatesToObject } from "../State/State";
import { expandJsObject } from "../app/global_ability";
import { findStatePath } from "../State/State";

//初始化一个对象，加载对应的json属性值至该对象中
export function initObject(object,json,more_states){
    //将额外属性扩充到json当中
    let states = _.cloneDeep(json)
    if(more_states){
        states = expandJsObject(states,more_states)
    }
    // 将属性加载到对象当中
	loadStatesToObject(object,"属性",states,"基础","basic")
    // 添加type标识
    object["type"] = "object"
}

