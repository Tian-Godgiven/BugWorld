import { objectToDiv } from "../../Modules/objectDiv"
import { createTile , createTileMenu, dataTile} from "../../Modules/tile/tile"
import { getFreeBug } from "../../Object/Bug"
import { stateValue } from "../../State/State"

import "../../../css/Tiles/orderTile.css"
import { showOrderTileMenu } from "./orderMenu"
import { forEach } from "lodash"
import { countWorkEfficiency } from "../../Object/Work"
import { hiddenValue } from "../../State/Hidden"

let order_tile
//创建命令Tile
export function createOrderTile(bugNest){
    //创建一个Tile框体
    const ability = {
		关闭 : "cube",
		对象 : bugNest
	}
	order_tile = createTile("命令",null,ability)
    //初始化命令Tile内容
    const order_inner = $(`
            <div id="orderTile_freeDiv">
                <div class="orderTile_title">空闲</div>
            </div>
            <div id="orderTile_busyDiv">
                <div class="orderTile_title">占有</div>
            </div>`)
    dataTile(order_tile,order_inner)
	//将对应的bugNest的虫群数据更新到tile中
    updateOrderTile(stateValue(bugNest,"虫群"))
	createTileMenu("命令列表",order_tile)
}

//更新命令Tile，显示其中的虫群对象的工作状态
export function updateOrderTile(bugGroup){
    let id = 0
    //遍历虫群对象，找出其中空闲的和占用中的虫群对象,用其更新数据
    for(let bug_name in bugGroup){
        let bugs = bugGroup[bug_name]    
        for(let bug of bugs){
            id += 1
            updateOrderTileBugDiv(bug)
        }
    }
}

//点击两种不同的bugDiv，会对应显示不同的子菜单
$("#main").on("click", ".orderTile_bugDiv", function(){
    const object = $(this).data("object");
    const bugNest = $(order_tile).data("object")
    const type = $(this).hasClass("orderTile_freeBug") ? "free" : "busy";
    //显示子菜单
    showOrderTileMenu(object, bugNest, type);
    
    // 聚焦当前bugDiv
    $("#命令 .focusing").removeClass("focusing");
    $(this).addClass("focusing");
});


//更新对象对应的bugDiv，如果不存在则创建
export function updateOrderTileBugDiv(object){
    //查找对应的object的bugDiv
    let freeBugDiv,busyBugDiv
    $('.orderTile_freeBug').each(function() {
        if ($(this).data('object') == object) {
            freeBugDiv = $(this)
        }
    });
    $('.orderTile_busyBug').each(function() {
        if ($(this).data('object') == object) {
            busyBugDiv = $(this)
        }
    });

    const free_num = getFreeBug(object)
    const busy_num = stateValue(object,"数量") - free_num

    //虫群单位尚有空闲
    if(free_num != 0){
        //如果尚未存在对应的freeBug,则创建并放入
        if(!freeBugDiv){
            freeBugDiv = $(`<div class = "orderTile_bugDiv orderTile_freeBug"></div>`)
                .data("object",object)
            $("#orderTile_freeDiv").append(freeBugDiv) 
        }
        //否则清空已有的freeBug中的内容
        else{
            $(freeBugDiv).empty()
        }
            
        //更新freeBug
        const free_num = getFreeBug(object)
        const bugDiv = objectToDiv(object)
        $(freeBugDiv).append(bugDiv,`<span>&nbsp${"x " + free_num }</span>`)
    }
    //如果为0，即没有空闲的虫群单位，则将对应的freeBug删除
    else{
        if(freeBugDiv){
            $(freeBugDiv).remove()
        }
    }

    //虫群单位已被占用（部分）
    if(busy_num != 0){
        //如果尚未存在对应的busyBug,则创建并放入
        if(!busyBugDiv){
            busyBugDiv = $(`<div class = "orderTile_bugDiv orderTile_busyBug"></div>`)
                .data("object",object)
            $("#orderTile_busyDiv").append(busyBugDiv)
        }
        //否则清空已存在的busyBug中的内容
        else{
            $(busyBugDiv).empty()
        }
        
        //遍历虫群对象的占有属性，获得其当前的占用情况，并更新BusyBug
        const container = $("<div></div>")
        const 被占有 = hiddenValue(object,"被占有")
        for(let occupy of 被占有){
            const source = occupy.占有来源
            const num = occupy.占有数量
            const 效率 = countWorkEfficiency(source,object,num,"unit")
            //显示占有数量和占有来源以及当前事务的效率
            const occupyDiv = $(`
                <div class="flex">
                    <span>&nbsp;${"x " + num + " →"}&nbsp;</span>
                </div>`)
            .append(objectToDiv(source))
            .append(`<span>：${效率}</span>`)
            $(container).append(occupyDiv)
        }
        const bugDiv = objectToDiv(object)
        $(busyBugDiv).append(bugDiv,container)
    }
    else{
        if(busyBugDiv){
            $(busyBugDiv).remove()
        }
    }
}

