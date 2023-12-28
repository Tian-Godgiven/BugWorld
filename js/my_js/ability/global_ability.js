//通过递归获得找到属性的路径,若没有找到对象，则返回undefined
function findPath(object, state, path = []) {
	//遍历其中的key
	for (var key in object) {
		//如果已经开始在作为属性值的对象中寻找了，则返回undefined
		if( key == "属性"){
			return undefined
		}
		//找到了等于state的key时，返回包含了state的路径
		if (key == state) {
			return path.concat(state);
		} 
		//否则，若key的属性是一个字典
		else if (typeof object[key] === "object") {
			//递归调用key对应的属性
			var result = findPath(object[key], state, path.concat(key));
			//如果返回了一个path，则将这个path递归返回
			if (result !== undefined) {
				return result;
			}
		}
	}
}

//修改一个对象的指定属性的值
function changeState(object, states, value) {
	//允许传入一个字典进行值的修改
	if(typeof states == "object"){
		for(state in states){
			value = states[state]
			changeState_inner(object,state,value)
		}
	}
	//也允许只传入一个属性名和值
	else{
		changeState_inner(object,states ,value)
	}

	function changeState_inner(object,state,values){
		var path = findPath(object.属性,state)
		if(path != undefined){
			var last_path = path.pop();
			var the_object = object.属性;
			for (var key of path) {
				the_object = the_object[key];
			}
		  		
		  	//如果这个属性是一个数组，那么就将对应的value添加进去
			if($.isArray(the_object[last_path])){
				if($.isArray(values)){
					for(tmp in values){
						var value = values[tmp]
						the_object[last_path].push(value)
					}
				}
				else{
					the_object[last_path].push(values)
				}
				
			}
			//如果这个属性是一个值，则令其对应的内容修改为value
			else if(the_object[last_path] == null){
				the_object[last_path] = values
			}
			//如果这个属性是一个字典，也就是说其中包含了诸如“当前xx”和“最大xx”的属性
			else if(typeof the_object[last_path] === "object"){
				//则修改这个字典对象中的所有值
				for(var key in the_object[last_path]){
					the_object[last_path][key] = values
				}
			}
			//如果都不是，则直接把对应的值填入其中
			else{
				the_object[last_path] = values
			}
		  	
		}
	}
}

//修改一个对象的指定函数
function changeFunction(object,func_name,func){
	object.函数[func_name] = func
}

//修改一个对象的指定工作的参与数量
function changeWorkNum(object,num,work){
	var work_name = getState(work,"名称")
	//如果不是全体辞职，则修改数量
	if(num > 0){
		object.工作[work_name] = {工作:work,数量:num}
	}
	//否则令其全体辞职
	else{
		//令对象不再参与这个工作
		delete object.工作[work_name]
		var 参与 = getState(work,"参与")
		//令工作的参与不再包含对象
		var index = 参与.indexOf(object); // 获取索引
		参与.splice(index,1)
	}
}

//向对象的指定分支中增添对应的属性与对应属性的单位
function appendState(object, state_path, state, value ,unit){
	//增添属性值
	object.属性[state_path][state] = value;
	//增添单位
	if(unit != undefined){
		object.单位[state] = unit
	}
}

//向对象的函数中增添一个函数
function appendFunction(object,func_name,func){
	//如果这个函数尚未存在，则将其赋值
	if(object.函数[func_name] == undefined){
		object.函数[func_name] = func
	}
	//如果这个函数已经存在了，则为其添加新函数
	else{
		var funcs = object.函数[func_name]
		//如果这个函数是一个数组，则将新函数加入其中
		if($.isArray(funcs)){
			object.函数[func_name].push(func)
		}
		//否则令其变成一个数组
		else{
			var funcs = [funcs,func]
			object.函数[func_name] = funcs
		}
	}
}
//获取一个对象的指定属性的值
function getState(object, state){
	if(object == undefined){
		throw error('该对象不存在')
		return false
	}
	var path = findPath(object.属性,state)
	if(path != undefined){
		var last_path = path.pop();
		var the_object = object.属性;
		for (var key of path) {
			the_object = the_object[key];
		}
	  	var value = the_object[last_path]
	  	if(value == undefined){
	  		console.log(object)
	  		console.log(state , "值未定义")
	  		value = 0
	  	}

		return value
	}
	else{
		console.log("错误，"+object+"不具备"+state);
		return null
	}
}

