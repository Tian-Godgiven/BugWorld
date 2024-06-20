import "../../css/modules/screen.css"

//创建一个背景黑屏，只有指定的dom结构才能显示在黑屏上方，其余dom结构无法显示在其上方
export function createBlackScreen(dom){
    //将黑屏元素添加进main
    const blackScreen = $(`<div id="blackScreen"></div>`)
    $("#main").append(blackScreen)

    // 为指定的dom结构添加类，使其在黑屏上方显示
    if(_.isArray(dom) && dom.length > 0){
        dom.forEach(element => {
            $(element).addClass("onBlackScreen")
        });
    }
    else{
        $(dom).addClass("onBlackScreen")
    }
}

//删除黑屏背景，同时删除所有黑屏之上的元素的onBlackScreen类
export function deleteBlackScreen(){
    $("#blackScreen").remove()
    $(".onBlackScreen").removeClass("onBlackScreen")
}

//黑屏会阻止对非其上的部分进行的点击等操作
$("#main").on("click","#blackScreen",function(e){
    e.stopPropagation()
})