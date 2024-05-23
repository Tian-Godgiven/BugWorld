import Bug_lib from "../library/Bug/Bug_lib.json"
import * as Bug_func_lib from "../library/Bug/Bug_func_lib"

import { getState } from "../State/State";
import { changeState } from "../State/State";
import { error } from "jquery";
import _, { assign } from "lodash"
import { bindObjectCharacteristic } from "./Characteristic";
import { addStateToObject, loadStatesToObject } from "../State/State";
import { initObject } from "./Object";

class Bug {
	constructor() {
	  	this.属性 = {
			名称 : null,
			数量 : null,
			所属 : null,
			参数 : {},
			系数 : {},
			特殊 : {},
			特性 : [],
			词条 : [],
			信息 : null,
			状态 : []
		};
		this.单位={
			寿命: "回合",
			占据: "空间",
			储备: "营养",
			生产: "营养/回合",
			消耗: "营养/回合",
			饥饿: "生命/回合",
			回复: "生命/回合"
		};
		this.函数={};
		this.占有={}
	}
}

//创建虫群对象
export function createBug(bug_key,num,states){
	let bug = new Bug()
	// 从lib中获取对象的属性数据
	let bug_json = Bug_lib[bug_key]
	// 初始化一些属性和参数
	const more_states = {
		数量 : num,
		参数 : {
			寿命 : {now : 1},
			生命 : {now : bug_json.参数.生命.max},
			储备 : {now : 0},
		}
	}
	// 将这个属性与传来的“修改属性”所连接
	Object.assign(more_states,states)
	// 初始化这个对象的属性
	initObject(bug,bug_json,more_states)


	//为【虫群对象】绑定【特性】
	bindObjectCharacteristic(bug)
	//为【虫群对象】绑定函数
	bug.函数 = _.cloneDeep(Bug_func_lib[bug_key])

	console.log(bug)

	return bug
}

//令虫群对象被一个来源所占有
// 变量解释：虫群对象，需要的数量，占有来源，占有的标识
export function occupyBug(bug,need_num,source,occupy_name){
	//占有数量不能大于空闲数量
	if(need_num > getFreeBug(bug)){
		console.log(`空闲的${getState(bug,"名称")}数量不足`)
		return false
	}

	//判断这个占有对象是否存在，如果已经存在，则增加其数量
	if(bug.占有.hasOwnProperty(occupy_name)){
		bug.占有[occupy_name].占有数量 += need_num
	}
	//否则制作一个占有对象
	else{
		const occupy = {
			占有数量:need_num,
			来源:source
		}
		//放入占有属性中
		bug.占有[occupy_name] = occupy
	}
}
//解除虫群对象的占用
export function unoccupyBug(bug,bug_num,occupy_name){
	const occupy = bug.占有[occupy_name]
	if(occupy == NaN){
		throw new error("123")
	}
	//减少对应的占有数量
	if(bug_num < occupy.占有数量){
		bug.占有[occupy_name].占有数量 -= bug_num
	}
	//删除对应的占用对象
	else if(bug_num == occupy.占有数量){
		delete bug.占有[occupy_name]
	}
	else{
		console.log("解除占用的数量错误！")
		return false
	}
}
//获得一个指定占有对应的占有信息
export function getOccupyBug(bug,occupy_name){
	if(bug.占有.hasOwnProperty(occupy_name)){
		return bug.占有[occupy_name].占有数量
	}
	else{
		return 0
	}
	
	
}
//获得一个虫群对象的未被占有的数量
export function getFreeBug(bug){
	let 数量 = getState(bug,"数量")
	//遍历其占有对象，依次减去被占有的数量
	for( let occupy in bug.占有){
		数量 -= bug.占有[occupy].占有数量
	}
	return 数量
}

//判断object对象的剩余空间属性是否满足让指定的虫群对象所占据
export function spaceEnoughForBug(bug,bugNest){
	var bug_num = getState(bug,"数量")
	let nest_space = getState(bugNest,"空间")
	var available_space = nest_space.max - nest_space.now
	//允许进入
	if(available_space >= getState(bug,"占据") * bug_num){
		return true
	}
	else{
		return false
	}
}
