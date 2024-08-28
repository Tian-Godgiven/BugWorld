import { objectToDiv } from "../../Modules/objectDiv";
import { createTile, rebindTileData } from "../../Modules/tile/tile";
import { getInformation, getStateUnit, stateValue } from "../../State/State";

import "../../../css/Tiles/eventTile.css"
import { bindSlide } from "../../Modules/tile/tileButton";
import { hiddenValue } from "../../State/Hidden";

let 事件Tile
//创建事件Tile
export function createEventTile(bugNest){
    const tile_ability = {
        关闭 : "cube",
        对象 : bugNest
    }

    const 预告div = createEventTileContainer("预告","预告")
    const 进行div = createEventTileContainer("进行","正在进行")
    const 留存div = createEventTileContainer("留存","留存")

    const tile_inner = $(`<div id="eventTile_eventInfo" class="eventTile_container"></div>`)
        .add($("<div></div>").append(预告div,进行div,留存div))
    事件Tile = createTile("事件",tile_inner,tile_ability)

    updateEventTile()

    function createEventTileContainer(id,title){
        const div = $(`<div id="eventTile_${id}" class="eventTile_container"></div>`)
        const titleDiv = $(`<div>${title}</div>`)
        const containerDiv = $(`<div class="eventTile_eventContainer"></div>`)
        bindSlide(titleDiv,containerDiv,"down",false,500)
        div.append(titleDiv,containerDiv)
        return div
    }
}

//更新事件Tile的事件信息eventInfo
export function updateEventInfoDiv(bugNest){
    const area = stateValue(bugNest,"所处")
    //显示发生事件的概率,超出概率边界的部分，即为事件发生的概率
    const 总概率 = stateValue(area,"繁荣","num") + 100
    const 当前概率 = 总概率 - hiddenValue(bugNest,["事件信息","概率边界"])
    const 事件概率 = Math.round(当前概率 / 总概率 * 100) + "%" 
    //显示事件的发生倾向
    const 倾向边界 = hiddenValue(bugNest,["事件信息","倾向边界"])
    const 好事倾向 = stateValue(area,"平和","num") + 5
    const 坏事倾向 = stateValue(area,"威胁","num") + 5
    const 倾向总值 = 好事倾向+坏事倾向
    const 好事概率 = Math.round((好事倾向 - 倾向边界)/倾向总值 * 100)
    const 坏事概率 = 100 - 好事概率
    const 事件倾向 = `[好事：${好事概率+"%"}/坏事：${坏事概率+"%"}]`
    //显示事件的强度
    const 收益 = stateValue(area,"收益","num")
    const 险恶 = stateValue(area,"险恶","num")
    const 事件强度 = `[好事：${收益}~${收益+10}/坏事：${险恶}~${险恶+10}]`

    //更新事件信息div
    $("#eventTile_eventInfo").html(`
        <div>下一回合的事件信息</div>
        <div>事件概率：${事件概率}</div>
        <div>事件倾向：${事件倾向}</div>
        <div>事件强度：${事件强度}</div>
        `)
}

//更新事件Tile
export function updateEventTile(bugNest){
    //清空事件Tile内部的事件容器
    $(".eventTile_eventContainer").empty()
    //更新事件Tile绑定的显示对象
    if(bugNest){
        rebindTileData(事件Tile,"object",bugNest)
    }
    else{
        bugNest = $(事件Tile).data("object")
    }
    
    //更新事件信息div
    updateEventInfoDiv(bugNest)
    //遍历bugNest中的[进行中→事件]，依次将其中的事件对象添加到事件Tile中
    const 进行中事件 = hiddenValue(bugNest,["进行中","事件"])
    for(let event of 进行中事件){
        appendEventTileDiv(event)
    }
}

//添加一个事件Tile的div
export function appendEventTileDiv(event){
    let type
    let container 
    
    //判断这个事件的状态：预告中/进行中/留存中
    if(hiddenValue(event,"预告中") == true){
        type = "预告"
        container = $("#eventTile_预告 .eventTile_eventContainer")
    }
    else if(hiddenValue(event,"进行中") == true){
        type = "进行"
        container = $("#eventTile_进行 .eventTile_eventContainer")
    }
    else if(hiddenValue(event,"存留中") == true){
        type = "留存"
        container = $("#eventTile_留存 .eventTile_eventContainer")
    }
    //先用这个event创建一个eventTile_div
    const eventTile_div = createEventTileDiv(event,type)
    //将其放到对应的容器中
    $(container).prepend(eventTile_div)

}

function createEventTileDiv(event,type){
    let div = $(`<div class="eventTile_eventDiv"></div>`)
    const objectDiv = objectToDiv(event)

    const 效果 = getInformation(event,stateValue(event,"效果"))
    const 效果div = $(`<div></div>`).append(效果)
    switch (type){
        case "预告":
            const 预告div = $(`<div class="eventDiv_预告时间">${stateValue(event,"预告") + getStateUnit(event,"预告")}后发生</div>`)
            div.append(objectDiv,预告div,效果div)
            break;
        case "进行":
            const 持续div = $(`<div class="eventDiv_持续时间">持续${stateValue(event,"持续") + getStateUnit(event,"持续")}</div>`)
            div.append(objectDiv,持续div,效果div)
            break;
        case "留存":
            const 留存div = $(`<div class="eventDiv_留存时间">已经结束</div>`)
            div.append(objectToDiv,留存div,效果div)
            break;
        default:
            return false
    }

    return div
}