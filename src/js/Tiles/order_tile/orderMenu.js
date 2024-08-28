import { objectToDiv } from "../../Modules/objectDiv";
import { dataTile } from "../../Modules/tile/tile";
import { clearTileData } from "../../Modules/tile/tileData";
import { getFreeBug } from "../../Object/Bug";
import { createWork, joinWork, resignWork } from "../../Object/Work";
import { runObjectMovement } from "../../State/Movement"
import { stateValue } from "../../State/State"
import { countWorkEfficiency } from "../../Object/Work";
import { updateOrderTileBugDiv} from "./orderTile";
import { createRandomId } from "../../app/global_ability";
import { stateToDiv } from "../../Modules/stateDiv"
import { hiddenValue } from "../../State/Hidden";

//显示命令菜单
export function showOrderTileMenu(object,bugNest,type){
    //显示子菜单，清空其中的内容
    const order_menu = $("#命令_menu")
    const free_num = getFreeBug(object)
	order_menu.show()
        //保存需要使用的数据
        .data({
            "object" : object,
        })
    //清空原本的内容，填装新的内容
    clearTileData(order_menu);

    const dataDiv = $("<div></div>")
    //根据type创建对应的子菜单内容

    //该单位空闲时
    if(type == "free"){
        //遍历当前虫巢内的正在进行的工作，显示该实体对象可以进行的命令div
        const 进行中工作 = hiddenValue(bugNest,["进行中","工作"])
        for(let 工作 of 进行中工作){
            //判断其是否满足该工作的需求
            if(runObjectMovement(工作,"需求",object)){
                //将这个事务做成一个命令div，添加到子菜单中
                const orderDiv = createOrderDiv(object,工作,free_num,0)
                $(dataDiv).append(orderDiv)
            }
        }
    }
    //该单位忙碌时
    else if(type == "busy"){
        //遍历目标正在参与的事务 
        const 被占有 = hiddenValue(object,"被占有")
        for(let occupy of 被占有){
            const 事务 = occupy.占有来源
            const busy_num = occupy.占有数量
            //将这个事务做成一个命令div，添加到子菜单中
            const orderDiv = createOrderDiv(object,事务,free_num,busy_num)
            $(dataDiv).append(orderDiv)
        }
    }

    //将数据在子菜单中显示
    dataTile(order_menu,dataDiv)
}

//创建命令div
export function createOrderDiv(object,work,free_num,busy_num){
    // 若事务不被显示
    if(!work.功能.显示){
        return false
    }

    // 使用事务的属性创建事务属性div
    const 进度div = stateToDiv(work,"进度",stateValue(work,"进度","stateObject"))
    const 效率值 = countWorkEfficiency(work,object,busy_num,"unit")
    const workState = $(`<div></div>`)
        .append(进度div)
        .append(`<div class="state flex">   
                    <div>效率：</div>
                    <div class="orderDiv_效率值">
                        ${效率值}
                    </div>
                </div>`)

    //创建命令信息div，显示事务的名称和进度，效率
    const workDiv = $(`<div class="orderDiv_workDiv"></div>`)
        .append(objectToDiv(work),workState)
    //创建命令数量div，用于管理参与命令的对象数量，默认为隐藏
    const numDiv = $(`
        <div class="orderDiv_numDiv">
            <div class="flex">
                <span>参与数量：</span>
                <input class="orderDiv_input" data-busy_num = ${busy_num} value="${busy_num}">
                <div class="orderDiv_count">
                    <div class="orderDiv_button orderDiv_退出 ${busy_num == 0 ? "disable":""}">-</div>
                    <div class="orderDiv_button orderDiv_参加 ${free_num == 0 ? "disable":""} ">+</div>
                </div>
            </div>
        </div>
    `)
    $(numDiv).children(".orderDiv_input").data("busy_num",busy_num)

    const orderDiv = $(`<div class="orderTile_orderDiv"></div>`)
        .append(workDiv,numDiv)
        .data("work",work)
        
    return orderDiv
}

//点击一个工作div时，会在下方显示or隐藏命令数量div
$("#main").on("click",".orderDiv_workDiv",function(){
    //显示or隐藏“命令数量”
    $(this).siblings(".orderDiv_numDiv").slideToggle()
})

