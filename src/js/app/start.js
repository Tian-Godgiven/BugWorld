import { createLogTile } from '../Tiles/log.js'
import { createBugNestTile } from "../Tiles/bugNest.js"
import { createBugGroupTile,updateBugGroupTile } from '../Tiles/bugGroup.js'
import { createWorkTile } from "../Tiles/workTile.js"

import { createArea } from '../Object/Area.js'
import { createBug } from '../Object/Bug.js'
import { addBugToBugNest, addFacilityToBugNest, createBugNest, moveToBugNest } from '../Object/BugNest.js'
import { addAbleWorkToBugNest, getWorkObject, startWork} from '../Object/Work.js'
import { createFacilityTile, updateFacilityTile } from '../Tiles/facilityTile.js'
import { createFacilityObject } from '../Object/Facility.js'

export function start(){
	//创建日志栏
	createLogTile()
	//创建区域
	const area = createArea("normal")
	//在区域内创建一座虫巢并移动过去
	let bugNest = createBugNest("genisis-nest")
	createBugNestTile(bugNest)
	moveToBugNest(bugNest)

	//为虫巢创建一位虫后，并将她安置入巢
	let Queen = createBug("虫后",2)
	let Worker = createBug("工虫",10)
	let Soldier = createBug("兵虫",10)
	addBugToBugNest(Queen,bugNest)
	addBugToBugNest(Worker,bugNest)
	addBugToBugNest(Soldier,bugNest)

	//创建虫群信息栏
	createBugGroupTile(bugNest)

	//令虫巢可以进行这些工作
	addAbleWorkToBugNest(bugNest,bugNest,"觅食")
	// addAbleWorkToBugNest(bugNest,bugNest,"建设孵化室")

	//创建工作信息栏
	createWorkTile(bugNest)
	//开始一个“觅食”工作
	const find_food = getWorkObject("觅食")
	startWork(bugNest,find_food)

	//创建设施信息栏
	createFacilityTile(bugNest)
	updateFacilityTile(bugNest)

	//为虫巢添加一些设施
	
	var facility = createFacilityObject("虫母室",1)
	addFacilityToBugNest(facility,bugNest)
	// var facility2 = createFacility("孵化室",1)
	// appendFacility(bugNest,facility2)


	// //创建建设信息栏
	// createBuildTile(bugNest)
}

