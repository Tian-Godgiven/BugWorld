import 'jquery-ui/ui/widgets/draggable'
import 'jquery-ui/ui/widgets/droppable'
import 'jquery-ui/ui/widgets/resizable'

import '../Modules/information'

import "../../css/components/tile.css"
import "../../css/components/cube.css"

//创建一个信息框(tile)
export function createTile(name,object,buttons){
	var tile = $(`<div class="tile" id="${name}">
					 <div class="tile_name">${name}</div>
					 <div class="tile_data"></div>
					<div class="tile_button_container">
						<div class="tile_button button close_btn"></div>
					</div>
				  </div>`)

	//将传入的对象与其绑定
	if(object != undefined){
		$(tile).data("object",object)
	}
	
	//根据指定生成特殊按键
	if(buttons && buttons.includes("clear")){
		const clear_button = "<div class='tile_button button clear_btn'></div>"
		tile.children(".tile_button_container").prepend(clear_button)
	}

	//赋予功能
	abilityTile(tile)
	//创建对应的cube
	createCube(tile)
	//放进页面中
	$("#tile_container").append(tile)

	return tile
}
//创建一个信息框菜单(tile_menu)
export function createTileMenu(name,tile,buttons){
	const tile_name = $(tile).attr("id")
	const tile_menu = $(`<div class="tile_menu" id="${tile_name}_menu">
					 <div class="tile_name">${name}</div>
					 <div class="tile_data"></div>
					<div class="tile_button_container">
						<div class="tile_button button close_btn"></div>
					</div>
				  </div>`)
	//放入对应的磁贴中
	$(tile).append(tile_menu)
	$(tile_menu).resizable()
}

//使得tile_container可以被tile吸附
$("#tile_container").draggable()
$("#tile_container").draggable("disable")
//为tile框赋予功能
export function abilityTile(tile){
	//拖动
	$(tile).draggable({
		scroll:false,
		snap:true,
		snapTolerance:15,
		stack:".tile",
		start:function(){
			upToTop(tile)
		}
	})
	$(tile).resizable({
		stack:".tile"
	})
	//点击
	$(tile).on('mousedown', function() {
		upToTop(tile)
	});
}

//点击关闭一个信息栏或一个信息菜单栏
$("#main").on("click",".tile_button.close_btn",function(event){
	event.stopPropagation();
	$(this).parent().parent().hide()
})

//将指定的tile显示在最上方
export function upToTop(tile){
	let highestZIndex = 0;
    $('.tile').each(function() {
      	const zIndex = parseInt($(this).css('z-index'));
      	highestZIndex = Math.max(highestZIndex, zIndex);
    });

    $(tile).show().css('z-index', highestZIndex + 1);
}

//将数据填入指定的tile中,该操作会覆盖原本的数据
export function dataTile(tileName,data){
	$("#"+tileName+" > .tile_data").html(data)
}


//创建cube，每一个磁贴都对应了一个cube
function createCube(tile){
	const name = $(tile).attr("id")
	const cube = $(`<div class='cube' id=${name}>${name}</div>`)
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


