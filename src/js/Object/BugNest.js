import BugNest_lib from "../library/BugNest/BugNest_lib.json"
import {updateBugNestTile} from "../Tiles/bugNestTile"
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
			设施: {},
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
		this.已解锁 = {
			工作:[],
			设施建造:{}
		},
		this.进行中 = {
			事件:[],
			工作:[]
		}
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
export function createBugNest(bugNest_key,source,more_state){
	//创建对象
	var bugNest = new BugNest()
	//初始化
	const bugNest_json = BugNest_lib[bugNest_key]
	const bugNest_func = null
	initObject(bugNest,bugNest_key,source,bugNest_json,bugNest_func,more_state)

	return bugNest
}

//移动到指定的虫巢对象
export function moveToBugNest(bugNest){
	focusing_bugNest = bugNest
}

//令虫群对象加入虫巢
export function bugJoinToBugNest(bug,bugNest){
	if(bugJoinTo(bug,bugNest)){
		//刷新BugNest Tile显示
		updateBugNestTile(bugNest)
	}
}

