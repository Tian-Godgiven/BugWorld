import { countValue, newError, sortByLevel } from "../app/global_ability"
import { findState } from "./State"

//创建一个“影响”对象并返回，这个影响对象包含影响源，影响值，影响优先级
export function createImpact(source,value,level=0){
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

//为[对象]的指定[属性]产生一个[影响]，并修改该属性的数值
export function impactToObject(impact,object,state_path){
    if(impact){
        //找到指定的属性对象
        let state_object = findState(object,state_path)
        if(state_object){
            //对其造成影响
            impactToStateObject(object,state_object,impact)
        }
        else{
            newError("000",[
                "指定的位置属性对象不存在：",object,state_path
            ])
        }
        
    }
}
//向属性对象造成影响
export function impactToStateObject(object,state_object,impact){
    //要求这个state必须拥有“影响”
    if(state_object.影响 != null){
        state_object.影响.push(impact)
        //计算这个属性的影响所产生的数值，并填装到属性上
        state_object.数值 = countImpact(state_object.影响)
    }
    else{
        console.log(`${object}的属性${state_name}+${state_path}不具备影响`)
    }
}

//使得【指定目标】中对应[来源]产生的[影响]消失
export function loseImapctFrom(object,state_path,source){
    if(impact){
        //寻找对应的属性的路径
        let state_object = findState(object,state_path)
        //要求这个属性对象必须拥有“影响”
        if(state_object.影响 != null){
            //将其中the_state.影响数组当中来源为“source”的impact删除
            state_object.影响 = state_object.影响.filter(impact => impact.来源 !== source);
            //计算剩余属性的影响所产生的数值，并填装到属性上
            state_object.数值 = countImpact(state_object.影响)
        }
        else{
            console.log(`${object}的属性${state_path}+${state_path}不具备影响`)
        }
    }
}


//计算一个影响数组的按照优先级处理的情况下产生的属性值
export function countImpact(impacts){
    //按照优先级排列impacts数组
    const array = []
    for(let i = 0 ; i < impacts.length;i++){
        const impact = impacts[i]
        array.push({对象:impact,优先级:impact.优先级})
    }
    const sorted_impacts = sortByLevel(array)
    //属性值
    let state_value = ""
    //遍历排序好的影响数组，根据其中的值依次计算最后得到的数值大小
    for(let i = 0;i < sorted_impacts.length;i++){
        let the_impact = sorted_impacts[i]
        //使用impact中的数值计算对应的属性
        state_value = countValue(state_value,the_impact.数值)
    }

    return state_value
}



