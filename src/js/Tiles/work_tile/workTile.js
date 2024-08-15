import "../../../css/Tiles/workTile.css"
import { abilityTile, createTile, createTileMenu, rebindTileData } from "../../Modules/tile/tile.js"
import { getStateUnit, stateValue } from "../../State/State.js"
import { startWork, stopWork} from "../../Object/Work.js"
import { showInformation } from "../../Modules/information.js"
import { showWorkMenu} from "./workMenu.js"
import { objectToDiv } from "../../Modules/objectDiv.js"
import { stateToDiv } from "../../Modules/stateDiv"

let 工作Tile
//创建[工作]Tile，包含两个menu子元素
export function createWorkTile(bugNest){
	//创建一个Tile框体
	const ability = {
		关闭:"cube",
		对象:bugNest
	}
	//其数据栏用于放置"工作div放置栏"和"新增工作键"
	const inner = $(`<div class='flex' id='workTile_新增工作'>新增工作</div>\
					 <div id='workTile_container'></div>`)
	工作Tile = createTile("工作",inner,ability)
	updateWorkTile()

	//创建工作信息栏的子菜单
	createTileMenu("新增工作",工作Tile)
}

//更新“工作Tile”的内容
export function updateWorkTile(bugNest=null){
	//清空其中的workTile_container
	$("#workTile_container").empty()
	//遍历bugNest[进行中]的事务，添加对应workTileDiv进去
	if(bugNest){
		rebindTileData(工作Tile,"object",bugNest)
	}
	else{
		bugNest = $("#工作.tile").data("object")
	}

	for(let work of bugNest.进行中.工作){
		appendWorkTileDiv(work)
	}
}

//向[工作]Tile中添加一个工作div
export function appendWorkTileDiv(work){
	//创建一个workTile_div
	const workTile_div = createWorkTileDiv(work)
	//添加到#workTile_container中
	$("#workTile_container").prepend(workTile_div)
}

//创建一个承载【工作对象】信息的div并返回
export function createWorkTileDiv(work){
	//工作磁贴内，每一个【工作对象】的信息div,显示对应工作的对象的效率和进度
	const 进度div = stateToDiv(work,"进度",stateValue(work,"进度","stateObject"))
	const 效率div = $(`
		<div class="state">效率：${work.总效率 + getStateUnit(work,"效率")}</div>`)
	// 属性div
	const 属性div = $("<div></div>")
		.append(进度div,效率div)
	//依次包含工作对象的名称，进度+效率，对应的按键
	const workDiv = $(`<div class='workTile_div flex'></div>`)
		.append(objectToDiv(work),属性div,
			`<div class='button close_btn work_delete'></div>`)
		.data("work",work)
	// 返回这个div
	return workDiv
}

//点击删除键，令其对应的工作结束
$("#main").on("click",".work_delete",function(event){
	event.stopPropagation()
	const work = $(this).parent(".workTile_div").data("work")
	//令这个工作以“中断”方式结束
	stopWork(work,"中断")
})

//删除[data→work]为该工作的workDiv
export function deleteWorkTileDiv(work){
	$(工作Tile).find(".workTile_div").each(function(){
		if($(this).data("work") == work){
			//删除这个工作div
			$(this).remove()
			return true
		}
	})
	return false
}

//点击新增工作，弹出工作菜单
$("#main").on("click","#workTile_新增工作",function(){
	showWorkMenu()
})
