import _, { toNumber } from "lodash"
import { showInformation } from "../Modules/information"
import { getState } from "../State/State"

//执行一个对象对应的函数，若没有相应的函数，则返回false
export function runObjectFunction(object, func_key, arr) {
	//获取对象的函数
	const functions = object.函数
	if (_.has(functions, func_key)) {
		//寻找其对应的函数并执行
		const func = functions[func_key]
		// 如果arr是数组，则使用展开运算符
		if (Array.isArray(arr)) {
            return func(object, ...arr); 
        } 
		// 如果arr是单独变量，则直接传递给函数
		else {
            return func(object, arr); 
        }
	}
	//否则返回false即可，因为并不是所有对象都有定义对应的函数的
	else {
		return true
	}
}

//通过递归获得找到属性的路径,若没有找到则返回false
export function findPath(object, state, path = ["属性"]) {
	//我们要求从object的属性开始寻找
	if(object.属性){
		object = object.属性
	}
	
	//遍历其中的key
	for (var key in object) {
		//找到了等于state的key时，返回包含了state的路径
		if (key == state) {
			return path.concat(state);
		}
		//否则，若key的属性是一个字典,且不是一个object
		else if (_.isObject(object[key])) {
			if(object[key].type != "object"){
				//递归调用key对应的属性
				var result = findPath(object[key], state, path.concat(key));
				//如果返回了一个path，则将这个path递归返回
				if (result) {
					return result;
				}
			}
		}
	}
}

//扩充一个js对象，使其添加并修改另一个js对象中的数据
export function expandJsObject(js,more_js){
    template(js,more_js)
    return js

    function template(the_state,find_state,state_name){
		//如果the_state中没有这个属性名，那就临时添加一下，之后会修改的
		if(state_name != null && the_state[state_name] == null){
			the_state[state_name] = find_state
		}
		
        if(_.isObject(find_state)){
			if(state_name != null){
				//如果值是一个字典，则令the_state向state_name加深一层
				the_state = the_state[state_name]
			}
            for(let name in find_state){
                let value = find_state[name]
                template(the_state,value,name)
            }
        }
        //否则将这个find_state放入the_state中
        else{
            the_state[state_name] = find_state
        }
    }
}

//修改一个对象的指定函数
export function changeFunction(object, func_name, func) {
	object.函数[func_name] = func
}

//向对象的函数中增添一个函数
export function appendFunction(object, func_name, func) {
	//,如果这个函数已经存在了，则为其添加新函数
	if (_.has(object.函数, func_name)) {
		var old_func = object.函数[func_name]
		//如果已经是一个数组了，则将新函数加入其中
		if (_.isArray(old_func)) {
			object.函数[func_name].push(func)
		}
		//否则令其变成一个数组
		else {
			var new_func = [old_func, func]
			object.函数[func_name] = new_func
		}
	}
	//如果这个函数尚未存在，则将其赋值
	else {
		object.函数[func_name] = func
	}
}
//判断一个字符串是否是可计算的
export function isCalculableString(string) {
    try {
        // 使用eval函数尝试执行字符串表达式
        eval(string);
        // 如果执行成功并返回有效数字，则说明是可计算的
        return true;
    } catch (error) {
        // 捕获执行过程中的错误，说明不是可计算的
        return false;
    }
}

//计算一个初始值受到一个字符串值的影响后的结果,要求其中不得存在百分比
export function countValue(base, string) {
	//如果这个字符串是不可计算的，则将base与string连接起来后返回
	if(!isCalculableString(string)){
		return base += string
	}

	let sign
	//如果传入的base为空，则直接返回string本身
	if(!base){
		return string
	}
	//如果传入的base是一个带符号数，则需要先保存其符号，然后计算
	else if(!_.isNumber(base)){
		sign = /([-+*/×÷])/.exec(base)[0]
		base = parseFloat(base)
	}

    // 解析字符串中的符号和数值
    const regex = /([-+*/])?(\d+\.?\d*)/g;
    let match;
    while ((match = regex.exec(string)) !== null) {
        const operator = match[1];
        const operand = parseFloat(match[2]);
        // 根据符号执行相应的操作
        switch (operator) {
            case '+':
                base += operand;
                break;
            case '-':
                base -= operand;
                break;
            case '*':
                base *= operand;
                break;
            case '/':
                base /= operand;
                break;
			// 如果没有检测到符号，则统一判断为增加
            default:
				base += operand
				break;
        }
    }

	//将原本的base中的符号放回去
	if(sign){
		base = sign + base
	}

	return base;
}

//计算一个对象的指定属性加上对应的值后的结果，主要是用于添加“+”“-”符号
export function countState(object, state, add_value) {
	//获取指定属性的旧值
	var old_value = getState(object, state)
	//令指定属性的旧值加上add_value获取新值
	var new_value = parseInt(old_value) + parseInt(add_value)
	if (new_value >= 0) {
		new_value = "+" + new_value
	}
	else if (new_value < 0) {
		new_value = "-" + Math.abs(new_value)
	}

	return new_value
}

//返回对象是否参与了某个工作
export function haveWork(object, work) {
	var object_work = object.占有
	return getState(work, "名称") in object_work
}


