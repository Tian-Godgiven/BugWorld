import _, { toNumber } from "lodash"

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

// 将一个数组中的{对象,优先级}，以优先级大小进行排列，并最终返回一个排列好的纯对象数组
export function sortByLevel(array){

	if(array.length == 1){
		return [array[0].对象]
	}

	let priorityQueues = {}
    // 遍历影响数组，获取以优先级为key的字典，将相同优先级的object放在一起
    for(let i = 0; i < array.length; i++){
        let object = array[i].对象
        let priority = array[i].优先级
        // 如果优先级队列中不存在当前优先级，就创建一个空数组
        if (!priorityQueues[priority]) {
            priorityQueues[priority] = [];
        }
        priorityQueues[priority].push(object);
    }

    // 获取所有优先级，并按优先级的大小生成优先级数组
    let priorities = Object.keys(priorityQueues)
        .sort((a, b) => {
            if (a == "basic") return -1; // "basic" 排在最前面
            if (b == "basic") return 1;
            if (a == "max") return -1;   // "max" 排在其次
            if (b == "max") return 1;
			if (a == "min") return -1;   // "min" 排在最后面
            if (b == "min") return 1;
            if (!isNaN(a) && !isNaN(b)) {
                return Number(b) - Number(a); // 数字优先级按大小排序,越大越优先
            }
            return 0; // 其他情况保持原顺序
        })
    // 遍历排序好的优先级数组，将其中的影响添加到排序好的影响对象数组中
    let sortedArray = [];
    for (let i = 0; i < priorities.length; i++) {
        let priority = priorities[i];
        sortedArray = sortedArray.concat(priorityQueues[priority]);
    }
	return sortedArray
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
    //如果传入的base为空，则直接返回string本身
	if(!base || base == undefined){
		return string
	}
    //如果传入的string为空，则直接返回base本身
    if(!string || string == undefined){
        return base
    }
	//如果这个字符串是不可计算的，则将base与string连接起来后返回
	if(!isCalculableString(string)){
		return base += string
	}

	let sign
	//如果传入的base是一个带符号数，则需要先保存其符号，然后计算
	if(!_.isNumber(base)){
		sign = /([-+*/×÷])/.exec(base)[0]
		base = parseFloat(base)
	}

    //如果传入的base和string都是布尔值，则返回布尔并的结果
    if(typeof base === 'boolean' && typeof string === 'boolean'){
        return base && string
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

//将一个带符号的字符串的值取负，+相互变成-，*相互变成/
export function negativeValue(string) {
    // 如果传入的string为空，则直接返回false
    if (!string || string === undefined) {
        return false;
    }
    // 如果这个字符串是不可计算的，则返回false
    if (!isCalculableString(string)) {
        return false;
    }
    // 如果这个字符串是一个数字，则直接取负并返回
    if (typeof string == "number"){
        string = -string
        return string
    }

    // 提取数值部分并根据符号进行转换
    let value = parseFloat(string); // 提取数值部分，例如将 "+12" 提取为 12
    let result;

    if (string.startsWith('+')) {
        result = '-' + value.toString(); // 将 + 变为 -
    } else if (string.startsWith('-')) {
        result = '+' + value.toString(); // 将 - 变为 +
    } else if (string.startsWith('*')) {
        result = '/' + value.toString(); // 将 * 变为 /
    } else if (string.startsWith('/')) {
        result = '*' + value.toString(); // 将 / 变为 *
    } else {
        // 如果字符串不以 + 或 * 开头，则直接返回原字符串
        return string;
    }

    return result;
}

//创建一个随机的ID值，内容可能包含数字和大小写字母
export function createRandomId(lenght){
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var id = '';
    for (var i = 0; i < lenght; i++) {
        var randomIndex = Math.floor(Math.random() * characters.length);
        id += characters[randomIndex];
    }
    return id;
}

//获得一个“相对于目标元素的某个方向的offset位置（left,top)”
export function getOffsetBeside(target,self,vertical="same_top",horizontal="right"){
    // 获取目标元素的位置信息
    const targetPosition = $(target).offset()
    // 获取目标元素和自身的尺寸信息
    const targetSize = {
        width: $(target).outerWidth(),
        height: $(target).outerHeight()
    }
    if(self){
        const selfSize = {
            width: $(self).outerWidth(),
            height: $(self).outerHeight()
        }
    }
    else{
        if(vertical != "same_top" && vertical != "bottom"){
            throw new Error("必须添加self元素")
        }
        if(horizontal != "same_left" && horizontal != "right"){
            throw new Error("必须添加self元素")
        }
    }
    

    //即将生成的位置信息
    let top,left

    // 计算垂直方向的放置点
    switch (vertical) {
        case 'top':
            top = targetPosition.top - selfSize.height;
            break;
        case 'bottom':
            top = targetPosition.top + targetSize.height;
            break;
        case 'center':
            top = targetPosition.top + (targetSize.height / 2) - (selfSize.height / 2);
            break;
        case 'same_top':
            top = targetPosition.top
            break;
        case 'same_bottom':
            top = targetPosition.top - (selfSize.height - targetSize.height)
            break;
        default:
            throw new Error(`Unsupported vertical position: ${vertical}`);
    }

    // 计算水平方向的放置点
    switch (horizontal) {
        case 'left':
            left = targetPosition.left - selfSize.width;
            break;
        case 'right':
            left = targetPosition.left + targetSize.width;
            break;
        case 'center':
            left = targetPosition.left + (targetSize.width / 2) - (selfSize.width / 2);
            break;
        case 'same_left':
            left = targetPosition.left
            break;
        case 'same_right':
            left = targetPosition.left - (selfSize.left - targetSize.left)
            break;
        default:
            throw new Error(`Unsupported horizontal position: ${horizontal}`);
    }

    return {top:top,left:left}
}


