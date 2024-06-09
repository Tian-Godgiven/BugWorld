import { objectToDiv } from "../../Modules/objectDiv";
import { dataTile } from "../../Modules/tile/tile";
import { stateToDiv } from "../../Modules/tile/tileData";
import { getFreeBug } from "../../Object/Bug";
import { joinWork, resignWork } from "../../Object/Work";
import { runObjectMovement } from "../../State/Movement"
import { getUnit, stateValue } from "../../State/State"
import { countWorkEfficiency } from "../../Object/Work";
import { updateBugDiv, updateOrderTileBugDiv } from "./order_tile";

export function showOrderTileMenu(object,id,type){
    //显示子菜单，清空其中的内容
    
	$("#命令_menu").show()
  	    .clearTileData();

    //保存需要使用的数据
    const free_num = getFreeBug(object)
    $("#命令_menu").data({
        "object":object,
        "id":id
    }).attr({"free_num": free_num})

    const dataDiv = $("<div></div>")
    
    //根据type创建对应的子菜单内容
    if(type == "free"){
        const bugNest = stateValue(object,"所属")
        const works = bugNest.工作
        //遍历目标所处的虫巢内的工作，显示其可以进行的命令div
        for(let 事务 of works){
            //判断其是否可以进行这个工作
            if(runObjectMovement(事务,"需求",object)){
                //将这个事务做成一个命令div，添加到子菜单中
                const orderDiv = createOrderDiv(object,事务,free_num,0,"free")
                $(dataDiv).append(orderDiv)
            }
        }
    }
    else if(type == "busy"){
        //遍历目标正在参与的事务 
        for(let occupy of object.占有){
            const 事务 = occupy.占有来源
            const busy_num = occupy.占有数量
            //将这个事务做成一个命令div，添加到子菜单中
            const orderDiv = createOrderDiv(object,事务,free_num,busy_num,"busy")
            $(dataDiv).append(orderDiv)
        }
    }

    //将数据在子菜单中显示
    dataTile("命令_menu",dataDiv)
}

//创建命令div
function createOrderDiv(object,work,free_num,busy_num){
    // 使用事务的属性创建事务属性div
    const 进度div = stateToDiv(work,"进度",stateValue(work,"进度","object"))
    const 效率值 = countWorkEfficiency(work,object,busy_num,"unit")

    const workState = $(`<div></div>`)
        .append(进度div)
        .append(`<div class="state flex">   
                    <div>效率：</div>
                    <div class="orderDiv_效率值">
                        ${效率值}
                    </div>
                </div>`)

    //创建这个命令，显示work的名称和部分属性
    const workDiv = $(`<div class="orderTile_workDiv"></div>`)
        .append(objectToDiv(work),workState)
    //为其添加一个“命令数量”div,其默认为隐藏
    const numDiv = $(`
        <div class="orderTile_numDiv">
            <div class="flex">
                <span>参与数量：</span>
                <input class="orderTile_input" busy_num="${busy_num}" value="${busy_num}">
                <div class="orderTile_count">
                    <div class="orderTile_button orderTile_退出 ${busy_num == 0 ? "disable":""}">-</div>
                    <div class="orderTile_button orderTile_参加 ${free_num == 0 ? "disable":""} ">+</div>
                </div>
            </div>
        </div>
    `)

    const orderDiv = $(`<div class="orderTile_orderDiv"></div>`)
        .append(workDiv,numDiv)
        .data("事务",work)
        
    return orderDiv
}



//点击一个工作div时，会在下方显示or隐藏命令数量div
$("#main").on("click",".orderTile_workDiv",function(){
    //显示or隐藏“命令数量”
    $(this).siblings(".orderTile_numDiv").slideToggle()
})

