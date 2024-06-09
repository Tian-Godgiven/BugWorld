import { objectToDiv } from "../../Modules/objectDiv"
import { createTile , createTileMenu, dataTile} from "../../Modules/tile/tile"
import { getFreeBug } from "../../Object/Bug"
import { stateValue } from "../../State/State"

import "../../../css/components/orderTile.css"
import { showOrderTileMenu } from "./order_menu"
import { forEach } from "lodash"
import { countWorkEfficiency } from "../../Object/Work"

//创建命令Tile
export function createOrderTile(bugNest){
    //创建一个Tile框体
	const tile = createTile("命令",bugNest)
	//将对应的bugNest的虫群数据更新到tile中
    updateOrderTile(stateValue(bugNest,"虫群"))
	//创建工作信息栏的子菜单
	createTileMenu("命令列表",tile)
}

//更新命令Tile，显示其中的虫群对象的工作状态
export function updateOrderTile(bugGroup){
    let id = 0
    const dataDiv = $("<div></div>")
    //分为两部分，空闲的和占有中的
    const freeDiv = $(`<div id="orderTile_freeDiv">
                        <div class="orderTile_title">空闲</div>
                     </div>`)
    const busyDiv = $(`<div id="orderTile_busyDiv">
                        <div class="orderTile_title">占有</div>
                     </div>`)
    //将两个部分分别放入其中
    $(dataDiv).append(freeDiv,busyDiv)
    //将数据填装到命令div中
    dataTile("命令",dataDiv)

    //遍历虫群对象，找出其中空闲的和占用中的虫群对象,用其更新数据
    for(let bug_name in bugGroup){
        let bugs = bugGroup[bug_name]    
        for(let bug of bugs){
            id += 1
            const bugDiv_id = "orderTile_bugDiv_" + id
            updateBugDiv(bug,bugDiv_id)
        }
    }
}

//点击两种不同的bugDiv，会对应显示不同的子菜单
$("#main").on("click", ".orderTile_bugDiv", function(){
    const object = $(this).data("object");
    const type = $(this).hasClass("orderTile_freeBug") ? "free" : "busy";
    const id = $(this).attr("bug_div_id")
    //显示子菜单
    showOrderTileMenu(object, id, type);
    
    // 聚焦当前bugDiv
    $("#命令 .focusing").removeClass("focusing");
    $(this).addClass("focusing");
});


//更新对象和id对应的bugDiv，如果不存在则创建
export function updateBugDiv(object,bugDiv_id){
    const free_num = getFreeBug(object)
    const busy_num = stateValue(object,"数量") - free_num

    //有空闲的虫群单位
    let freeBugDiv = $(`.orderTile_freeBug[bug_div_id="${bugDiv_id}"]`)
    if(free_num != 0){
        //如果尚未存在对应的freeBug,则创建并放入
        
        if(freeBugDiv.length == 0){
            freeBugDiv = $(`
                <div bug_div_id = "${bugDiv_id}" 
                        class = "orderTile_bugDiv orderTile_freeBug">
                </div>
            `).data("object",object)
            $("#orderTile_freeDiv").append(freeBugDiv) 
        }
            
        //清空其中的内容,替换上新的内容
        freeBugDiv.empty()
        const free_num = getFreeBug(object)
        const 状态 = stateValue(object,"状态")
        const bugDiv = objectToDiv(object)
        $(freeBugDiv).append(bugDiv,`<span>&nbsp${"x " + free_num }</span>`)
    }
    //如果为0了，则将对应的freeBug删除
    else{
        freeBugDiv.remove()
    }
    //有被占有的虫群单位
    let busyBugDiv = $(`.orderTile_busyBug[bug_div_id="${bugDiv_id}"]`)
    if(busy_num != 0){
        //如果尚未存在对应的busyBug,则创建并放入
        if(busyBugDiv.length == 0){
            busyBugDiv = $(`
                <div bug_div_id = "${bugDiv_id}"
                        class = " orderTile_bugDiv orderTile_busyBug">
                </div>
            `).data("object",object)
            $("#orderTile_busyDiv").append(busyBugDiv)
        }

        //更新
        busyBugDiv.empty()
        //遍历虫群对象的占有属性，获得其当前的占用情况，并放在container中
        const container = $("<div></div>")
        for(let occupy of object.占有){
            const source = occupy.占有来源
            const num = occupy.占有数量
            const efficiency = countWorkEfficiency(source,object,num,"unit")
            //显示占有数量和占有来源以及当前事务的效率
            const occupyDiv = $(`
                <div class="flex">
                    <span>&nbsp;${"x " + num + " →"}&nbsp;</span>
                </div>`)
            .append(objectToDiv(source))
            .append(`<span>：${efficiency}</span>`)
            $(container).append(occupyDiv)
        }
        const bugDiv = objectToDiv(object)
        $(busyBugDiv).append(bugDiv,container)
    }
    else{
        busyBugDiv.remove()
    }
}

