import Event_lib from "../library/Event/Event_lib.json"
import * as Event_func_lib from "../library/Event/Event_func_lib.js"
import { runObjectMovement } from "../State/Movement"
import { changeState, stateValue } from "../State/State"
import { initObject } from "./Object"
import { appendEventTileDiv } from "../Tiles/event_tile/eventTile.js"
import { random } from "lodash"
import { createImpact, impactToObject } from "../State/Impact.js"
import { hiddenValue, setHidden } from "../State/Hidden.js"

const 初始事件信息 = {
    发生事件min : 0,
    发生事件max : 100,
    好事max : 5,
    坏事max : 5,
    强度min : 0,
    强度max : 10,
    概率边界add : 10,
    倾向边界add : 1,
}
let Event_tendency_lib = {}
//初始化事件倾向lib
function initEventTendencyLib(){
    for(let key in Event_lib){
        const event_json = Event_lib[key]
        const 倾向值 = event_json.属性.倾向
        if(Event_tendency_lib[倾向值]){
            Event_tendency_lib[倾向值].push(key)
        }
        else{
            Event_tendency_lib[倾向值] = [key]
        }
    }
}
initEventTendencyLib()

class Event{
    constructor(){
        this.属性 = {
            名称:null,
            强度:null,
            持续:null,
            效果:null,
            词条:[],
            信息:null,
            范围:[]
        }
        this.功能 = {
            预告:false,
            存留:false,
            强度:false,
            操作:false
        }
        this.隐藏 = {
            进行中 : false
        }
        this.单位 = {
            持续:"回合",
            预告:"回合"
        }
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
    const func = _.cloneDeep(Event_func_lib[key])
    //如果事件对象的[功能→强度]为true，则其拥有一个强度=0的初始值
    const more_state = {}
    if(json.功能 && json.功能.强度 == true){
        more_state["强度"] = 0 
    }

    //初始化对象
	initObject(event,key,source,json.属性,func,more_state)
    //初始化功能属性
    Object.assign(event.功能,json.功能)
    return event
}

//随机发生一个事件
export function happenEvent(bugNest,source){
    //判定是否会发生事件
    const area = stateValue(bugNest,"所处")
    const 繁荣 = stateValue(area,"繁荣","num")

    const 事件信息 = hiddenValue(bugNest,["事件信息"])
    
    const random_num = random(初始事件信息.发生事件min,初始事件信息.发生事件max+繁荣)
    // 如果随机值大于bugNest[功能→事件信息→概率]则发生一个事件
    if(random_num > 事件信息.概率边界){
        //发生一个事件，随机生成该事件的倾向
        let 倾向 = 0;
        const 好事 = stateValue(area,"平和","num") + 初始事件信息.好事max
        const 坏事 = stateValue(area,"威胁","num") + 初始事件信息.坏事max
        //这个倾向不能为0
        while (倾向 === 0) {
            倾向 = random(-坏事,好事)
        }
        //判断其是一个好事或坏事,并获取事件强度
        let 强度 = 0
        //是好事
        if(倾向 >= 事件信息.倾向边界){
            //生成好事的强度
            强度 = random(
                初始事件信息.强度min+stateValue(area,"收益","num"),
                初始事件信息.强度max+stateValue(area,"收益","num")
            )
        }
        //否则是坏事
        else{
            强度 = random(
                初始事件信息.强度min+stateValue(area,"险恶","num"),
                初始事件信息.强度max+stateValue(area,"险恶","num")
            )
        }

        // 从事件库中获取对应倾向的事件
        倾向 = -4//注意测试：记得删除本行！
        const events =  _.cloneDeep(Event_tendency_lib[倾向])
        let event = null;
        let tmp = false
        while (events && events.length > 0 && !tmp) {
            // 随机选择一个事件
            const random_index = random(0, events.length - 1);
            const event_key = events[random_index];
            event = createEvent(event_key, source);
            // 尝试开始事件，如果成功则处理bugNest的事件信息，并返回true
            if (startEvent(event, bugNest, source, 强度)) {
                console.log("123")
                //因为成功开始了一个事件，令概率边界变大→下一次更难发生事件
                事件信息.概率边界 += 初始事件信息.概率边界add
                //若该事件为好事，则概率边界增大→下一次更容易发生坏事
                if(倾向 >= 事件信息.倾向边界){
                    事件信息.倾向边界 += 初始事件信息.倾向边界add
                }
                //否则该事件为坏事，概率边界减小→下一次更容易发生好事
                else{
                    事件信息.倾向边界 -= 初始事件信息.倾向边界add
                }

                console.log(事件信息.概率边界,bugNest)
                
                return true
            } 
            //否则从临时事件库中移除已尝试的事件，并重新选择
            else {
                events.splice(random_index, 1);
            }
        }

        // 如果事件库为空仍未成功，则返回false
        return false;
    }
    else{
        //不发生一个事件
        return false
    }
}

//使得一个事件对象开始进行
export function startEvent(event,bugNest,source,eventStrength=0){
    //判断是否满足该事件对象的开始条件
    if(runObjectMovement(event,"开始需求",bugNest)){
        //记录在虫巢[进行中→事件]，并修改事件的作用范围
        const 进行中事件 = hiddenValue(bugNest,["进行中","事件"])
        进行中事件.push(event)
        changeState(event,"范围",bugNest)
        //修改事件为正在进行
        setHidden(event,"进行中",true)
        //若事件对象会受事件强度影响，则添加[属性→强度]影响，这个影响的优先级为0
        if(event.功能.强度 != false){
            const impact = createImpact(source,eventStrength,0)
            impactToObject(impact,event,"强度")
        }

        //触发事件的“开始”行为
        runObjectMovement(event,"开始",[bugNest,eventStrength])
        
        //向事件Tile添加该事件的信息div
        appendEventTileDiv(event)

        return true
    }
    //否则返回false
    else{
        return false
    }
}

//使得一个事件对象停止
export function stopEvent(event,bugNest){
    
}