//创建一个信息框(tile)
function createTile(name,data){
	var tile = $("<div>",{
		class:"tile",
		id:name,
	})
	//创建子对象并放入Tile中
	var tile_name = $("<div>",{class:"tile_top"})
	var tile_data = $("<div>",{class:"tile_data"})
	$(tile).append(tile_name,tile_data)
	$(tile_name).text(name)
	$(tile_data).text(data)

	//放进页面中
	$("#main").append(tile)
	//赋予功能
	abilityTile(tile)
}

function abilityTile(tile){
	//拖动
	$(tile).draggable()
	//大小调整
	$(tile).resizable({ 
		handles: "n, e, s, w ,ne,nw,se,sw" ,
	})
}