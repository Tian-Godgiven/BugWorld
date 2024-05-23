import Work_lib from "../library/Work/Work_lib.json"
import * as Work_func_lib from "../library/Work/Work_func_lib.js"
import _ from "lodash"
import { error } from "jquery"
import { appendWorkTileDiv, updateWorkTileDiv } from "../Tiles/workTile"
import { runObjectFunction,countState, haveWork } from "../app/global_ability"
import { haveEntry } from "../State/Entry.js"
import { getState } from "../State/State.js"
import { changeState } from "../State/State.js"
import { getFreeBug, getOccupyBug, occupyBug, unoccupyBug } from "./Bug.js"
import { initObject } from "./Object.js"

class Work{
	constructor(){
		this.id = null;
		this.属性 = {
			名称 : null,
			进度 : null,
			效率 : 0,
			工作量 : 0,
			需求 : null,
			词条 : [],
			信息 : null,
			参与 : [],
			所属 : null
		};
		this.函数 = {};
		this.功能 = {
			"来源" : null,
			"显示" : true
		}
	}
}

//获取指定的【工作对象】的信息，用于生成“新增工作”菜单
export function getWorkObject(work_key){
	const work = new Work()
	const work_json = Work_lib[work_key]
	//初始化
	initObject(work,work_json.属性)
	console.log(work)
	Object.assign(work.功能 , work_json.功能)
	//将其与对应的函数绑定,通过深复制创建新的对象！否则对work的修改会影响到字典内的数据！
	work.函数 = _.cloneDeep(Work_func_lib[work_key])
	return work
}

//向【虫巢对象】添加【可进行工作】，这些工作会显示“工作Tile”的“新增工作”中
export function addAbleWorkToBugNest(bugNest,work_source,work_key){
	//判断该工作对象是否存在
	if(Work_lib[work_key]){
		//保存工作对象进内
		bugNest.工作.可进行工作[work_key] = work_source 
	}
	else{
		throw new error("该工作不存在")
	}
}

//令【虫巢】开始进行一个指定的【工作对象】,将其添加到【当前工作】中
export function startWork(bugNest,work){
	const 当前工作 = bugNest.工作.当前工作
	let work_name = getState(work,"名称")

	//如果该对象有[独一]词条
	if(haveEntry(work,"独一")){
		//若当前工作中已存在该对象，不进行该工作
		if(Object.keys(当前工作).includes(work_name)){
			return false
		}
	}
	//如果不存在[独一]词条，则按顺序添加XXX1、2、3、4等名称
	else{
		//保存原始的work_name
		const temp = work_name
		work_name = work_name + "1"
		let i = 1
		while(Object.keys(当前工作).includes(work_name)){
			i += 1
			work_name = temp + i
		}
		changeState(work,"名称",work_name)
	}
	
	//将工作添加进虫巢的“当前工作”中
	bugNest.工作.当前工作[work_name] = work
	//将虫巢作为工作的“所属”
	changeState(work,"所属",bugNest)
	//同时将其加入工作Tile的work_container中
	appendWorkTileDiv(work)
	//最后，执行这个【工作】的"开始"函数
	runObjectFunction(work,"开始",work)
}

//结束工作对象，从其所属的【虫巢】的 “当前工作” 中删除这个【工作】
export function stopWork(work){
	//令所有参与这个工作的对象辞职
	var 参与 = getState(work,"参与")
	const work_name = getState(work,"名称")
	//倒序辞职，因为每一次辞职都会使参与列表缩短
	for(var i = 参与.length - 1; i>=0 ; i--){
		var bug = 参与[i]
		var work_num = getOccupyBug(bug,work_name)
		resignWork(bug,work_num,work)
	}
	//获取所属的虫巢对象
	const bugNest = getState(work,"所属")
	//从虫巢的当前工作中的删除这个工作对象
	delete bugNest.工作.当前工作[work_name]
	//删除这个工作对象
	work = null
}

// 令指定数量的【虫群对象】的参与指定的【工作对象】，虫群对象被占有，工作对象获得参与，并计算效率
export function joinWork(bug,num,work){
	const bugNest = getState(bug,"所属")
	//若指定的【工作】不属于【虫群对象所在的】【虫巢】,则退出
	if(getState(work,"所属") != bugNest){
		console.log("不存在指定工作，虫群对象无法参与！")
		return false
	}

	//【虫群对象】符合【工作】的需求函数
	if(runObjectFunction(work,"需求",bug)){
		const work_name = getState(work,"名称")
		const free_num = getFreeBug(bug)
		//并且指定的数量 <= 虫群对象空闲的数量
		if(num <=  free_num){
			//如果是第一次参加，将该【虫群单位】保存在work的参与属性当中
			if(!_.some(work.属性.参与,bug)){
				work.属性.参与.push(bug)
			}

			//占有指定数量的虫群单位
			occupyBug(bug,num,work,work_name)
			
			//计算新增的对象所提供的工作效率，保存在属性当中
			var add_效率 = runObjectFunction(work,"效率",bug) * num
			var new_效率 = countState(work,"效率",add_效率)
			changeState(work,"效率",new_效率)

			//更新对对应的【工作对象】信息div
			updateWorkTileDiv($("#" + work_name))
		}
	}
}

//令指定虫群对象的指定个数退出指定的工作
export function resignWork(bug,num,work){
	//对象要具备这个工作
	if(haveWork(bug,work)){
		const work_name = getState(work,"名称")
		const work_num = getOccupyBug(bug,work_name)
		//辞职数不会超过工作数量
		if(num > work_num){
			num = work_num
		}
		//令这个对象被该工作占有的数量减少num
		unoccupyBug(bug,num,work_name)
		//如果减少的数量 = 工作的数量，则所有对应的对象从中辞职，删除对应的work中的“参与"标识
		if(num == work_num){
			const tmp = _.findIndex(work.属性.参与,bug)
			delete work.属性.参与[tmp]
		}
		
		//计算因对象减少而减少的工作效率
		var sub_效率 =  - runObjectFunction(work,"效率",bug) * num
		var new_效率 = countState(work,"效率",sub_效率)
		changeState(work,"效率",new_效率)

		//更新对对应的【工作对象】信息div
		updateWorkTileDiv($("#" + work_name))
	}
}


