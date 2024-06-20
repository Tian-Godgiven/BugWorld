import 'jquery-ui/ui/widgets/draggable'
import 'jquery-ui/ui/widgets/droppable'
import 'jquery-ui/ui/widgets/resizable'

import '../information'
import './tileButton'
import "../../../css/tile/tile.css"
import "../../../css/tile/cube.css"

//创建一个信息框(tile)
export function createTile(name,inner,ability){
	const tile = $(`<div class="tile" id="${name}">
					<div class="tile_name">${name}</div>
					<div class="tile_data"></div>
					<div class="tile_button_container"></div>
				  </div>`)
	//如果传入的inner不为空，则将对应的数据填充给Tile
	if(inner){
		dataTile(tile,inner)
	}	
	//为tile设置功能
	abilityTile(tile,ability)
	//放进页面中
	$("#tile_container").append(tile)
	//显示在最前面
	upToTop(tile)

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

//为tile框赋予功能:拖动，调整尺寸，点击移动到最前方
export function abilityTile(tile,ability){
	const btn_container = tile.children(".tile_button_container")
	//关闭按键
		const 关闭方式 = ability.关闭
		if(关闭方式){
			const close_btn = $(`<div class="tile_button button close_btn"></div>`)
				.attr("type",关闭方式)
			btn_container.prepend(close_btn)
		}
	//清空按键
		if(ability.清空){
			const clear_button = "<div class='tile_button button clear_btn'></div>"
			btn_container.prepend(clear_button)
		}
	//绑定对象
		const 对象 = ability.对象
		if(对象){
			$(tile).data("object",对象)
		}
	
	//拖动
		if(ability.拖动 != false){
			$(tile).draggable({
				scroll:false,
				snap:true,
				snapTolerance:15,
				stack:".tile",
				start:function(){
					upToTop(tile)
				}
			})
		}
	
	//修改尺寸
		if(ability.修改尺寸 != false){
			$(tile).resizable({
				stack:".tile"
			})
		}
	
	//位置
		if(ability.位置){
			if(ability.位置.left){
				$(tile).css("left",ability.位置.left)
			}
			if(ability.位置.top){
				$(tile).css("top",ability.位置.top)
			}
		}
	//尺寸
		if(ability.尺寸){
			if(ability.尺寸.width){
				$(tile).css("width",ability.尺寸.width)
			}
			if(ability.尺寸.height){
				$(tile).css("height",ability.尺寸.height)
			}
		}
		
	//标题居中
		if(ability.标题居中){
			$(tile).children(".tile_name").css("text-align","center")
		}
	//点击
		$(tile).on('mousedown', function() {
			upToTop(tile)
		});
}

//将指定的tile显示在最上方
export function upToTop(tile){
	let highestZIndex = 0;
    $('.tile').each(function() {
      	const zIndex = parseInt($(this).css('z-index'));
      	highestZIndex = Math.max(highestZIndex, zIndex);
    });

    $(tile).show().css('z-index', highestZIndex + 1);
}

//关闭Tile，触发其关闭函数
export function closeTile(tile){

}

//将数据填入指定的tile中,该操作会覆盖原本的数据
export function dataTile(tile,data){
	const tile_data = $(tile).children(".tile_data")
	$(tile_data).html(data)
}

$.fn.changeTileName = function (new_name){
	if($(this).is(".tile") || $(this).is(".tile_menu")){
		$(this).children(".tile_name").text(new_name)
	}
}


//创建cube，点击cube即可显示对应的磁贴
export function createCube(tile){
	const name = $(tile).attr("id")
	const cube = $(`<div class='cube' id=${name}>${name}</div>`)
	$("#cube_container").append(cube)
	//点击cube时，令对应的tile显示在最上层，若对应的tile已经显示了，则令其隐藏
	$(cube).on("click",function(){
		$(tile).show()
		upToTop(tile)
		//随后移除这个cube
		$(this).remove()
	})
}

//使得tile_container可以被tile吸附
$("#tile_container").draggable()
$("#tile_container").draggable("disable")
