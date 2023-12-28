function createCube(tile){
	var name = $(tile).attr("id")
	var cube = $("<div>",{
		class:"cube",
		id:name
	})
	$(cube).text(name)
	$(cube).data("tile",tile)
	$("#cube_container").append(cube)
	abilityCube(cube)
}

function abilityCube(cube){
	//点击cube时，令对应的tile显示在最上层，若对应的tile已经显示了，则令其隐藏
	$(cube).on("click",function(){
		var tile = $(cube).data("tile")
		var shown = $(tile).css("display")
		if(shown == "none"){
			$(tile).show()
			upToTop(tile)
		}
		else if(shown == "block"){
			$(tile).hide()
		}
		
	})
}	

