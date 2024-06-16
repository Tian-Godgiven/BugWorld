import BugNest_lib from "../library/BugNest/BugNest_lib.json"
import { runObjectMovement } from "../State/Movement"
import { stateValue, pushToState } from "../State/State"
import { changeState } from "../State/State"
import {updateBugNestTile} from "../Tiles/bugNestTile"
import { appendLog } from "../Tiles/logTile"
import { updateFacilityTile } from "../Tiles/facility_tile/facilityTile"
import _ from "lodash"
import { initObject } from "./Object"
import { bugJoinTo } from "./Bug"

class BugNest{
	constructor(){
		this.属性 = {
			名称: null,
			参数: {},
			系数: {},
			虫群: {},
			设施: [],
			状态: [],
			特殊: {},
			特性: [],
			词条: [],
			信息: null,
			其他: []
		},
		this.单位 = {
			生产: "营养/回合",
			消耗: "营养/回合"
		},
		this.工作 = []
		this.行为 = {}
	}
}

// 当前聚焦中的虫巢对象，即界面上显示的虫巢对象
let focusing_bugNest
// 返回当前聚焦中的虫巢对象
export function getFocusingBugNest(){
	return focusing_bugNest
}

//创建一个指定类型的虫巢对象
export function createBugNest(bugNest_key,source,states){
	//创建对象
	var bugNest = new BugNest()
	//初始化
	const bugNest_state = BugNest_lib[bugNest_key]
	const bugNest_func = null
	initObject(bugNest,source,bugNest_state,bugNest_func,states)

	return bugNest
}

//移动到指定的虫巢对象
export function moveToBugNest(bugNest){
	focusing_bugNest = bugNest
}

//令虫巢获得指定设施
export function addFacilityToBugNest(facility,bugNest){
	//判断该虫巢是否满足添加设施对象的需求
	if(runObjectMovement(facility,"需求",bugNest,facility)){
		//如果已有完全相同的对象，则令其数量增加Num个
		var 设施 = stateValue(bugNest,"设施")
		var index = 设施.indexOf(facility)
		if(index != -1){
			//增加旧对象的数量
			var old_facility = 设施[index]
			var new_num = stateValue(facility,"数量") + stateValue(old_facility,"数量")
			changeState(old_facility,"数量",new_num)
		}
		//否则直接加入设施
		else{
			pushToState(bugNest,"设施",facility)
			//修改设施的所属
			changeState(facility,"所属",bugNest)
		}
		
		//触发该设施的获得行为
		runObjectMovement(facility,"获得",bugNest,facility)
		//日志输出
		appendLog([bugNest,"获得了",facility,"x"+stateValue(facility,"数量")])
		//刷新BugNest Tile显示
		updateBugNestTile(bugNest)
		updateFacilityTile(bugNest)
	}	
}

//令虫群对象加入虫巢
export function bugJoinToBugNest(bug,bugNest){
	if(bugJoinTo(bug,bugNest)){
		//刷新BugNest Tile显示
		updateBugNestTile(bugNest)
	}
}

