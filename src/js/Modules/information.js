//信息组件，当点击一个object对象时，创建一个信息框，并显示其中的内容
import Information_lib from "../library/Information_lib.json"

import { appendLog } from "../Tiles/log";
import { stateIntoTileData } from "../app/global_ability";
import { getState } from "../State/State";
import { abilityTile, upToTop } from "./tile";

//创建信息栏，一个显示指定信息的tile
function createInformation(name,inner,object){
	//如果已经存在对应id的tile，则令其显示在页面最上方
	const the_tile = $('.tile[name = '+name+']');
	if(the_tile.length > 0){
	 	upToTop(the_tile)
	} 
	//否则就创建一个新的information
	else {
		//创建一个information tile
		var tile = $(`
			<div class="tile information" name=${name}>
				<div class='tile_name'>${name}</div>
				<div class='tile_data'></div>
				<div class="tile_button_container">
					<div class="information_button button close_btn"></div>
				</div>
			</div>`)
		tile.children(".tile_data").append(inner)

		//在日志栏里加入一项提示信息
		if(object != undefined){
			appendLog(["信息：",object])
			$(tile).data("object",object)
		}

		//根据信息内容量，调整信息框高度
		if(typeof inner == "string"){
			var height = 100 + inner.length + "px"
			$(tile).css("height",height)
		}
		//放进页面中
		$("#tile_container").append(tile)
		//赋予功能
		abilityTile(tile)
		//显示在最前面
		upToTop(tile)
	}
}

//点击删除键，删除信息栏，而非隐藏
$(document).on("click",".information_button.close_btn",function(){
	$(this).parents(".information").remove()
})



//点击一个属性名，显示与其有关的介绍信息
$("#main").on("click",".state > div:first-child",function(event){
	event.stopPropagation()
	var state_name = $(this).text().replace("：","")
	var information = Information_lib[state_name]
	createInformation(state_name,information)
})

//显示与一个对象有关的information
export function showInformation(object){
	var name = getState(object,"名称")
	var information = stateIntoTileData(object)
	createInformation(name,information,object)
}


