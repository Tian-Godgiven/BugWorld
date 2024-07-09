import _ from "lodash";
import { countValue, sortByLevel } from "../app/global_ability";

//将一个js对象转换为一个行为效果并返回，要求传入一个object作为默认的来源
function jsToMovementEffect(source,move_data){
    //提取其中的一些值，如果没有则取默认值
    const move_effect = { 
        词条: [], 
        优先级: 0, 
        来源: source, 
        效果: null
    }
    //如果传入data直接就是一个函数，则默认其中的内容为该行为效果对象的“效果”
    if(_.isFunction(move_data)){
        move_effect.效果 = move_data
    }
    else{
        Object.assign(move_effect,move_data)
    }

    return move_effect
}

//初始化func_lib中的内容为行为对象并绑定到指定对象上
export function initMovement(object,func_lib,move_belong=[]){
    //初始化过程中，对象的行为来源于对象自身
    const move_source = object
    //遍历func_lib，将其中的行为对象添加到对象中
    for(let move_key in func_lib){
        // 初始化这个行为对象的键值对，并获得func_lib中对应的对象
        const move_data = func_lib[move_key]
        addMovement(object,move_key,move_data,move_source,move_belong)
    }
}


//向对象的[行为]中添加一个新的行为对象
export function addMovement(object, move_key, move_data, move_source, move_belong=[]){
    //到达move_key应该在的位置
    let 行为位置 = object.行为
    for(let key of move_belong){
        行为位置 = 行为位置[key]
    }

    //没有找到move_belong指名的位置，则报错
    if(!行为位置){
        console.log(object)
        throw new Error("没有在该对象的[行为]中找到move_belong指名的位置："+move_belong+move_key)
    }

    //在move_key位置创建空位
    行为位置[move_key] = {}

    //判断move_data中是否有对触发时间的标注
    if(_.has(move_data,"之前")||_.has(move_data,"当时")||_.has(move_data,"之后")){
        for(let move_time in move_data){
            //然后再用其中的内容生成effect对象
            const effect = jsToMovementEffect(move_source,move_data[move_time])
            //将其填入对象的“行为”当中
            行为位置[move_key][move_time] = [effect]
        }
    }
    //判断move_data是否为一个函数，如果是则默认其为这个move_name的[当时]的行为效果对象的[效果]  
    else if(_.isFunction(move_data)){
        const effect = jsToMovementEffect(move_source,move_data)
        行为位置[move_key]["当时"] = [effect]
    }
    //否则，如果其是一个字典，则认为其是一个行为对象字典
    else if(_.isObject(move_data)){
        //将当前的move_key放入move_belong中
        move_belong.push(move_key) 
        //遍历字典中的内容，递归调用本函数
        for(let new_move_key in move_data){
            const new_move_data = move_data[new_move_key]
            addMovement(object,new_move_key,new_move_data,move_source,move_belong)
        }
    }
    //如果都不是，就报错
    else{
        throw new Error("对应的内容类型不正确，要么是字典，要么是函数！")
    }
}

//向对象的已存在的行为对象中，增添一个行为效果
export function addMovementEffect(object, move_key, move_effect, move_source, move_time = "当时", type) {
	//找到对应的行为对象
    let 行为对象 = getMovementInObject(object,move_key)

    //如果这个行为对象尚未存在
    if (行为对象 == false) {
        // 并且指明type为“new”，则使用上述数据创建对应的行为
        if(type == "new"){
            const move_belong = []
            if(_.isArray(move_key)){
                move_belong = move_key
                move_key = move_belong.pop()
            }
            const move_data = {}
            move_data[move_time] = move_effect
            addMovement(object,move_key,move_data,move_source,move_belong)
            return true
        }
        //否则报错！不应该允许这种情况存在！
        else{
            throw new Error("先创建对应move_key的行为对象，或是设置type为“new”,move_key："+move_key)
        }
    }

    //将数据转换为move_effect对象
    move_effect = jsToMovementEffect(move_source,move_effect)
    //将其放入对应的行为的指定move_time中，未指定move_time的情况下，默认为“当时”
    if(_.has(行为对象,move_time)){
        行为对象[move_time].push(move_effect)
    }
    else{
        行为对象[move_time] = [move_effect]
    }
}

