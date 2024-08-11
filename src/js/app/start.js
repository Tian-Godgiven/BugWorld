import { createLogTile } from '../Tiles/logTile.js'
import { createBugNestTile } from "../Tiles/bugNestTile.js"
import { createBugGroupTile } from '../Tiles/bugGroupTile.js'
import { createWorkTile } from "../Tiles/work_tile/workTile.js"
import { createOrderTile } from '../Tiles/order_tile/orderTile.js'
import { createFacilityTile, updateFacilityTile } from '../Tiles/facility_tile/facilityTile.js'

import { bugNestJoinArea, createArea } from '../Object/Area.js'
import { createBug } from '../Object/Bug.js'
import { bugJoinToBugNest, createBugNest, moveToBugNest } from '../Object/BugNest.js'
import { createFacility, facilityJoinToBugNest, unlockFacilityBuildWorkToBugNest, unlockFacilityToBugNest } from "../Object/Facility.js"
import { unlockWorkToBugNest, joinWork, startWork} from '../Object/Work.js'
import { addAbleFacilityToBugNest, createFacilityObject } from '../Object/Facility.js'
import { createChooseTile } from '../Tiles/chooseTile.js'
import { createEventTile } from '../Tiles/event_tile/eventTile.js'
import { createEvent, startEvent } from '../Object/Event.js'
import { random } from 'lodash'


export function start(){
	//创建日志栏
	createLogTile()
	//创建区域
	const area = createArea("平原","测试")
	//在区域内创建一座虫巢并移动过去
	let bugNest = createBugNest("genisis-nest","测试")
	bugNestJoinArea(bugNest,area)
	moveToBugNest(bugNest)

	//创建虫巢和虫群信息栏
	createBugNestTile(bugNest)
	createBugGroupTile(bugNest)

	//为虫巢创建一位虫后，并将她安置入巢
	let Queen = createBug("虫后",2,"测试")
	let Worker = createBug("工虫",10,"测试")
	//重复加入测试
	let Worker2 = createBug("工虫",10,"测试")
	let Soldier = createBug("兵虫",10,"测试")
	
	bugJoinToBugNest(Queen,bugNest)
	bugJoinToBugNest(Worker,bugNest)
	bugJoinToBugNest(Worker2,bugNest)
	bugJoinToBugNest(Soldier,bugNest)
	
	//为虫巢解锁这些工作
	unlockWorkToBugNest("觅食",bugNest,bugNest)
	unlockWorkToBugNest("探索",bugNest,bugNest)
	unlockWorkToBugNest("哺育",bugNest,bugNest)
	unlockWorkToBugNest("修建设施",bugNest,bugNest)

	//创建工作信息栏
	createWorkTile(bugNest)

	//开始这些工作
	const findFood = startWork(bugNest,"觅食")
	const adventure1 = startWork(bugNest,"探索")
	const adventure2 = startWork(bugNest,"探索")
	const feed = startWork(bugNest,"哺育")

	//测试：安排工虫参与工作
	joinWork(Worker,5,findFood)
	joinWork(Worker,2,adventure1)
	joinWork(Soldier,3,adventure2)
	joinWork(Queen,2,feed)

	//创建命令信息栏
	createOrderTile(bugNest)

	// 添加可修建设施
	unlockFacilityToBugNest("虫母室","测试",bugNest)
	unlockFacilityToBugNest("孵化室","测试",bugNest)

	//为虫巢添加一些设施
	var facility = createFacility("虫母室","测试",1)
	var facility2 = createFacility("孵化室","测试",1)
	//令其加入虫巢
	facilityJoinToBugNest(facility,bugNest)
	facilityJoinToBugNest(facility2,bugNest)

	// 创建设施信息栏
	createFacilityTile(bugNest)

	//创建一个事件
	const event1 = createEvent("虫群折损","测试")
	//令其开始
	const eventpower = random(1,10)
	startEvent(event1,bugNest,"测试",eventpower)

	//创建事件信息栏
	createEventTile(bugNest)

	

	// //创建建设信息栏
	// createBuildTile(bugNest)
}