//命令数量div的功能
//在input内输入数量以修改参与事务的虫群单位的数量
    $("#main").on("input",".orderTile_input",function(){
        const work = $(this).parents('.orderTile_orderDiv').data("事务")
        const object = $(this).parents('#命令_menu').data("object")
        
        const value = parseInt($(this).val())
        //numDiv中会记录对应的虫群对象中空闲或者被占用的数量
        const free_num = parseInt($("#命令_menu").attr("free_num"))
        const busy_num = parseInt($(this).attr("busy_num"))

        const max = busy_num + free_num
        //输入值不小于0且不超过max
        if(value < 0){
            $(this).val(0)
        }
        if(value > max){
            $(this).val(max)
        }	

        //如果输入值与busy_num的差为正，表示有更多数量的虫群单位要加入这个工作
        const inputValue = $(this).val()
        const distant = inputValue - busy_num
        if(distant > 0){  
            //将差值数量的虫群单位加入这个工作
            joinWork(object,distant,work)
        }
        //如果输入值与busy_num的差为负，则表示对应差值的虫群单位要退出这个工作
        //令小于的部分退出工作并修改busy_num
        else if(distant < 0){
            resignWork(object,-distant,work)
        }
        // 刷新free_num和busy_num为当前的输入值
        $(this).attr("busy_num",inputValue)
        $("#命令_menu").attr("free_num",free_num - distant)
        
        // 更新orderMenu
        updateOrderMenu()
    
        // 更新其对应的bugDiv
        const bugDiv_id = $(this).parents('#命令_menu').data("id")
        updateBugDiv(object,bugDiv_id)
    })


//点击[+]增加input数量，长按持续增加
	$("#main").on("mousedown",".orderTile_参加:not(.disable)",function(){
		let interval
        let hover_join_num = 1
        const $this = $(this)
        //input框的输入值
        const input = $(this).parent().siblings(".orderTile_input")
        const value = parseInt($(input).val())

		//长按1秒后，开始计时
		let timeOut = setTimeout(function() {
            //初始化计时器
			interval = setInterval(function() {
				// 每长按0.1秒，将要加入该工作的对象数量+1
				hover_join_num += 1
				//到达上限时停止,即mouseup
				if($this.hasClass(".disabled")){
                    $this.trigger("mouseup")
				}
                //未到达上限时每次计时都会更新input
                else{
                    input.val(value + hover_join_num)
                    input.trigger("input")
                }
			}, 100);
		}, 1000);

		//松开按键时，令这些bug加入对应的工作
		$this.on("mouseup",function(){
			//修改Input框的输入值
            input.val(value + hover_join_num)
            input.trigger("input")
			//清除计时器
			clearTimeout(timeOut)
			clearInterval(interval)
			//清除本事件
			$this.off("mouseup")
		});
	})
	
//点击[-]减少input数量，长按持续减少
    $("#main").on("mousedown",".orderTile_退出:not(.disable)",function(){
        let interval
        let hover_resign_num = 1
        const $this = $(this)

		//input框的输入值
        const input = $(this).parent().siblings(".orderTile_input")
        const value = parseInt($(input).val())

        //长按1秒后，开始计时
		let timeOut = setTimeout(function() {
			interval = setInterval(function() {
				// 每长按0.1秒，将要退出该工作的对象数量+1
				hover_resign_num += 1
				//到达上限时停止,即mouseup
                if($this.hasClass(".disabled")){
                    $this.trigger("mouseup")
                }
				//未到达上限时每次计时都会更新input
                else{
                    input.val(value - hover_resign_num)
                    input.trigger("input")
                }
			}, 100);
		}, 1000);

        //松开按键时，令这些bug加入对应的工作
        $this.on("mouseup",function(){
            //修改Input框的输入值
            $(input).val(value - hover_resign_num)
            input.trigger("input")
            //清除计时器
            clearTimeout(timeOut)
            clearInterval(interval)
            //清除本事件
            $this.off("mouseup")
        });
    })


//更新orderDiv
$.fn.updateOrderDiv = function (free_num,object){
    //获取数据
    const input = $(this).find(".orderTile_input")
    const inputValue = parseInt(input.val())
    const max = parseInt(input.attr("busy_num")) + free_num

    //更新orderDiv显示的“效率”
    const work = $(this).data("事务")
    const 效率值 = countWorkEfficiency(work, object, inputValue, "unit")
    $(this).find(".orderDiv_效率值").text(效率值)

	//更新按键的可用设置
    // 如果输入值等于最大值，则无法再增加
    const add = inputValue == max ? false:true
    // 如果输入值等于0，则无法再减少
    const sub = inputValue == 0 ? false:true
	if(add){
		$(this).find('.orderTile_参加').removeClass("disable")
	}else{
        $(this).find('.orderTile_参加').addClass("disable")
	}

	if(sub){
		$(this).find('.orderTile_退出').removeClass("disable")
	}else{
        $(this).find('.orderTile_退出').addClass("disable")
	}
}
//更新orderMenu中的所有orderDiv
function updateOrderMenu(){
    const free_num = parseInt($("#命令_menu").attr("free_num"))
    const object = $("#命令_menu").data("object")
    $("#命令_menu").find(".orderTile_orderDiv").each(function(){
        $(this).updateOrderDiv(free_num,object)
    })
}