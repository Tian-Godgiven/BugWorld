import { objectStateToTileData } from "../Modules/stateDiv"
import { createTile, dataTile } from "../Modules/tile/tile"

// 创建一个虫巢Tile并将对应的数据装入其中
let bugNest_tile
export function createBugNestTile(bugNest){
	const ability = {
		关闭 : "cube",
		对象 : bugNest
	}
	bugNest_tile = createTile("虫巢",null,ability)
}

export function updateBugNestTile(bugNest){
	const tile_data = objectStateToTileData(bugNest)
	dataTile(bugNest_tile,tile_data)
}
