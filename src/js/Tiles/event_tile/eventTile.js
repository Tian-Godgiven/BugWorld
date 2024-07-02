import { createTile, rebindTileData } from "../../Modules/tile/tile";
import { clearTileData } from "../../Modules/tile/tileData";

let 事件Tile
//创建事件Tile
export function createEventTile(bugNest){
    const tile_ability = {
        关闭 : "cube",
        对象 : bugNest
    }
    const tile_inner = $(`
        <div id="eventTile_eventInfo"></div>
        <div id="eventTile_eventContainer"></div>`)
    事件Tile = createTile("事件",null,tile_ability)
    updateEventTile()
}

//更新事件Tile
export function updateEventTile(bugNest){
    //清空事件Tile
    clearTileData(事件Tile)
    if(bugNest){
        rebindTileData(事件Tile,"object",bugNest)
    }
    else{
        bugNest = $(事件Tile).data("object")
    }
    
    //遍历bugNest中的[进行中→事件]，依次将其中的事件对象添加到事件Tile中
    for(let event of bugNest.进行中.事件){
        appendEventTileDiv(event)
    }
}

//添加一个事件Tile的div
export function appendEventTileDiv(event){
    //先用这个event创建一个eventTile_div
    const eventTile_div = createEventTileDiv(event)
    //将其放到#eventTile_eventContainer中
    $("#eventTile_eventContainer").prepend(eventTile_div)

}

function createEventTileDiv(event){
    const div = $(`<div class="eventTile_div"></div>`)

    return div
}