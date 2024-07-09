import _ from "lodash"
import { addImpactToObjectState, countImpact, createImpact } from "./Impact"
import { findPath } from "../app/global_ability"
import { error } from "jquery"

export class State{
    constructor(source,unit){
        this.来源 = [source]
        if(unit){
            this.单位 = unit
        }
    }
}

//创建一个属性对象
function createState(source,unit,type){
    const state = new State(source,unit)
    if(type == "dic"){
    }
    else{
        state["数值"] = null
        state["影响"] = []
    }
    
    return state
}

// 讲一个指定的【属性对象State】添加到对象的指定位置中
// 如果指定位置已经存在属性对象，则会合并两者的“来源”和“影响”
export function appendStateObject(object,state_belong,state_name,state_object){
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

    //若存在对应的state_object则将来源与影响合并
    if(the_object[state_name] instanceof State){
        const old_state = the_object[state_name]
        const new_source = state_object.来源
        //要求来源不重复
        if(!_.includes(old_state.来源,new_source)){
            old_state.来源.push(new_source)
        }
        //合并影响
        const new_impact = state_object.影响
        //要求原本的属性中也包含了影响
        if(old_state.影响){
            old_state.影响.push(new_impact)
        }
    }
    //否则将对应的state_object放入该位置
    the_object[state_name] = state_object
}