//将一个对象的【属性】转化为显示在Tile中的tile_data
export function stateIntoTileData(object) {
	var states = object.属性
	var tile_data = $("<div>")
	// 遍历对象的属性,获得属性名和属性值
	for (let name in states) {
		let value = states[name]
		//根据name产生不同的state_type
		let state_type
		switch (name) {
			// 特殊类型的属性有特殊的显示方式
			case "虫群":
			case "设施":
				state_type = ["block", "object_num"];
				break;
			case "特性":
				state_type = ["inline", "characteristic"];
				break;
			case "词条":
				state_type = ["inline", "entry"];
				break;
			case "所属":
				state_type = ["block", "object"]
				break
			default:
				// 如果这个属性的值当中包含了“影响”则说明这个属性是一个“key-value”类型
				if (value.影响 != null) {
					state_type = ["value"]
				}
				// 如果这个属性的值当中没有“影响”，并且是一个数组，则说明这个属性是一个“key-array”类型
				else if(_.isArray(value)){
					state_type = ["array"]
				}
				// 如果没有“影响”的同时，也不是一个数组，并且是一个字典，则说明其是一个“key-dictionary”类型
				else if(_.isObject(value)){
					state_type = ["dic"]
				}
				else{
					state_type = ["none"]
				}
				break;
		}
		const state_div = createStateDiv(object, name, value, state_type)

		$(tile_data).append(state_div)
	}
	return tile_data
}

//创建并返回一个属性div,包括属性名和属性值
export function createStateDiv(object, name, value, type) {
	//属性容器
	var state_div = $("<div>", { class: "state flex", })
	//属性名和属性内容
	var name_div = $(`<div>${name}：</div>`)
	//获取value_div,并添加到对应的value_div后面
	let value_div = createStateValue(object,value, type)
	//为属性值添加对应的单位,优先使用属性值内保存的属性
	if(value.type != "object"){//有些属性的值是一个对象，例如“所属”
		let unit = value.单位
		if(!unit){
			unit = object.单位[name]
		}

		if(unit){
			$(value_div).append(`<span>${unit}</span>`)
		}
	}
	
	$(state_div).append(name_div, value_div)
	return state_div
}

// 其中type[0]为结构方式分为
// 一行一行的：block，全部放在行内的：inline，字典：dic，无：none
function createStateValue(object,value, type) {
	let state_value_div = $("<div></div>")

	//如果是空数组or空字典or Null
	if (_.isEmpty(value) && !_.isNumber(value)) {
		return "无"
	}

	//根据type设定其value_div的内容
	switch (type[0]) {
		// value中的每一个数据都是一行
		case "block":
			state_value_div.append(createStateValueBlock(value, type[1]))
			break;
		// value中的所有数据放在同一行内
		case "inline":
			//flex在同一行中
			state_value_div.addClass("flex")
			createStateValueInline(value, type[1])
			break;
		// 数值
		case "value":
			state_value_div.append(createStateValueBlock(value))
			break
		// dic
		case "dic":
			let states = value
			for (let name in states) {
				if(name != "来源"){
					const value = states[name]
					const state_div = createStateDiv(object , name, value, ["block"])
					//放进去
					$(state_value_div).append(state_div)
				}
			}
			break;
		// array
		case "array":
			state_value_div.addClass("flex")
			createStateValueInline(value)
			break;
		default:
			break;
	}

	//创建一行一行的属性值div
	function createStateValueBlock(data, type2) {
		//带有数量的对象div
		if (type2 == "object_num") {
			for (let object of data) {
				state_value_div.append(objectToDiv(object, "num"))
			}
		}
		//没有数量的对象div
		else if (type2 == "object") {
			//如果是多个对象，则遍历
			if (data.length >= 1) {
				for (let object of data) {
					state_value_div.append(objectToDiv(object))
				}
			}
			// 否则直接使用
			else {
				state_value_div.append(objectToDiv(data))
			}
		}
		//普通的属性：值
		else {
			let block_inner
			//如果这个属性值内部有“now"作为键名，则将其变成“a/b”格式
			if (data.now != null) {
				block_inner =  data.now.数值 + "/" + data.max.数值
			}
			else{
				block_inner = data.数值
			}
			state_value_div.html(block_inner)
		}
	}
	//创建同一行中的属性值div
	function createStateValueInline(data, type2) {
		//特性div,传入的是一个特性object
		if (type2 == "characteristic") {
			for (let characteristic of data) {
				let characteristic_div = $("<div>", {
					class: "object_click object_charateristic",
					text: "「" + getState(characteristic, "名称") + "」"
				})
				//绑定上去
				$(characteristic_div).data("object", characteristic)
				state_value_div.append(characteristic_div)
			}
		}
		//词条div
		else if (type2 == "entry") {
			for (let entry of data) {
				var entry_span = $("<span>", { text: "[" + entry + "]" })
				state_value_div.append(entry_span)
			}
		}
		//不是以上两种特殊的类型，则内部均为object
		else {
			for(let object of data){
				const object_div = objectToDiv(object)
				state_value_div.append(object_div)
			}
		}
	}

	return state_value_div
}






//将一个对象转化为一个div结构
//当type==num时，还会在div中显示对应object的数量
export function objectToDiv(object, type) {
	let object_div = $(`
		<div class='object'>
			<span class='object_click object_name'>${getState(object, "名称")}</span>
		</div>`)
	//对象的名称绑定对象本身
	$(object_div).children(".object_click").data("object", object)

	//显示对象的数量
	if (type == "num") {
		var num_div = $("<span>" + " x " + getState(object, "数量") + "</span>")
		$(object_div).append(num_div)
	}
	// 显示对象的等级
	if (type == "level"){
		const level = getState(object,"等级")
		if(level != "无"){
			const level_div = $("<span> lv."+ level + "</span>")
			$(object_div).append(level_div)
		}
	}

	return object_div
}
//点击object_click可以显示这个对象的信息
$("#main").on("click", ".object_click", function (event) {
	event.stopPropagation()
	const object = $(this).data("object")
	showInformation(object)
})


