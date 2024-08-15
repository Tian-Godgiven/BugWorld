//信息组件，当点击一个object对象时，创建一个信息框，并显示其中的内容
import Information_lib from "../library/Information_lib.json"

import { appendLog } from "../Tiles/logTile";
import { objectStateToTileData } from "./stateDiv";
import { stateValue } from "../State/State";
import { abilityTile, createTile, upToTop } from "./tile/tile";

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
		const ability = {
			关闭 : "delete",
			对象 : object
		}
		const tile = createTile(name,inner,ability)

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
		
	}
}


//点击一个属性div的第一个子Div(即属性名），显示与其有关的介绍信息
$("#main").on("click",".state > div:first-child",function(event){
	event.stopPropagation()
	console.log(this)
	var state_name = $(this).text().replace("：","")
	var information = Information_lib[state_name]
	createInformation(state_name,information)
})

//显示与一个对象有关的information
export function showInformation(object){
	var name = stateValue(object,"名称")
	var information = objectStateToTileData(object)
	createInformation(name,information,object)
}


