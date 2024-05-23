import { runObjectFunction } from "../app/global_ability"
import { impactToObjectState } from "./Impact"

//创建一个初步的effect对象
export function createEffect(entry,level,action){
    if(!_.isArray(entry)){
        let entry = [entry]
    }
    return {
        词条 : entry,
        优先级 : level,
        函数 : action,
    }
}

//传入一个效果对象的【行为】与【来源】，将其作用于【目标】
export function getEffectFrom(target,effect,effect_para,source){
    //先完成这个效果对象
    effect.参数 = effect_para
    effect.来源 = source
    effect.目标 = target
    //将这个效果对象放进target对象的“效果”中
    if(target.效果 == null){
        target.效果 = [effect]
    }
    else{
        target.效果.push(effect)
    }
}

//使得对象失去一个指定来源的效果，并使得这些效果对象失效
export function loseEffectFrom(target,source){
    if(!target.效果){
        console.log("目标对象内部不存在任何效果")
        return false
    }
    //遍历对象受到的所有效果，使得其中来源==source的效果被失去
    for(let effect of target.效果){
        if(effect.来源 == source){
            loseEffect(effect)
        }
    }
}

//使得对象失去一个指定的效果,并使得这个效果对象失效
export function loseEffect(effect){
    const target = effect.目标
    if(target && target.效果){ 
        // 使得这个效果对象失效
        stopEffect(effect)
        // 过滤掉特定的效果对象
        const newEffects = target.效果.filter(item => item !== effect);
        // 将过滤后的结果重新赋值给效果属性 
        target.效果 = newEffects; 
    }
}

//使得一个效果对象起效
export function runEffect(effect){
    const target = effect.目标
    const source = effect.来源
    const para = effect.参数
    runObjectFunction(effect,"生效",[target,para,source])
}

//使得一个效果对象失效
export function stopEffect(effect){
    const target = effect.目标
    const source = effect.来源
    const para = effect.参数
    runObjectFunction(effect,"失效",[target,para,source])
}


