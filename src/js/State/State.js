import _ from "lodash"
import { addImpactToObjectState, countImpact, createImpact } from "./Impact"
import { findPath } from "../app/global_ability"

//创建一个属性对象
function createState(source,state_unit){
    let state = {
        数值:null,
        影响:[],
        来源:source
    }
    if(state_unit){
        state.单位 = state_unit
    }
    return state
}

// 为一个对象创建并添加一个指定的【属性对象state_object】
export function addStateToObject(object,state_belong,state_name,state_object){
    let the_object
    //如果传入的state_belong是一个数组，则依次读取这样一个数组
    if(_.isArray(state_belong)){
        //遍历state_belong，找到这个属性应当设置的位置
        let tmp_object = object
        for(let i =0 ; i < state_belong.length; i++){
            tmp_object = tmp_object[state_belong[i]]
        }
        the_object = tmp_object
    }
    else if(state_belong == "属性"){
        the_object = object.属性
    }
    else{
        the_object = object.属性[state_belong]
    }
    //要求对应位置还不存在对应的属性对象
    //若存在则报错
    if(the_object[state_name]){
        if(the_object[state_name].来源){
            throw new Error(`已存在${state_name}属性，无法重复添加！`)
            return false
        }
    }
    //否则将对应的state_object放入该位置
    the_object[state_name] = state_object
}

//读取一个json对象states，将其中[属性-值]键值对变为一个对象的属性+影响
//通常用于加载对象的初始属性，也用于添加新的属性，无论哪种情况，都要求属性在指定位置尚未存在
export function loadStatesToObject(object,state_belong,states,source,level){
    for(let state_name in states){
        let state = states[state_name]
        let state_unit = null
        // 对于添加了单位的属性
        if(state && state["单位"] != null){
            //将单位添加进这个属性中，并去除掉state中的“单位”
            state_unit = state["单位"]
            delete state["单位"]
            //如果其中存在数值，将这个数值作为state的值
            if(state["数值"] !== null || state["数值"] !== undefined){
                state = states[state_name] = state["数值"]
            }
        }

        // 如果对应的state是一个数组，则将其视作一个单纯的填装对象的数组
        if(_.isArray(state)){
            const state_inner = state
            addStateToObject(object,state_belong,state_name,state_inner)
        }
        //如果对应的state是一个字典，那么就用这个字典内的元素作为属性进行加载
        else if(_.isObject(state)){
            //创建这个state,但是不添加影响和数值数组
            const state_inner = {来源:source}
            //如果存在单位的话
            if(state_unit){
                state_inner.单位 = state_unit
            }
            //将state_inner作为属性的值添加进去
            addStateToObject(object,state_belong,state_name,state_inner)
            //将state_name添加到state_belong中,这里必须使用深复制，否则作为对象的belong数组会被接下来的指针行为改变
            let new_state_belong = _.cloneDeep(state_belong)
            if(_.isArray(state_belong)){
                new_state_belong.push(state_name)
            }
            else{
                new_state_belong = [state_belong,state_name]
            }
            //将这个state字典作为states添加进对象
            loadStatesToObject(object,new_state_belong,state,source,level)
        }
        //如果是键值对类型，则将值作为一个影响，填入属性的影响数组中
        else{
            //先创建state对象，把它添加给对象
            const state_object = createState(source,state_unit)
            addStateToObject(object,state_belong,state_name,state_object)
            //再通过传入的state的值生成一个Impact对象
            const value = states[state_name]
            const impact = createImpact(source,value,level)
            //将Impact对象添加到这个属性对象
            state_object.影响.push(impact)
            //计算这个属性的影响所产生的数值，并填装到属性上
            state_object.数值 = countImpact(state_object.影响)
        }
    }
}



//获取一个对象的指定【属性名】对应的数值,如果这个值为null则返回"无"
export function getState(object, state_name, type) {
	if (object == undefined) {
		throw new Error('该对象不存在')
		return false
    }
	//找到指定属性的路径和对应的值
	let the_object = findStatePath(object, state_name)
    let state
    //如果传入的state_name是一个数组，则顺着state_name的顺序寻找属性的值
    if(_.isArray(state_name)){
        for(let i of state_name){
            the_object = the_object[i]
        }
        state = the_object
    }
    else{
        state = the_object[state_name]
    }

	
    if(!state){
        return false
    }

    let value
    //如果这个state拥有“影响”，则返回其“数值”
    if(state.影响 != null){
        value = state.数值
    }
    //否则返回这个自身的值
    else{
        value = state
    }

    //如果值为空，则返回“无”
    if (value == undefined) {
        value = "无"
    }
    //如果type == "symbol"则返回带符号的值,但前提是这个值是一个纯数字，没有带有符号
    else if(type == "symbol" && _.isNumber(value)){
        let symbol = value > 0 ? "+":"-"
        value = symbol + value
    }
    
    return value
}


