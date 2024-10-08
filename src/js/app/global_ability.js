import _, { toNumber } from "lodash"
import { State } from "../State/State";


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
export function expandJsObject(target,more){
    //遍历more里的键
    for(const key in more){
        const value = more[key]
        //如果这个值是字典，则递归进入
        if(_.isObject(value) && !_.isArray(value) && value != null){
            //如果此时target内部不是字典，则令其为字典
            if(!target[key]){
                target[key] = {}
            }
            //递归进入
            expandJsObject(target[key],value)
        }
        //如果不是字典，则令其获得相同的值
        else{
            target[key] = value
        }
    }
    return target
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

//检索一个字符串内被指定符号括号所包围的内容最外围的内容并返回最外围的结束位置
export function getContentBetween(string,startIndex,startSymbol,endSymbol){
    //检索其中含有多少个“{”，并移动到最外层对应的“}”处，已获得￥{}内部的内容
    let num = 1
    let endIndex = null
    for(let j=1;j < string.length-startIndex; j++){
        //每有一个开始符号num+=1
        if(string[startIndex+1+j] == startSymbol){
            num++
        }
        //每有一个结束符号num-=1
        else if(string[startIndex+1+j] == endSymbol){
            num--
        }
        //如果num=0说明此时已经到了最外层的}了，此时的i+1+j就是它的位置
        if(num == 0){
            endIndex = startIndex+1+j
            break
        }
    }
    //如果end为空，则说明没有正确地闭合{}，报错
    if(!endIndex){
        throw new Error("这个字符串当中没有正确地闭合指定的括号：" + string +","+startSymbol+endSymbol)
    }
    //获取其中的内容
    const content = string.substring(startIndex+1,endIndex)
    return {content,endIndex}
}

//报错
export function newError(error_code, error_text_parts) {
    // 拼接所有文本部分
    console.error(...error_text_parts);
    throw new Error("错误代码：" + error_code);
}