//从对象已存在的行为中删除一个指定来源的效果
export function deleteMovementEffect(object, source, move_key, move_time){
    //寻找到move_key指名的行为对象
    let 行为对象 = getMovementInObject(object,move_key)
    //找到行为对象后，遍历其中的
    if(行为对象){
        //如果指名了时间标识
        if(move_time){
            //如果时间标识是一个数组
            if(_.isArray(move_time)){
                for(let i of move_time){
                    deleteMovementEffect_inner(行为对象[i], source)
                }
            }
            else{
                deleteMovementEffect_inner(行为对象[move_time], source)
            }
        }
        //否则遍历所有时间标识
        for(let move_time in 行为对象){
            deleteMovementEffect_inner(行为对象[move_time], source)
        }
    }
	//如果这个行为尚未存在，则返回false
	else {
        console.log(`指定的行为${move_name}在对象中尚不存在！`)
		return false
	}

    // 遍历行为效果数组，删除其中来源为source的行为效果
    function deleteMovementEffect_inner(effectsArray, source) {
        for (let i = effectsArray.length - 1; i >= 0; i--) {
            if (effectsArray[i].来源 === source) {
                effectsArray.splice(i, 1);
            }
        }
    }
}

//执行一个对象对应的行为，若没有相应的行为对象，则返回true
export function runObjectMovement(object, move_key, paras) {
    const 行为对象 = getMovementInObject(object,move_key)
	//如果有这个行为对象，则执行其效果
	if (行为对象) {
		//判断其时点
        const array = ['之前', '当时', '之后']
        //存储返回值，到最后再依次计算
        let return_value = []
        //依次执行“之前，当时，之后“
        array.forEach(phase => {
            //若存在，则按照顺序依次执行其中的effect
            if (行为对象[phase]) {
                //获取相应的执行结果,放入数组中
                const temp = runMovementEffect(object, 行为对象[phase], paras)
                if(temp){
                    return_value.push(...temp)
                }
            }
        });
        //计算三个阶段获得的最终执行结果，并返回
        if(return_value.length>=1){
            let base
            for(let i of return_value){
                base = countValue(base,i)
            }
            return base
        }
    }
    //若不存在对应的行为，默认返回true
	else{
		return true
	}

    function runMovementEffect(object,movement_effects,paras){
        // 按照优先级排列effects中的效果对象
        const array = []
        for(let i = 0 ; i < movement_effects.length;i++){
            const effect = movement_effects[i]
            array.push({对象:effect,优先级:effect.优先级})
        }
        // ,然后遍历其中的效果对象，依次执行其中的“生效”函数
        const sorted_effects = sortByLevel(array)
        //将所有“effect”的返回值保存起来
        let return_value = []
        for(let i = 0 ; i < sorted_effects.length; i++){
            //获得对应的效果函数
            const movement_effect = sorted_effects[i]
            const func = movement_effect.效果
            let value
            //如果传入paras是一个数组，则解析后执行
            if(_.isArray(paras)){
                value = func(object,...paras)
            }
            else{
                value = func(object,paras)
            }
            //如果返回了一个值，则将这个值存储起来
            if(value){
                return_value.push(value)
            }
        }
        return return_value
    }
}

//查找到一个对象中对应的行为对象，若没有找到则返回false
export function getMovementInObject(object,move_key){
    //从object[行为]中获取指定key的行为
	const 行为 = object.行为
    let 行为对象
    //如果Move_key是一个数组，则按照数组顺序获取对应的movement
    if(_.isArray(move_key)){
        行为对象 = 行为
        for(let key of move_key){
            行为对象 = 行为对象[key]
            if(!行为对象){
                console.log("——————————")
                console.log(object,move_key)
                throw new Error("对象的[行为]中，不存在这样一个路径指向一个行为对象！\n——————————")
            }
        }
    }
    //否则直接在[行为]中找到这个行为
    else{
        行为对象 = 行为[move_key]
    }

    if(行为对象){
        return 行为对象
    }
    else{
        return false
    }
}




//修改一个对象的指定函数
export function changeFunction(object, func_name, func) {
	// object.行为[func_name] = func;
}