//获取一个对象的指定函数
function getFunction(object,func_name){
	var func = object.函数[func_name]

	return func
}

//获取一个对象的指定属性的单位
function getUnit(object,state_name){
	var unit = object.单位[state_name]
	if(unit == undefined){
		unit = ""
	}
	return unit
}

//获取对象群体剩余的平均工作能力
function getEqualWorkPower(object){
	//对象的总工作能力
	var bug_num = getState(object,"数量")
	var all_workPower = getState(object,"工作") * bug_num
	//遍历对象参与的工作，减去其中对工作量的需求
	var works = object.工作 
	for(work_name in works){
		var work = works[work_name].工作
		var work_num = works[work_name].数量
		var value = getState(work,"工作量")
		//总工作能力减去这些工作消耗的工作量
		if(typeof value == "number"){
			all_workPower -= value * work_num
		}
		else if( value == "全部"){
			all_workPower -= getState(object,"工作") * work_num
		}
		//
		bug_num -= work_num
	}
	return all_workPower / bug_num
}

//获取一个对象中参与了指定工作的单位数量
function getWorkNum(object,work){
	var work_name = getState(work,"名称")
	var work = object.工作[work_name]
	if(work == undefined){
		work_num = 0
	}
	else{
		work_num = work.数量
	}
	if(work_num == undefined){
		work_num = 0
	}
	return work_num
}

//获取一个对象中参与了指定类型的工作的单位数量
function getTypeWorkNum(object,work){
	var work_id = work.id

	var work_num =0
	for(work_name in object.工作){
		var the_work = object.工作[work_name].工作
		//同类型的工作
		if(the_work.id == work_id){
			var the_num = object.工作[work_name].数量
			work_num += the_num
		}
	}
	
	return work_num
}

//计算一个对象的指定属性加上对应的值后的结果，主要是用于添加“+”“-”符号
function countState(object,state,add_value){
	//获取指定属性的旧值
	var old_value = getState(object,state)
	//令指定属性的旧值加上add_value获取新值
	var new_value = parseInt(old_value) + parseInt(add_value)
	if(new_value >= 0){
		new_value = "+" + new_value
	}
	else if(new_value < 0){
		new_value = "-" + Math.abs(new_value)
	}

	return new_value
}

//修改对象的属性，令其加上某个值
function addState(object,state,add_value){
	var new_value = countState(object,state,add_value)
	changeState(object,state,new_value)
}

//返回对象是否具有某个属性
function haveState(object ,state){
	var path = findPath(object.属性,state)
	if(path == undefined){
		return false
	}
	else{
		return true
	}
}

//返回对象是否具有某个词条
function haveEntry(object ,entry){
	var object_entry = object.属性.词条

	return object_entry.includes(entry)
}

//返回对象是否参与了某个工作
function haveWork(object,work){
	var object_work = object.工作
	return getState(work,"名称") in object_work
}

//返回对象是否完全参加了某个类型的工作
function haveAllTypeWork(object,work){
	var id = work.id
	var free_num = getState(object,"数量")
	for(i in object.工作){
		//如果工作id相同了,说明有这个工作
		if( id == object.工作[i].工作.id ){
			//减去参加了同类型工作的数量
			free_num -= object.工作[i].数量
		}
	}
	//如果完全参与了这个类型的工作则free_num = 0
	if(free_num <= 0){
		return true
	}
	else{
		return false
	}
}

//调用某一个对象的指定函数
function useFunction(object,func_name,...argus){
	var func = getFunction(object,func_name)
	//如果这个函数是一个数组的话
	if($.isArray(func)){
		var funcs = func
		for(i in funcs){
			var func = funcs[i]
			if($.isFunction(func)){
				func(...argus)
			}
			else if(func == "无" || func == null){
				//默认返回true
				return true
			}
			else{
				console.log(object+"的"+func_name+"不是函数")
			}
			
		}
		
	}
	//如果是单个函数就直接调用
	else{
		if($.isFunction(func)){
			return func(...argus)
		}
		else if(func == "无" || func == null){
			//默认返回true
			return true
		}
		else{
			console.log(object+"的"+func_name+"不是函数")
		}
	}
}

