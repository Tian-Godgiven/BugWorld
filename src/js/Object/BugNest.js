import BugNest_lib from "../library/BugNest/BugNest_lib.json"
import { runObjectFunction } from "../app/global_ability"
import { getState, pushToState } from "../State/State"
import { changeState } from "../State/State"
import {updateBugNestTile} from "../Tiles/bugNest"
import { appendLog } from "../Tiles/log"
import { updateFacilityTile } from "../Tiles/facilityTile"
import _ from "lodash"
import { initObject } from "./Object"

class BugNest{
	constructor(){
		this.属性 = {
			名称: null,
			参数: {},
			系数: {},
			虫群: [],
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
		this.工作 = {
			当前工作:{},
			可进行工作: {}
		}
		this.函数 = {}
	}
}

// 当前聚焦中的虫巢对象，即界面上显示的虫巢对象
let focusing_bugNest
// 返回当前聚焦中的虫巢对象
export function getFocusingBugNest(){
	return focusing_bugNest
}

//创建一个指定类型的虫巢对象
export function createBugNest(bugNest_key,states){
	//创建对象
	var bugNest = new BugNest()
	//初始化
	let bugNest_json = BugNest_lib[bugNest_key]
	initObject(bugNest,bugNest_json,states)

	return bugNest
}

//移动到指定的虫巢对象
export function moveToBugNest(bugNest){
	focusing_bugNest = bugNest
}

//令虫群单位加入虫巢
export function addBugToBugNest(bug,bugNest){
	//判断是否满足虫群单位进入虫巢的需求
	if(runObjectFunction(bug,"需求",bugNest)){
		//触发该对象的加入函数
		runObjectFunction(bug,"加入",bugNest)
		//日志输出
		appendLog([bug,"x"+getState(bug,"数量"), "进入了" , bugNest])
		//如果已有完全相同的对象，则令其数量增加Num个
		var bugGroup = getState(bugNest,"虫群")
		var index = bugGroup.indexOf(bug)
		if(index != -1){
			var old_bug = bugGroup[index]
			var old_num = getState(old_bug,"数量")
			changeState(old_bug,"数量",old_num + bug_num)
			//并令这个虫族对象删除
			bug = null
		}
		//否则直接加入虫群
		else{
			pushToState(bugNest,"虫群",bug)
			//修改虫群单位的所属
			changeState(bug,"所属",bugNest)
		}
		//修改BugNest Tile显示
		updateBugNestTile(bugNest)
	}
	else{
		//空间不足的情况下,无法进入虫巢
		appendLog([bugNest,"内部的空间不足,",bug,"无法进入",])
		return false
	}
}

//令虫巢获得指定设施
export function addFacilityToBugNest(facility,bugNest){
	//判断该虫巢是否满足添加设施对象的需求
	if(runObjectFunction(facility,"需求",bugNest,facility)){
		//如果已有完全相同的对象，则令其数量增加Num个
		var 设施 = getState(bugNest,"设施")
		var index = 设施.indexOf(facility)
		if(index != -1){
			//增加旧对象的数量
			var old_facility = 设施[index]
			var new_num = getState(facility,"数量") + getState(old_facility,"数量")
			changeState(old_facility,"数量",new_num)
		}
		//否则直接加入设施
		else{
			pushToState(bugNest,"设施",facility)
			//修改设施的所属
			changeState(facility,"所属",bugNest)
		}
		
		//触发该设施的获得函数
		runObjectFunction(facility,"获得",bugNest,facility)
		//日志输出
		appendLog([bugNest,"获得了",facility,"x"+getState(facility,"数量")])
		//刷新BugNest Tile显示
		updateBugNestTile(bugNest)
		updateFacilityTile(bugNest)
	}	
}

//占据【虫巢】的空间
export function occupyBugNestSpace(bugNest,object){
	//获取object对象占据的空间总量
	const occupy_space = getState(object,"占据")
	const object_num = getState(object,"数量")
	//向【虫巢】添加对应的影响
	
}