//向一个【目标对象】的[数组属性]中添加一个值
export function pushToState(target_object,state_name,value){
    const the_object = findStatePath(target_object, state_name)
	const state_value = the_object[state_name]
    //要求这个属性必须是一个数组
    if(_.isArray(state_value)){
        state_value.push(value)
    }
    else{
        console.log("该属性不是一个对象属性！")
    }
}
//将一个【目标对象】的[数组属性]中的指定的值删除并返回，如果不设定value，则删除并返回最后一位的值
export function popFromState(target_object,state_name,value){
    const the_object = findStatePath(target_object, state_name)
	const state_value = the_object[state_name]
    //要求这个属性必须是一个数组
    if(_.isArray(state_value)){
        //如果value不为空,则找到对应的value，删除并返回
        if(value){
            const index = state_value.indexOf(value);
            if (index !== -1) {
                return state_value.splice(index, 1)[0]; // 删除并返回指定值
            } 
            else {
                console.log(`值 ${value} 在数组中不存在。`);
                return false; // 如果值不存在，则返回 undefined
            }
        }
        else{
            return state_value.pop(value)
        }
    }
    else{
        console.log("该属性不是一个对象属性！")
    }
}

// 修改一个对象的指定属性的值，这个属性必须存在
export function changeState(object, states, value) {
	//允许传入一个字典，依次进行值的修改
	if (_.isObject(states)) {
		for (let state in states) {
			value = states[state]
			changeState_inner(object, state, value)
		}
	}
	//也允许只传入单个的属性名和值
	else {
		changeState_inner(object, states, value)
	}

	function changeState_inner(object, state_name, values) {
		//找到指定属性的路径
		const the_object = findStatePath(object, state_name)
		//把对应的值填入其中
		the_object[state_name] = values
	}
}

//向对象的指定位置中添加一个新的属性对象,对象内部若有值，则设定其优先级为“基础”
//其中:state_path可以是一个数组，但要求其中的路径必须存在在对象内部
//此外，要求不得在指定位置出现重复的属性名
export function appendState(object, source, state_path, state_json){
    let state_belong
	//如果传入了一个数组，state_belong为state_path第一个元素的路径+state_path剩余的元素
    if(_.isArray(state_path)){
        let state_belong = findPath(object,state_path[0])
        state_belong.push(...state_path.slice(1))
    }   
    else{
        state_belong = findPath(object,state_path)
    }

    console.log(state_belong)

    if(state_belong){
        //加载对应的state_json到对象当中
        loadStatesToObject(object,state_belong,state_json,source,"basic")
    }
}

//返回对象是否具有某个属性
export function haveState(object, state) {
	var path = findPath(object, state)
	if (path == undefined) {
		return false
	}
	else {
		return true
	}
}

//获取一个对象的指定属性的单位
export function getUnit(object, state_name) {
	//找到这个属性中的单位
	if (!object) {
		throw new Error('该对象不存在')
		return false
	}
	//找到指定属性的路径
	const the_object = findStatePath(object, state_name)
	const state = the_object[state_name]
	if (!state) {
		return false
	}
	//获取这个属性的单位
	let unit = state.单位

	//如果这个属性内部没有定义单位，则从通用单位中寻找
	if (unit == undefined) {
		const units = object.单位
		unit = units[state_name]
		if (units && unit) {
			return unit
		}

		//如果都没有找到对应的单位，返回一个空字符串
		else {
			return ""
		}
	}
	else {
		return unit
	}
}

//返回对象的指定属性名所在的一个对象the_object中
//使用the_object[state_name]即可获得这个属性的值
export function findStatePath(object, state_name) {
    let path
    //允许传入一个数组作为state_name
    if(_.isArray(state_name)){
        //先获得第一个属性名所在的位置数组
        path = findPath(object, state_name[0])
    }
    else{
        //先找到对应属性的位置数组
        path = findPath(object, state_name)
    }

	if (path) {
        //弹出最后一个属性位置，因为返回的对象是属性所在的对象
		path.pop()
		let the_object = object
        //遍历剩余的path数组，获得the_object
		for (var key of path) {
			the_object = the_object[key]
		}
        //如果是数组的话，就按照数组的顺序，找到对应的属性的所在的the_object
        if(_.isArray(state_name)){
            for(let i = 1 ; i < state_name.length - 1; i++){
                the_object = the_object[state_name[i]]
            }
        }
        
		//返回这个属性所在的对象
		return the_object
	}
	else {
		console.log(`未在${object}中找到对应的属性：${state_name}`)
		return false
	}
}



