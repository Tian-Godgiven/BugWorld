import { createLogTile } from '../Tiles/logTile.js'
import { createBugNestTile } from "../Tiles/bugNestTile.js"
import { createBugGroupTile } from '../Tiles/bugGroupTile.js'
import { createWorkTile } from "../Tiles/work_tile/workTile.js"
import { createOrderTile } from '../Tiles/order_tile/orderTile.js'
import { createFacilityTile, updateFacilityTile } from '../Tiles/facility_tile/facilityTile.js'

import { createArea } from '../Object/Area.js'
import { createBug } from '../Object/Bug.js'
import { addFacilityToBugNest, bugJoinToBugNest, createBugNest, moveToBugNest } from '../Object/BugNest.js'
import { addWorkToBugNest, joinWork} from '../Object/Work.js'
import { createFacilityObject } from '../Object/Facility.js'
import { createChooseTile } from '../Tiles/chooseTile.js'


export function start(){
	//创建日志栏
	createLogTile()
	//创建区域
	const area = createArea("normal","测试")
	//在区域内创建一座虫巢并移动过去
	let bugNest = createBugNest("genisis-nest","测试")
	createBugNestTile(bugNest)
	moveToBugNest(bugNest)
	//创建虫群信息栏
	createBugGroupTile(bugNest)

	//为虫巢创建一位虫后，并将她安置入巢
	let Queen = createBug("虫后",2,"测试")
	let Worker = createBug("工虫",10,"测试")
	let Soldier = createBug("兵虫",10,"测试")
	

	bugJoinToBugNest(Queen,bugNest)
	bugJoinToBugNest(Worker,bugNest)
	//重复加入测试
	let Worker2 = createBug("工虫",10,"测试")
	bugJoinToBugNest(Worker2,bugNest)
	bugJoinToBugNest(Soldier,bugNest)
	

	//令虫巢可以进行这些工作
	const find_food = addWorkToBugNest(bugNest,bugNest,"觅食")
	const adventure = addWorkToBugNest(bugNest,bugNest,"探索")
	const feed = addWorkToBugNest(bugNest,bugNest,"哺育")
	const build = addWorkToBugNest(bugNest,bugNest,"修建设施")
	// addAbleWorkToBugNest(bugNest,bugNest,"建设孵化室")

	//创建工作信息栏
	// createWorkTile(bugNest)

	//测试：安排工虫参与工作
	joinWork(Worker,5,find_food)
	joinWork(Worker,2,adventure)
	joinWork(Soldier,3,adventure)
	joinWork(Queen,2,feed)

	//测试，创建一个选择Tile
	const choose_inner = $("<div>进行选择吧！</div>") 
	const choices = [
		{
			选项内容:"是",
			选项事件:{
				选择时:function(){
					return "是"
				}
			}
		},{
			选项内容:"不是捏",
			选项事件:{
				选择时:function(){
					return "nope"
				}
			}
		}
	]
	const choose_ability = {
		确认:false,
		取消:false
	}
	createChooseTile("选择",choose_inner,choices,choose_ability)
		.then((value)=>{
			console.log("123")
			console.log(value)
		})


	//创建命令信息栏
	createOrderTile(bugNest)

	//创建设施信息栏
	createFacilityTile(bugNest)
	updateFacilityTile(bugNest)

	//为虫巢添加一些设施
	var facility = createFacilityObject("虫母室",1,"测试")
	addFacilityToBugNest(facility,bugNest)
	var facility2 = createFacilityObject("孵化室",1,"测试")
	addFacilityToBugNest(facility2,bugNest)

	// //创建建设信息栏
	// createBuildTile(bugNest)
}

