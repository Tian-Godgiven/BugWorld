import { countValue, sortByLevel } from "../app/global_ability"
import { findStatePath } from "./State"

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
export function impactToObjectState(impact,object,state_path){
    if(impact){
        let the_state
        //寻找对应的属性的路径，如果路径是一个数组，则先找到第0位的属性位置
        if(_.isArray(state_path)){
            the_state = findStatePath(object,state_path[0])
            //然后依次找到数组中的属性位置
            for(let i of state_path){
                the_state = the_state[i]
            }
        }
        else{
            const the_object = findStatePath(object,state_path)
            the_state = the_object[state_path]
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

//使得【指定目标】中对应[来源]产生的[影响]消失
export function loseImapctFrom(object,state_name,source){
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
            //将其中the_state.影响数组当中来源为“source”的impact删除
            the_state.影响 = the_state.影响.filter(impact => impact.来源 !== source);
            //计算剩余属性的影响所产生的数值，并填装到属性上
            the_state.数值 = countImpact(the_state.影响)
        }
        else{
            console.log(`${object}的属性${state_name}+${state_path}不具备影响`)
        }
    }
}


//计算一个影响数组的按照优先级处理的情况下产生的属性值
export function countImpact(impacts){
    //按照优先级排列impacts数组
    impacts = sortByLevel(impacts)
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



