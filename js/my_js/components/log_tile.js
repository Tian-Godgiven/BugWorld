//创建日志栏
function createLog(){
	createTile("日志")
	var log_clear = $("<div>",{class:"tileIcon clear log_clear"})
	$("#日志.tile .tile_icon").prepend(log_clear)
}

//向日志中添加信息
function appendLog(information){
	var container = $("<div>",{class:"log_information"})
	for(i in information){
		var tmp = information[i]
		//如果这是一个对象
		if(typeof tmp == "object"){
			//将这个对象改造为一个绑定了对象内容的<span>
			var log_inner = $("<span>",{class:"object object_name"})
			$(log_inner).data("object",tmp)
			$(log_inner).html(getState(tmp,"名称"))
		}
		//如果这不是一个对象，而是一个字符串
		else{
			var log_inner = $("<span>",{
				text:tmp
			})
		}
		container.append(log_inner)
	}
	$("#日志.tile .tile_data").append(container)
}

//清空日志
$(document).on("click",".log_clear",function(){
	$("#日志.tile .tile_data").empty()
})