import Event_lib from "../library/Event/Event_lib.json"
import Event_func_lib from "../library/Event/Event_func_lib"
import { runObjectMovement } from "../State/Movement"
import { changeState } from "../State/State"
import { initObject } from "./Object"

class Event{
    constructor(){
        this.属性 = {
            名称:null,
            持续:null,
            效果:null,
            词条:[],
            信息:null,
            范围:null
        }
        this.功能 = {
            预告:false,
            存留:false,
        }
        this.进行中 = false
    }
}
//创建一个事件对象
export function createEvent(key,source){
    const event = new Event()
    //通过evnet_key获取到对应的事件数据
    const json = Event_lib[key]
    if(!json){
		console.log("不存在指定的event_key："+key)
		return false
	}
    const func = Event_lib[key]
    //初始化对象
	initObject(event,key,source,json.属性,func)
    return event
}

//使得一个事件对象开始进行
export function startEvent(event,bugNest){
    //判断是否满足该事件对象的开始条件
    if(runObjectMovement(event,"开始需求",bugNest)){
        //使得这个事件开始进行，记录在虫巢[进行中→事件]
        bugNest.进行中.事件.push(event)
        changeState(event,"范围",bugNest)
        event.进行中 = true
        //触发事件的“开始”行为
        runObjectMovement(event,"开始",bugNest)
        //
        //添加一个事件Tile的div
	    appendWorkTileDiv(work)
    }
}
