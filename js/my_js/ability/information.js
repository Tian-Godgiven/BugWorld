//创建信息栏，一个显示指定信息的tile
function createInformation(name,inner,object){
	if(object != undefined){
		appendLog(["信息：",object])
	}
	const the_tile = $('.tile[name = '+name+']');
	//如果已经存在对应id的tile，则令其显示在页面最上方
	if(the_tile.length > 0){
	 	upToTop(the_tile)
	} 
	//否则就创建一个新的tile
	else {
		//创建一个information tile
		var tile = $("<div>",{
			class:"tile information",
			name:name,
		})

		$(tile).data("object",object)
		
		//名称
		var tile_name = $("<div>",{class:"tile_top"})
		$(tile_name).text(name)
		//内容
		var tile_data = $("<div>",{class:"tile_data"})
		tile_data.append(inner)
		//按钮栏
		var tile_icon = $("<div>",{class:"tile_icon"})
		var tile_close = $("<div>",{class:"tileIcon close information_close"})
		$(tile_icon).append(tile_close)

		$(tile).append(tile_name,tile_data,tile_icon)

		//根据信息内容量，调整信息框高度
		if(typeof inner == "string"){
			var height = 100 + inner.length + "px"
			$(tile).css("height",height)
		}

		//放进页面中
		$("#main").append(tile)
		//赋予功能
		abilityTile(tile)
	}
}

//点击右上角删除信息栏
$(document).on("click",".information_close",function(){
	$(this).parents(".information").remove()
})



//点击一个state，显示与其有关的内容
$(document).on("click",".state_name",function(event){
	var state_name = $(this).attr("name")
	var object = $(this).parents('.tile').data("object")
	var type = object.constructor.name;
	var inner = getGlobalInformation(type,state_name)
	createInformation(state_name,inner)
})

//点击一个对象，根据其种类显示不同的内容
$(document).on("click",".object_name",function(event){
	event.stopPropagation()
	var object = $(this).data("object")
	//虫族对象（bug）
	if(object instanceof Bug){
		var name = getState(object,"名称")
		var information = stateIntoDiv(object)
	}
	else if(object instanceof Characteristic){
		var name = "「"+ getState(object,"名称") +"」"
		var information = getState(object,"信息")
	}
	else{
		var name = getState(object,"名称")
		var information = stateIntoDiv(object)
	}
	
	createInformation(name,information,object)
})



