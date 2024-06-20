import Facility_lib from "../library/Facility/Facility_lib.json"
import Facility_Work_lib from "../library/Facility/Facility_Work_lib.json"
import * as Facility_func_lib from "../library/Facility/Facility_func_lib"
import * as Facility_Work_func_lib from "../library/Facility/Facility_Work_func_lib"
import { changeState, countState, pushToState, stateValue } from "../State/State"
import { initObject } from "./Object"
import { runObjectMovement } from "../State/Movement"
import { updateBugNestTile } from "../Tiles/bugNestTile"
import { updateFacilityTile } from "../Tiles/facility_tile/facilityTile"
import { appendLog } from "../Tiles/logTile"
import { createWork } from "./Work"


class Facility{
	constructor(){
		this.属性 = {
			数量 : 0,
			名称 : null,
			词条 : [],
			效果 : null,
			信息 : null,
			特性 : [],
			等级 : 0,
			所属 : null
		},
		this.行为 = {
			获得 : null,
			效果 : null,
			结算 : null,
			摧毁 : null
		},
		this.工作 = {}
	}
}

//创建一个设施对象并返回
export function createFacilityObject(facility_key,num,source,states){
	const facility = new Facility() 
	//初始化
	const json = Facility_lib[facility_key]
	const more_states = {
		数量 : num
	}
	Object.assign(more_states,states)
	const facility_func = _.cloneDeep(Facility_func_lib[facility_key])
	//绑定来源，函数，以及额外属性
	initObject(facility,source,json,facility_func,more_states)
	
	return facility
}

//创建一个设施对象的指定work对象并返回
export function createFacilityWork(facility,work_key){
	const facility_key = facility.key
	//获取对应的work信息
	const json = Facility_Work_lib[facility_key][work_key]
	const func = _.cloneDeep(Facility_Work_func_lib[facility_key][work_key])
	//创建work对象
	const work = createWork(null,facility,json,func)
	return work
}

//为虫巢对象解锁一个设施对象
export function addFacilityToBugNest(facility_key,source,bugNest){
	//判断该设施对象是否存在
	if(Facility_lib[facility_key]){
		//创建对应的设施对象
		const facility= createFacilityObject(facility_key,1,source)
		//保存【工作对象及其来源】到【虫巢对象】内
		bugNest.已解锁.设施.push(facility)
		//返回work对象
		return facility
	}
	else{
		throw new error("该设施不存在")
	}
}

//令虫巢获得指定设施
export function facilityJoinToBugNest(facility, bugNest) {
	//判断该虫巢是否满足添加设施对象的需求
	if (runObjectMovement(facility, "需求", bugNest, facility)) {
		//如果已有完全相同的对象，则令其数量增加Num个
		var 设施 = stateValue(bugNest, "设施")
		var index = 设施.indexOf(facility)
		if (index != -1) {
			//增加旧对象的数量
			var old_facility = 设施[index]
			var new_num = stateValue(facility, "数量") + stateValue(old_facility, "数量")
			changeState(old_facility, "数量", new_num)
		}

		//否则直接加入设施
		else {
			pushToState(bugNest, "设施", facility)
			//修改设施的所属
			changeState(facility, "所属", bugNest)
		}

		//触发该设施的获得行为
		runObjectMovement(facility, "获得", bugNest, facility)
		//日志输出
		appendLog([bugNest, "获得了", facility, "x" + stateValue(facility, "数量")])
		//刷新BugNest Tile显示
		updateBugNestTile(bugNest)
		updateFacilityTile(bugNest)
	}
}

//获得一个设施对象对应的工作



