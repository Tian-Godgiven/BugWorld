import { createTile , createTileMenu } from "../../Modules/tile/tile.js"
import "../../../css/components/work.css"
import { getUnit } from "../../State/State.js"
import { stateValue } from "../../State/State.js"
import { stopWork } from "../../Object/Work.js"
import { showWorkTileMenu } from "./workTile_menu.js"

//创建[工作]Tile，包含两个menu子元素
export function createWorkTile(bugNest){
	//创建一个Tile框体
	var tile = createTile("工作",bugNest)
	//其数据栏用于放置"工作div放置栏"和"新增工作键"
	var data_div = $("<div class='data'>\
						  <div id='workTile_container'></div>\
						  <div class='workTile_div flex' id='新增工作'>新增工作</div>\
					  </div>")
	$(tile).children('.tile_data').append(data_div)
}

//向[工作]Tile中添加一个工作div
export function appendWorkTileDiv(work){
	//创建一个workTile_div
	const workTile_div = createWorkTileDiv(work)
	//添加到work_container中
	$("#workTile_container").append(workTile_div)
}

//创建一个承载【工作对象】信息的div并返回
function createWorkTileDiv(work){
	//工作磁贴内，每一个【工作对象】的信息div，以工作对象的名称为id
	var div = $(`<div class='workTile_div flex' id='${stateValue(work,"名称")}'></div>`)
	//绑定work对象
	$(div).data("work",work)
	//更新其中的内容
	updateWorkTileDiv(div)
	// 返回这个div
	return div
}

//更新一个work_div当中的内容，将work信息加载进内
export function updateWorkTileDiv(work_div){
	const work = $(work_div).data("work")
	
	//依次包含工作对象的名称，进度+效率，对应的按键
	$(work_div).html(`
		<div class='object'>
			<div class='object_name bold'>${名称}</div>
		</div>
		<div>
			<div>${进度}</div>
			<div>${效率}</div>
		</div>
		<div class='button close_btn work_delete'></div>
	`)
}

//点击删除键，删除对应的工作Div，令其对应的工作取消
$("#main").on("click",".work_delete",function(event){
	event.stopPropagation()
	deleteWorkTileDiv($(this).parent(".workTile_div"))
})

//删除工作div
function deleteWorkTileDiv(work_div){
	const work = work_div.data("work")

	//如果当前正在显示这个work对象的menu，则令其清空
	if(work == $("#工作_menu").data("work")){
		$("#工作_menu .tile_data").empty();
	}

	//令这个工作从虫巢中结束
	stopWork(work)
	//删除这个工作div
	$(work_div).remove()
}

//点击一个工作div，弹出工作菜单，并用对应的work更新其中的内容
$("#main").on("click",".workTile_div",function(){
	showWorkTileMenu(this)
})
