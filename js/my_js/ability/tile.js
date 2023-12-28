//创建一个信息框(tile)
function createTile(name,object){
	var tile = $("<div>",{
		class:"tile",
		id:name,
	})

	if(object != undefined){
		$(tile).data("object",object)
	}
	
	//名称
	var tile_name = $("<div>",{class:"tile_top"})
	$(tile_name).text(name)
	//内容
	var tile_data = $("<div>",{class:"tile_data"})
	//按钮栏
	var tile_icon = $("<div>",{class:"tile_icon"})
	var tile_close = $("<div>",{class:"tileIcon close tile_close"})
	$(tile_icon).append(tile_close)

	$(tile).append(tile_name,tile_data,tile_icon)

	//放进页面中
	$("#main").append(tile)
	//赋予功能
	abilityTile(tile)
	createCube(tile)

	return tile
}

//为tile框赋予功能
function abilityTile(tile){
	//拖动
	$(tile).draggable({
		distance:30,
		start:function(){
			upToTop(tile)
		}
	})
	//大小调整
	$(tile).resizable({ 
		handles: "n, e, s, w ,ne,nw,se,sw" ,
	})
	//点击
	$(tile).on('click', function() {
		upToTop(tile)
	});
}

//点击关闭一个信息栏,实质是将其隐藏
$("#main").on("click",".tile .tile_icon .tile_close",function(){
	$(this).parents(".tile").hide()
})

//将制定tile显示在最上方
function upToTop(tile){
	$(tile).show()
	$(tile).css('z-index', '1');
	$('.tile').not(tile).css('z-index', '0');
}

//将数据填入指定的tile中,该操作会覆盖原本的数据
function dataTile(tileName,data){
	$("#"+tileName+" > .tile_data").html(data)
}


