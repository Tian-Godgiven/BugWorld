import "../../../css/modules/tile/tileButton.css"
import { createCube } from "./tile"

//关闭磁贴按键，点击后按设置隐藏或清除其所属的磁贴，并在下方显示一个cube
$("#main").on("click", ".tile_button.close_btn", function (event) {
	event.stopPropagation()
    
    const tile = $(this).parent().parent(".tile , .tile_menu")
    const type = $(this).attr("type")

    //隐藏
    if(type == "hide"){
        $(tile).hide()
    }
    //删除
    else if(type == "delete"){
        $(tile).remove()
    }
    //隐藏并创建cube
    else if(type == "cube"){
        $(tile).hide()
        createCube(tile)
    }
    
    
    
})

//返回一个可滑动按钮组件div
export function bindSlide(slide_control,slider,direction = "down",hide = true,slideTime = 200){
    $(slide_control).addClass("btn_slideControl")
        .data("slide_target",slider)
    $(slider).addClass("btn_slider")
             .data({
                "slide_direction":direction,
                "slide_time":slideTime
            })
    
    if(hide){
        $(slider).hide()
    }
    else{
        $(slider).show()
    }
}

//滑动按钮，点击后使得同一父元素下的btn_slider滑动
$("#main").on("click",".btn_slideControl",function(){
    const slider = $(this).data("slide_target")
    //根据slider拥有的方向值判断滑动方向
    const slide_direction = slider.data("slide_direction")
    const slide_time = slider.data("slide_time")
    if(!slide_time){
        slide_time = 200
    }
    //向下滑动
    if(slide_direction == "down"){
        $(slider).slideToggle(slide_time)
    }
    //向右滑动
    else if(slide_direction == "right"){
        $(slider).animate({width:"toggle"},slide_time)
    }
})