//命令数量div的功能
//在input内输入数量以修改参与事务的虫群单位的数量
    $("#main").on("input",".orderDiv_input",function(){
        const orderDiv = $(this).parents('.orderTile_orderDiv')
        const work = orderDiv.data("work")
        const object = $(this).closest('#命令_menu').data("object");
        
        //numDiv中会记录对应的虫群对象中空闲或者被占用的数量
        const free_num = getFreeBug(object)
        const busy_num = $(this).data("busy_num")

        const max = busy_num + free_num
        //输入值必须为数字，且不小于0且不超过max
        let value = parseInt($(this).val())
        if(_.isNaN(value)){
            value = 0 
            $(this).val(value)
        }
        if(value < 0){
            value = 0
            $(this).val(value)
        }
        else if(value > max){
            value = max
            $(this).val(value)
        }
        
        //如果输入值与busy_num的差为正，表示有更多数量的虫群单位要加入这个工作
        const distant = value - busy_num
        if(distant > 0){  
            //将差值数量的虫群单位加入这个工作
            joinWork(object,distant,work)
        }
        //如果输入值与busy_num的差为负，则表示对应差值的虫群单位要退出这个工作
        //令小于的部分退出工作并修改busy_num
        else if(distant < 0){
            resignWork(object,-distant,work)
        }
        // 刷新其中的busy_num为当前的输入值
        $(this).data("busy_num",value)
        
        // 更新orderMenu的numDiv
        updateOrderMenu("numDiv")
        // 更新这个orderDiv的效率
        updateOrderDiv(orderDiv,object,free_num-distant)
    })

//改变orderDiv_input的值
function changeOrderDivInput(input,value){
    // 修改Input的值，并触发input事件
    $(input).val(value)
    input.trigger("input")
}
//点击[+]增加input数量，长按持续增加
	$("#main").on("mousedown",".orderDiv_参加:not(.disable)",function(){
		let interval
        let hover_join_num = 1
        const $this = $(this)
        //input框的输入值
        const input = $(this).parent().siblings(".orderDiv_input")
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
                    changeOrderDivInput(input,value + hover_join_num)
                }
			}, 100);
		}, 1000);

		//松开按键时，令这些bug加入对应的工作
		$this.on("mouseup",function(){
            //修改Input框的输入值
            changeOrderDivInput(input,value + hover_join_num)
			//清除计时器
			clearTimeout(timeOut)
			clearInterval(interval)
			//清除本事件
			$this.off("mouseup")
		});
	})
	
//点击[-]减少input数量，长按持续减少
    $("#main").on("mousedown",".orderDiv_退出:not(.disable)",function(){
        let interval
        let hover_resign_num = 1
        const $this = $(this)

		//input框的输入值
        const input = $(this).parent().siblings(".orderDiv_input")
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
                    changeOrderDivInput(input,value - hover_resign_num)
                }
			}, 100);
		}, 1000);

        //松开按键时，令这些bug加入对应的工作
        $this.on("mouseup",function(){
            //修改Input框的输入值
            changeOrderDivInput(input,value - hover_resign_num)
            //清除计时器
            clearTimeout(timeOut)
            clearInterval(interval)
            //清除本事件
            $this.off("mouseup")
        });
    })



//更新orderMenu中的所有orderDiv
function updateOrderMenu(type){
    const object = $("#命令_menu").data("object")
    const free_num = getFreeBug(object)
    $("#命令_menu").find(".orderTile_orderDiv").each(function(){
        if(type == "numDiv"){
            updateOrderDivNumDiv(this,free_num)
        }
        else{
            updateOrderDiv(this,object,free_num)
        }
    })
}

//更新orderDiv
function updateOrderDiv (orderDiv,object,free_num){
    const $orderDiv = $(orderDiv)

    //更新orderDiv显示的“效率”
    const input = $orderDiv.find(".orderDiv_input")
    const inputValue = parseInt(input.val())
    const work = $orderDiv.data("work")
    const 效率值 = countWorkEfficiency(work, object, inputValue, "unit")
    $orderDiv.find(".orderDiv_效率值").text(效率值)
    //然后更新numDiv
    updateOrderDivNumDiv(orderDiv,free_num)
}
//更新orderDiv的numDiv
function updateOrderDivNumDiv(orderDiv,free_num){
    const $orderDiv = $(orderDiv)
    //获取数据
    const input = $orderDiv.find(".orderDiv_input")
    const inputValue = parseInt(input.val())
    const max = input.data("busy_num") + free_num
    //更新按键的状态
    // 如果输入值等于最大值，则无法再增加
    if(inputValue == max){
        $orderDiv.find('.orderDiv_参加').addClass("disable")
    }else{
        $orderDiv.find('.orderDiv_参加').removeClass("disable")
    }
    // 如果输入值等于0，则无法再减少
    if(inputValue == 0){
        $orderDiv.find('.orderDiv_退出').addClass("disable")
    }else{
        $orderDiv.find('.orderDiv_退出').removeClass("disable")
    }
}