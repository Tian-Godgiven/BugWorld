import Work_lib from "../library/Work/Work_lib.json"
import * as Work_func_lib from "../library/Work/Work_func_lib.js"
import _ from "lodash"
import { error } from "jquery"
import { appendWorkTileDiv, updateWorkTileDiv } from "../Tiles/work_tile/workTile"
import { runObjectMovement } from "../State/Movement.js"
import { haveEntry } from "../State/Entry.js"
import { stateValue, changeState, countState, getUnit } from "../State/State.js"
import { getFreeBug, getOccupyBug, occupyBug, unoccupyBug } from "./Bug.js"
import { initObject, loseSource } from "./Object.js"
import { haveOccupy } from "./Bug.js"

class Work{
	constructor(){
		this.id = null;
		this.属性 = {
			名称 : null,
			需求 : null,
			消耗 : null,
			进度 : null,
			效率 : 0,
			词条 : [],
			信息 : null,
		};
		this.行为 = {};
		this.功能 = {
			"来源" : null,
			"显示" : true
		}
	}
}

//获取指定的【工作对象】的信息，用于生成“新增工作”菜单
export function createWork(work_key,source){
	const work = new Work()
	const work_json = Work_lib[work_key]
	const work_func = _.cloneDeep(Work_func_lib[work_key])
	//初始化
	initObject(work,source,work_json.属性,work_func)
	Object.assign(work.功能 , work_json.功能)
	return work
}

//向【虫巢对象】内添加【工作对象】
export function addWorkToBugNest(bugNest,work_source,work_key){
	//判断该工作对象是否存在
	if(Work_lib[work_key]){
		//创建对应的工作对象
		const work = createWork(work_key,work_source)
		//保存【工作对象及其来源】到【虫巢对象】内
		bugNest.工作.push(work)
		//返回work对象
		return work
	}
	else{
		throw new error("该工作不存在")
	}
}

//从【虫巢对象】的[工作属性]中删除【工作对象】的来源
export function deleteWorkFrom(target,work_source,work){
	const able_work = target.工作
	//如果给定了工作对象，则直接删除其来源
	if(work){
		//如果删除来源后，对象的来源为空，则删除这个对象
		if(!loseSource(work,work_source)){
			const index = able_work.indexOf(work)
			able_work.splice(index,1)
		}
	}
	else{
		//遍历【虫群对象】的[工作]，删除其中的有着对应来源的工作的[来源]
		for(let work of able_work){
			const 来源 = stateValue(work,"来源")
			if(_.some(来源,work_source)){
				if(!loseSource(work,work_source)){
					//如果删除后，来源为空，则会从虫巢中删除该工作
					const index = able_work.indexOf(work)
					able_work.splice(index,1)
				}
			}
		}
	}
	
}

// 令指定数量的【虫群对象】的参与指定的【工作对象】，虫群对象被占有，工作对象获得参与，并计算效率
export function joinWork(bug,num,work){
	const bugNest = stateValue(bug,"所属")
	//若指定的【工作】不属于【虫群对象所在的】【虫巢】,则退出
	if(!_.some(bugNest.工作,work)){
		console.log("不存在指定工作，虫群对象无法参与！")
		return false
	}

	//【虫群对象】符合【工作】的需求行为的要求
	if(runObjectMovement(work,"需求",bug)){
		const free_num = getFreeBug(bug)
		//并且指定的数量 <= 虫群对象当前的空闲数量
		if(num <=  free_num){
			//令该工作占有指定数量的虫群单位
			occupyBug(bug,num,work)
		}
	}
}

//令指定虫群对象的指定个数退出指定的工作
export function resignWork(bug,num,work){
	//对象要具备这个工作
	if(haveOccupy(bug,work)){
		const work_num = getOccupyBug(bug,work)
		//辞职数不会超过工作数量
		if(num > work_num){
			num = work_num
		}
		//令这个对象被该工作占有的数量减少num
		unoccupyBug(bug,num,work)
	}
}

//计算一个事务计算后的效率并返回
export function countWorkEfficiency(work, object, num, type) {
    const 效率 = stateValue(work, "效率")
    if (效率) {
		//计算效率值
		let value = runObjectMovement(work,"效率",object) * num
        // 如果效率带有+-符号则返回值也会带有,除非效率为0
        if (/[+-]/.test(效率)) {
			if(value != 0){
				const simbol = value > 0 ? "+" : "-"
            	value = simbol + value
			}
        }

		if(type == "unit"){
			const unit = getUnit(work,"效率")
			if(unit){
				value += unit
			}
		}
        return value
    }
    return false
}