//将一个对象的属性转化为div结构
function stateIntoDiv(object){
	var states = object.属性
  	var div = $("<div>",{class:"data"})

  	for(key in states){
		//属性放置位置
		var container_div = $("<div>",{class:"state flex",})
		//属性名和属性内容
		var name_div = $("<div>",{
	  		class:"state_name",
	  		name:key,
	  		text:key+"："
		})
		var inner_div = $("<div>",{class:"state_inner"})
		
		//根据属性名设定其inner_div的内容
		if(key == "虫群" || key == "设施"){
			for(i in states[key]){
				var object = states[key][i]
				//对象container
				var object_div = createNumDiv(object)
				//放进inner_div中
				$(inner_div).append(object_div)
			}
		}
		else if(key == "特性"){
			for(i in states[key]){
				var object = states[key][i]
				//令inner div采用flex
				inner_div.addClass('flex')
				//特性div
				var name = getState(object,"名称")
				var object_div = $("<div>",{
					class:"object object_name object_characteristic",
					text:"「"+ name +"」"
				})
				//将这个对象与container绑定
				$(object_div).data("object",object)
				//放进inner_div中
				$(inner_div).append(object_div)
			}
		}
		else if(key == "词条"){
			var entry_div = createEntryDiv(states[key])
			//放进div中
			$(div).append(entry_div)
			continue;
		}
		//如果这个属性的值是一个字典，则将这些值视作次级的属性
		else if(typeof states[key] === "object"){
	  		for(inner_state_name in states[key]){

	  			//获取这个次级属性的单位
				var unit = getUnit(object,inner_state_name)

	  			//如果这个属性还是一个字典的话，将其中的值视作“当前xx/最大xx”
	  			if(typeof states[key][inner_state_name] === "object"){
	  				var tmp_list = []
	  				for(inner_state_key in states[key][inner_state_name]){
	  					tmp_list.push(states[key][inner_state_name][inner_state_key])
	  				}
	  				//再次规限，如果里面只有两个值的话
	  				if(tmp_list.length==2){
	  					//将前一个值视作当前值，后一个值视作最大值
	  					var inner_state_html = tmp_list[0] + "/" + tmp_list[1] + unit
	  				}
	  			}
	  			//否则就默认其中的值为属性值
	  			else{
	  				var inner_state_html = states[key][inner_state_name] + unit
	  			}

	  			var inner_state_div = createStateDiv(inner_state_name,inner_state_html)
	  			//放进inner_div中
	  			$(inner_div).append(inner_state_div)
	  		}
		}
		//如果都不是，那么就直接把这个属性作为inner_div的值
		else{
			$(inner_div).html(states[key])
		}

		$(container_div).append(name_div,inner_div)
		$(div).append(container_div)
  	}
  	return div
}

//创建一个属性的显示div,显示属性名：属性内容
function createStateDiv(state_name,state_inner){
	//属性容器
	var container_div = $("<div>",{class:"state flex",})
	//属性名和属性内容
	var name_div = $("<div>",{
  		class:"state_name",
  		name:state_name,
  		text:state_name+"："
	})
	var inner_div = $("<div>",{
		class:"state_inner",
		text:state_inner
	})
	$(container_div).append(name_div,inner_div)
	return container_div
}

//创建一个词条的显示div
function createEntryDiv(entries){
	//设施词条
	var entry_div = $("<div>",{class:"state flex"})
	//属性名和属性内容
	var entry_name_div = $("<div>",{
  		class:"state_name",
  		name:"词条",
  		text:"词条："
	})
	var entry_inner_div = $("<div>",{class:"state_inner flex",})
	for(i in entries){
		var entry_span = $("<span>",{text:"[" + entries[i] + "]"})
		entry_inner_div.append(entry_span)
	}
	$(entry_div).append(entry_name_div,entry_inner_div)
	return entry_div
}

//将一个对象转化为一个div结构，显示其名称和数量
function createNumDiv(object){
	var container_div = $("<div>",{class:"object"})
	var name_div = $("<span>",{
		class:"object_name",
		text:getState(object,"名称")
	})
	$(name_div).data("object",object)
	var num_div = $("<span>",{
		class:"object_num",
		text:" x " + getState(object,"数量")
	})
	$(container_div).append(name_div,num_div)
	return container_div
}


