// 状态对象

import { popFromState, pushToState } from "./State";

//添加一个状态对象到object的[属性→状态]中
export function addStatusToObject(status,object){
    pushToState(object,"状态",status)
}
//从对象的[属性→状态]中去除一个状态对象
export function deleteStatusFromObject(status,object){
    popFromState(object,"状态",status)
}