//读取一个json对象states，将其中[属性-值]键值对变为一个对象的属性+影响
//通常用于加载对象的初始属性，也用于添加新的属性，并不会直接使用
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
            appendStateObject(object,state_belong,state_name,state_inner)
        }
        //如果对应的state是一个字典，那么就用这个字典内的元素作为属性进行加载
        else if(_.isObject(state)){
            //创建这个state,但是不添加影响和数值数组
            const state_inner = createState(source,state_unit,"dic")
            //将state_inner作为属性的值添加进去
            appendStateObject(object,state_belong,state_name,state_inner)
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
            appendStateObject(object,state_belong,state_name,state_object)
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



//向对象的指定位置中添加一个新的属性对象,对象内部若有值，则设定其优先级为“基础”
//其中:state_path可以是一个数组，但要求其中的路径必须存在在对象内部，state_path内必须包含该属性的名称（key）
//！→如果存在同名(key)的属性，则会将来源填入进内，随后将state_json当中的“数值”作为影响添加到属性中
//   此外，要求传入其中的“单位”必须完全相同
export function addStateTo(object, source, state_path, state_json, level = "basic"){
    let state_belong
	//如果传入了一个数组，state_belong为state_path第一个元素的路径+state_path剩余的元素
    if(_.isArray(state_path)){
        let state_belong = findPath(object,state_path[0])
        state_belong.push(...state_path.slice(1))
    }   
    else{
        state_belong = findPath(object,state_path)
    }

    if(state_belong){
        //加载对应的state_json到对象当中
        loadStatesToObject(object,state_belong,state_json,source,level)
    }
}

//删除一个对象的指定【属性名】对应的source，若这个属性对象不再具备来源，则删除这个属性
export function deleteStateFrom(object,source,state_path){
    //找到指定属性的路径和对应的值
	let the_object = findStatePath(object, state_path)
    //如果传入的state_path是一个数组，则获取最末尾的属性名
    if(_.isArray(state_path)){
        state_path = _.last(state_path)
    }
    //从the_object中获取目标属性对象
    let state = the_object[state_path]
    if(!state){
        return false
    }
    //将这个state对象的“来源”中==source删除
    const index = state.来源.indexOf(source)
    state.来源.splice(index,1)

    //如果在这之后来源为空，则删除这个state
    if(state.来源.length == 0){
        delete the_object[state_path]
    }
}

/**
 * 根据指定的对象和属性路径获取值，并根据指定的类型进行处理。
 * @param {*} object 要获取值的对象
 * @param {*} state_path 属性路径,可以是一个数组，会获取最后一位属性的值
 * @param {'stateObject' | 'num' | 'symbol'} type 类型：'stateObject' 返回属性对象；'num' 返回纯数字属性值；'symbol' 返回带符号的数字值（仅当值为纯数字时）
 * @returns 返回根据指定类型处理后的值，如果值为 null 则返回 "无"
 */
export function stateValue(object, state_path, type) {
	if (object == undefined) {
		throw new Error('该对象不存在')
		return false
    }
	//找到指定属性所在的对象
	let the_object = findStatePath(object, state_path)
    //如果传入的state_path是一个数组，则获取最后一位属性
    if(_.isArray(state_path)){
        state_path = _.last(state_path)
    }
    let state = the_object[state_path]
    if(!state){
        return false
    }

    //如果type == “stateObject”则将获得的state对象返回
    if(type == "stateObject"){
        return state
    }

    //否则，返回这个state对象的数值
    let value
    //如果这个state拥有“影响”，则返回其“数值”
    if(state.影响 != null){
        value = state.数值
    }
    //否则返回这个属性的内容
    else{
        value = state
    }

    //如果值为空，则返回“无”
    if (value == undefined) {
        value = "无"
    }
    //如果type == "symbol"则返回带符号的值,但前提是这个值是一个纯数字
    else if(type == "symbol" && _.isNumber(value)){
        let symbol = value > 0 ? "+":"-"
        value = symbol + value
    }
    else if(type == "num"){
        value = parseInt(value)
    }

    //如果要求传回的是“信息”，则调用“获取信息”函数，将这个值加工一下
    if(state_path == "信息"){
        value = getInformation(object,value)
    }
    
    return value
}


//向一个【目标对象】的【属性对象】中添加一个值
export function pushToState(target_object,state_path,value){
    const the_object = findStatePath(target_object, state_path)
    //如果传入的state_path是一个数组，则获取最后一位属性
    if(_.isArray(state_path)){
        state_path = _.last(state_path)
    }
    const state = the_object[state_path]
    //如果这个属性是一个数组，则直接push指定的值
    if(_.isArray(state)){
        state.push(value)
    }
    else{
        console.log("该属性不是一个数组属性！")
        return false
    }
}
//将一个【目标对象】的[数组属性]中的指定的值删除并返回，如果不设定value，则删除并返回最后一位的值
export function popFromState(target_object,state_path,value){
    const the_object = findStatePath(target_object, state_path)
    //如果传入的state_path是一个数组，则获取最后一位属性
    if(_.isArray(state_path)){
        state_path = _.last(state_path)
    }
    const state = the_object[state_path]
    //要求这个属性必须是一个数组
    if(_.isArray(state)){
        //如果传入的value不为空,则找到对应的value，删除并返回
        if(value){
            const index = state.indexOf(value);
            if (index !== -1) {
                return state.splice(index, 1)[0]; // 删除这个值并返回删除值
            } 
            else {
                console.log(`值 ${value} 在数组中不存在。`);
                return false; // 如果值不存在，则返回 undefined
            }
        }
        //如果传入的value为空，则默认删除并返回最后一个值
        else{
            return state.pop(value)
        }
    }
    else{
        console.log("该属性不是一个数组属性！")
    }
}

// 修改一个对象的指定属性的值，这个属性必须存在
export function changeState(object, states, value) {
	//允许传入一个字典，依次进行值的修改
	if (_.isObject(states)) {
		for (let state_path in states) {
			value = states[state]
			changeState_inner(object, state_path, value)
		}
	}
	//也允许只传入单个的属性名和值
	else {
		changeState_inner(object, states, value)
	}

	function changeState_inner(object, state_path, value) {
		//找到指定属性的路径
		const the_object = findStatePath(object, state_path)
        //如果传入的state_path是一个数组，则获取最后一位属性
        if(_.isArray(state_path)){
            state_path = _.last(state_path)
        }
		//把对应的值填入其中
		the_object[state_path] = value
	}
}



//返回对象是否具有某个属性
export function haveState(object, state_path) {
    let state
    //如果state_path是一个数组，则按照其顺序查找是否存在对应的属性
    if(_.isArray(state_path)){
        if(!"属性" in state_path){
            state = object.属性
        }
        for(let i of state_path){
            state = object[i]
            //只要过程中存在一个属性为空，则停止遍历
            if(!state){
                break
            }
        }
    }
    //否则，查找"属性“当中是否存在对应的state_path
    else{
        state = findPath(object, state)
    }
    
	//如果最后也没有找到，则返回false，若找到了，则返回true
	if (state == undefined) {
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
	//如果传入的state_name是一个数组，则获取最后一个属性对象
    if(_.isArray(state_name)){
        state_name = _.last(state_name)
    }
    const state = the_object[state_name]
    //要求对应的属性对象不为空，并且不是一个object
	if (!state || state.type == "object") {
		return false
	}
    
	//获取这个属性的单位
	let unit = state.单位
	//如果这个属性内部没有定义单位，则从通用单位中寻找
	if(!unit) {
		const units = object.单位
        if (units) {
			unit = units[state_name]
		}
	}

    //如果最后都没有找到对应的单位，返回一个空字符串
	if(unit){
        return unit
    }
	else {
		return ""
	}
}

//返回对象的指定属性所在的一个对象the_object中，如果传入一个数组，则会顺着数组找到最后一位属性所在的对象
//使用the_object[state_name]即可获得这个属性的内容
export function findStatePath(object, state_name) {
    let path
    //允许传入一个数组作为state_name
    if(_.isArray(state_name)){
        //获得第一个属性名所在的位置数组
        path = findPath(object, state_name[0])
        //然后顺着加入其他属性的位置数组
        for(let i = 1; i < state_name.length ; i++){
            path.push(state_name[i])
        }
    }
    else{
        //先找到对应属性的位置数组
        path = findPath(object, state_name)
    }

    //只要path不为空，就使用这个path数组找到对应属性对象所在的对象
	if (path) {
        //弹出最后一个属性位置，因为返回的对象是属性所在的对象
		path.pop()
		let the_object = object
        //遍历剩余的path数组，获得the_object
		for (var key of path) {
			the_object = the_object[key]
		}
		//返回这个属性所在的对象
		return the_object
	}
    //没有找到path时，说明对应的属性并不存在
	else {
        console.log(object)
		throw new error(`未在其中找到对应的属性：${state_name}`)
		return false
	}
}

//计算一个对象的指定属性加上对应的值后的结果，主要是用于添加“+”“-”符号
export function countState(object, state, add_value) {
	//获取指定属性的旧值
	var old_value = stateValue(object, state);
	//令指定属性的旧值加上add_value获取新值
	var new_value = parseInt(old_value) + parseInt(add_value);
	if (new_value >= 0) {
		new_value = "+" + new_value;
	}
	else if (new_value < 0) {
		new_value = "-" + Math.abs(new_value);
	}

	return new_value;
}

//获取一个对象内部的“信息”,或者传入一个“信息”，将对象的属性传递给其中的变量
export function getInformation(object,info){
    //传入一个信息的情况
    if(info){
        // 获取信息中的${}标识，用 object 的属性值替代这些标识
        const regex = /\${(.*?)}/g; // 匹配 ${} 的正则表达式
        return info.replace(regex, (match, key) => {
            const state_path = key.trim()
            return stateValue(object,state_path); // 用对象属性值替换 ${} 标识
        });
    }
    //没有指定info的情况
    else{
        return stateValue(object,"信息")
    }
}

