import { countValue } from "../app/global_ability"
import { findStatePath } from "./State"

//创建一个“影响”对象并返回，这个影响对象包含影响源，影响值，影响优先级
export function createImpact(source,value,level){
    if(value == null){
        return false
    }
    //默认优先级为0
    if(level == null){
        level = 0
    }
    return {
        来源 : source,
        数值 : value,
        优先级 : level
    }
}

//为[对象]的[属性]产生一个[影响]，并修改该属性的数值
export function impactToObjectState(impact,object,state_name,state_path){
    if(impact){
        //寻找对应的属性的路径
        const the_object = findStatePath(object,state_name)
        let the_state = the_object[state_name]
        if(state_path){
            if(_.isArray(state_path)){
                for( let i of state_path){
                    the_state = the_state[i]
                }
            }
            else{
                the_state = the_state[state_path]
            }
        }
        //要求这个state必须拥有“影响”
        if(the_state.影响 != null){
            the_state.影响.push(impact)
            //计算这个属性的影响所产生的数值，并填装到属性上
            the_state.数值 = countImpact(the_state.影响)
        }
        else{
            console.log(`${object}的属性${state_name}+${state_path}不具备影响`)
        }
    }
}

//使得[effect对象]产生的[影响]消失


//计算一个影响数组的按照优先级处理的情况下产生的属性值
export function countImpact(impacts){
    let priorityQueues = {}
    // 遍历影响数组，获取以优先级为key的字典，将相同优先级的impact放在一起
    for(let i = 0; i < impacts.length; i++){
        let impact = impacts[i];
        let priority = impact.优先级;
        // 如果优先级队列中不存在当前优先级，就创建一个空数组
        if (!priorityQueues[priority]) {
            priorityQueues[priority] = [];
        }
        priorityQueues[priority].push(impact);
    }

    // 获取所有优先级，并按优先级的大小生成优先级数组
    let priorities = Object.keys(priorityQueues)
        .sort((a, b) => {
            if (a === "basic") return -1; // "basic" 排在最前面
            if (b === "basic") return 1;
            if (a === "max") return -1;   // "max" 排在其次
            if (b === "max") return 1;
            if (!isNaN(a) && !isNaN(b)) {
                return Number(a) - Number(b); // 数字优先级按大小排序
            }
            if (a === "min") return -1;   // "min" 排在最后面
            if (b === "min") return 1;
            return 0; // 其他情况保持原顺序
        })
        .map(Number);
    // 遍历排序好的优先级数组，将其中的影响添加到排序好的影响对象数组中
    let sortedImpacts = [];
    for (let i = 0; i < priorities.length; i++) {
        let priority = priorities[i];
        sortedImpacts = sortedImpacts.concat(priorityQueues[priority]);
    }

    //属性值
    let state_value = ""
    //遍历排序好的影响数组，根据其中的值依次计算最后得到的数值大小
    for(let i = 0;i < impacts.length;i++){
        let impact = impacts[i]
        //使用impact中的数值计算对应的属性
        state_value = countValue(state_value,impact.数值)
    }

    return state_value
}



