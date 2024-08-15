import _ from "lodash";

//清空一个Tile的data
export function clearTileData(tile){
    const tile_data = $(tile).children(".tile_data")
    if(tile_data.length != 0){
        tile_data.empty()
    }
}
