
import { getFocusingBugNest } from "../../Object/BugNest.js"
import { startWork} from "../../Object/Work.js"
import { stateValue } from "../../State/State.js"
import { objectToDiv } from "../../Modules/objectDiv.js"
import { clearTileData } from "../../Modules/tile/tileData.js"
import { stateToDiv } from "../../Modules/stateDiv"
import { dataTile } from "../../Modules/tile/tile.js"
import { createRandomId } from "../../app/global_ability.js"
import { runObjectMovement } from "../../State/Movement.js"

//点击一个工作栏弹出选择虫群对象的子页面
export function showWorkMenu(){
	//显示菜单,将菜单与work对象绑定
	$("#工作_menu").toggle()
	//更新workMenu中的内容
	updateWorkMenu()
}

//更新workMenu中的内容，向其中添加对应的addWork_div
function updateWorkMenu(){
	//清空
  	clearTileData($("#工作_menu"))
	// 获取虫巢，遍历其中的[已解锁→工作]
	const bugNest = $("#工作").data("object")
	let data_div = $("<div></div>")
	for(let work of bugNest.已解锁.工作){
		//不会显示[进行中]==true的工作，如果这个工作的[功能→独立]=true，也会显示
		//如果这个工作可以显示,则在其中显示它
		if(work.进行中 != true && work.功能.显示 != false && work.功能.新增 != false){
			//做成div加进去
			const addWork_div = createAddWorkDiv(work)
			data_div.append(addWork_div)
		}
	}
	dataTile($("#工作_menu"),data_div)
}

//将work对象做成addWorkMenu的div
export function createAddWorkDiv(work){
	//内容包含工作需求，工作进度
	const 需求div = stateToDiv(work,"需求",stateValue(work,"需求","stateObject"))
	const 进度div = stateToDiv(work,"进度",stateValue(work,"进度","stateObject"))
	//制作对象div和属性div
	const object_div = objectToDiv(work)
	const 属性div = $(`<div></div>`)
		.append(需求div,进度div)
	//放进去
	const workDiv = $(`<div class="addWork_div">`)
		.append(object_div,属性div)
		//将工作对象存储进去，以便获取到对应的work对象
		.data("work",work)	

	// 若该事务具备“选择”属性，则创建事务选择div
	if(work.功能.选择){
		const 选择div = $(`<div class="btn addWorkDiv_选择">选择</div>`)
		//为其赋予一个随机id,用于部分选择事务
			.attr("choose_id",createRandomId(8))
		//点击这个选择div时，触发事务的“选择”行为
		$(选择div).on("click",function(e){
			e.stopPropagation()
			runObjectMovement(work,"选择",this)
		})
		$(workDiv).append(选择div)
	}

	return workDiv
}

//点击工作Menu中的addWork_div,令对应的工作开始
$("#main").on("click","#工作_menu .addWork_div",function(){
	const bugNest = $("#工作").data("object")
	const work = $(this).data("work")
	//在当前聚焦的【虫巢】中开始这个【工作】,如果失败了则返回false
	if(!startWork(bugNest,work)){
		return false
	}
	//如果这个工作不是“独立”的，则令这个addMenuDiv删除
	if(work.功能.独立 != true){
		$(this).remove()
	}
})
