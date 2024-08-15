import { stateValue, loadJsonStatesToObject, haveState, popFromState } from "../State/State";
import { expandJsObject } from "../app/global_ability";
import { initMovement } from "../State/Movement"
import { createImpact, impactToObject } from "../State/Impact";
import { appendLog } from "../Tiles/logTile";

//初始化一个对象，加载对应的json属性值至该对象中
export function initObject(object,object_key,source,object_json,object_func,more_states){
    // 令对象获得“来源”
    getSource(object,source)
    //拷贝object的初始属性，读取object_json和more_states的数据，用以拓充object的属性
    let states = _.cloneDeep(object.属性)
    states = expandJsObject(states,object_json)
    if(more_states){
        states = expandJsObject(states,more_states)
    }
    // 添加type标识
    object["type"] = "object"
    // 添加key表示
    object["key"] = object_key
    
    // 将属性加载到对象当中,这些属性都是“基础”属性，优先级均为“basic”
	loadJsonStatesToObject(object,"属性",states,"基础","basic")
    // 初始化对象的行为函数
    object["行为"] = {}
    initMovement(object,object_func)
}

//另一个对象获得来源
export function getSource(object,source){
    // 获取对象的“来源”属性
    let 来源
    if(haveState(object,["属性","来源"])){
        来源 = stateValue(object,"来源")
    }
    else{
        来源 = []
    }

    // 若传入的source为一个数组，则将其放入对应的上述来源数组中
    if(_.isArray(source)){
        来源.push(...source)
    }
    else{
        来源.push(source)
    }

    //最终将这个来源添加给对象的属性
    object.属性["来源"] = 来源
}
//令一个对象失去指定的来源，如果在这之后，对象的来源为空，则返回false
export function loseSource(object,source){
    if(haveState(object,"来源")){
        popFromState(object,"来源",source)
        const 来源 = stateValue(object,"来源")
        if(来源 == []){
            return false
        }
        else{
            return true
        }
    }
    else{
        return false
    }
}


//占据【目标对象】的空间
export function occupySpace(object, target, level = 0) {
    if(spaceEnough(object,target)){
        //获取object对象占据的空间总量
        const occupy_space = stateValue(object, "占据") * stateValue(object, "数量")
        //向【目标对象】的“当前空间”添加对应的影响
        const impact = createImpact(object, occupy_space, level)
        impactToObject(impact, target, ["参数", "空间", "now"])
        return true
    }
    else{
        return false
    }
    
}

//判断目标对象的剩余空间是否满足让指定的对象所占据
export function spaceEnough(object, target) {
	const need_space = stateValue(object, "数量") * stateValue(object, "占据");
	const free_space = stateValue(target, ["空间", "max"]) - stateValue(target, ["空间", "now"]);
	//允许进入
	if (free_space >= need_space) {
		return true;
	}
	else {
        appendLog([target,"内部的空间不足,",object,"无法进入"])
		return false;
	}
}

