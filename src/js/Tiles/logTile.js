import { createTile } from "../Modules/tile/tile.js"
import { objectToDiv } from "../Modules/objectDiv.js"
import "../../css/components/log.css"

//创建日志栏
export function createLogTile(){
	const ability = {
		关闭 : "cube",
		清空 : true
	}
	createTile("日志",null,ability)
}

//向日志中添加信息
export function appendLog(information){
	var container = $("<div>",{class:"log_div"})
	for(let i in information){
		var tmp = information[i]
		//如果tmp是一个对象
		if(_.isObject(tmp)){
			//将这个对象改造为一个绑定了对象内容的<span>
			var log_inner = objectToDiv(tmp)
		}
		//如果这不是一个对象，而是一个字符串
		else{
			var log_inner = tmp
		}
		container.append(log_inner)
	}
	$("#日志.tile .tile_data").append(container)
}

//清空日志
$(document).on("click","#日志.tile .tile_button.clear_btn",function(){
	$("#日志.tile .tile_data").empty()
})

