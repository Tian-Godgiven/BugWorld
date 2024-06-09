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
    Object.assign(move_effect,move_data)
    //如果压根就没有任何标注，则默认其中的内容为“生效”
    if(_.isFunction(move_data)){
        move_effect.效果 = move_data
    }

    return move_effect
}

//在对象初始化时，将func_lib中的内容转化为行为对象
export function initMovement(object,func_lib){
    //遍历func_lib中的内容
    for(let move_name in func_lib){
        // 初始化与默认数值
        object.行为[move_name] = {}
        const movement = func_lib[move_name]
        //判断是否有对触发时间的标注
        if(_.has(movement,"之前")||_.has(movement,"当时")||_.has(movement,"之后")){
            for(let move_time in movement){
                //然后再用其中的内容生成effect对象
                const effect = jsToMovementEffect(object,movement[key])
                //将其填入对象的“行为”当中
                object.行为[move_name][move_time] = [effect]
            }
        }
        //否则默认其中的内容为“当时”时效果
        else{
            const effect = jsToMovementEffect(object,movement)
            object.行为[move_name]["当时"] = [effect]
        }
    }
}

//向对象的已存在的行为中，增添一个行为效果
export function addMovementEffect(object, source, move_name, move_data ,move_time = "当时") {
	//如果这个行为尚未存在，则创建对应的行为
	if (!_.has(object.行为, move_name)) {
        console.log(`指定的行为${move_name}在对象中尚不存在！因此创建了对应的行为！`)
        object.行为[move_name] = {}
	}
    const movement = object.行为[move_name]
    //将move_data转换为move_effect
    const move_effect = jsToMovementEffect(source,move_data)
    //将其放入对应的行为的指定move_time中，未指定move_time的情况下，默认为“当时”
    if(_.has(movement,move_time)){
        movement[move_time].push(move_effect)
    }
    else{
        movement[move_time] = [move_effect]
    }
}

//从对象已存在的行为中删除一个指定来源的效果
export function deleteMovementEffect(object, source, move_name){
    //要求对应的行为name已经存在
	if (_.has(object.行为, move_name)) {
        const movement = object.行为[move_name]
        for(let move_time in movement){
            //遍历行为效果数组
            for(let i = 0; i < movement[move_time].length; i++){
                let move_effect = movement[move_time][i]
                if(move_effect.来源 == source){
                    //将这个move_effect从效果数组中删除
                    movement[move_time].splice(i, 1);
                }
            }
        }
	}
	//如果这个行为尚未存在，则返回false
	else {
        console.log(`指定的行为${move_name}在对象中尚不存在！`)
		return false
	}
}

//执行一个对象对应的行为，若没有相应的函数，则返回false
export function runObjectMovement(object, move_key, paras) {
	//获取对象的行为函数，并按顺序执行
	const functions = object.行为
	if (_.has(functions, move_key)) {
		//寻找其对应的行为，
		const movement = functions[move_key]
        const array = ['之前', '当时', '之后']
        let return_value = []
        array.forEach(phase => {
            //若存在，则按照顺序依次执行其中的effect
            if (movement[phase]) {
                //获取相应的执行结果,放入数组中
                const temp = runMovementEffect(object, movement[phase], paras)
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
    //若不存在对应的函数，默认返回true
	else{
		return true
	}

    function runMovementEffect(object,movement_effects,paras){
        // 按照优先级排列effects中的效果对象,然后遍历其中的效果对象，依次执行其中的“生效”函数
        const sorted_effects = sortByLevel(movement_effects)
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



//修改一个对象的指定函数
export function changeFunction(object, func_name, func) {
	// object.行为[func_name] = func;
}



