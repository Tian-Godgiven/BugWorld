import { objectToDiv } from "../../Modules/objectDiv"
import { dataTile } from "../../Modules/tile/tile"
import { stateToDiv } from "../../Modules/tile/tileData"
import { createFacilityWork } from "../../Object/Facility"
import { startWork, stopWork } from "../../Object/Work"
import { runObjectMovement } from "../../State/Movement"
import { getStateUnit, stateValue } from "../../State/State"
import Facility_Work_lib from "../../library/Facility/Facility_Work_lib.json"
import { createAddWorkDiv } from "../work_tile/workMenu"

//显示设施menu
export function showFacilityMenu(facility){
	const 设施menu = $("#设施_menu")
	if(设施menu.data("object")==facility && 设施menu.css("display") != "none"){
		设施menu.hide()
	}
	else{
		设施menu.show()
		设施menu.data("object",facility)
		updateFacilityMenu(facility)
	}
}

export function updateFacilityMenu(facility){
	$("#设施_menu").children(".tile_name").text(`控制→${stateValue(facility,"名称")}`)
	//根据设施对象的功能，创建相应的菜单Div
	const container = $(`<div class="facilityMenu_container"></div>`)
	//操作
	if(facility.功能.操作){
		//创建各个操作的按键
		const 操作 = facility.行为.操作
		const 操作container = $(`<div class="facilityMenu_div"><span>操作</span></div>`)
		const 操作btnContainer = $(`<div class="facilityMenu_btnContainer"></div>`)
		if(操作){
			for(let key in 操作){
				//生成一个按键，点击时触发对应的“操作”行为
				const button = $(`<div class="button">${key}</div>`)
				$(button).on("click",function(){
					runObjectMovement(facility,["操作",key])
				})
				操作btnContainer.append(button)
			}
		}
		操作container.append(操作btnContainer)
		container.append(操作container)
	}
	//升级
	if(facility.功能.升级){
		const 升级container = $(`<div class="facilityMenu_div"><span>升级</span></div>`)
		for(let 升级work of facility.工作.升级){
			//创建一个workDiv
			const 升级div = createFacilityMenuWorkDiv(升级work)
			升级container.append(升级div)
		}
		container.append(升级container)
	}
	//拆除
	if(facility.功能.拆除!==false){
		const 拆除container = $(`<div class="facilityMenu_div"><span>拆除</span></div>`)
		const 拆除work = facility.工作.拆除
		//创建一个workDiv
		const 拆除div = createFacilityMenuWorkDiv(拆除work)
		拆除container.append(拆除div)
		container.append(拆除container)
	}
	//加载数据
	dataTile($("#设施_menu"),container)
}

//创建设施Menu中的workDiv
function createFacilityMenuWorkDiv(work){
	const facility = $("#设施_menu").data("object")
	const bugNest = stateValue(facility,"所属")
	const 进度div = stateToDiv(work,"进度",stateValue(work,"进度","stateObject"))
	let 属性div = $("<div></div>")
	let btn
	//判断这个工作是否在进行中,若正在进行
	if(work.进行中 == true){
		//属性div：
		const 效率div = $(`<div class="state">效率：${work.总效率 + getStateUnit(work,"效率")}</div>`)
		// 填充属性div
		属性div.append(效率div,进度div)
		//“结束工作”按键
		btn = $(`<div class="button">结束</div>`)
		//点击后,尝试开始这个工作，若成功开始该工作，则刷新这个设施menu
		$(btn).on("click",function(){
			if(stopWork(work)){
				updateFacilityMenu(facility)
			}
		})
	}
	//若并未进行
	else if(work.进行中 == false){
		//填充属性Div:
		const 需求div = stateToDiv(work,"需求",stateValue(work,"需求","stateObject"))
		属性div.append(需求div,进度div)
		//为其添加“开始工作”按键
		btn = $(`<div class="button">开始</div>`)
		//点击后,尝试开始这个工作，若成功开始该工作，则刷新这个设施menu
		$(btn).on("click",function(){
			if(startWork(bugNest,work)){
				updateFacilityMenu(facility)
			}
		})
	}

	//创建一个工作Div
	const workDiv = $(`<div class="facilityMenu_workDiv"></div>`)
		.append(objectToDiv(work),属性div,btn)
	return workDiv
}

