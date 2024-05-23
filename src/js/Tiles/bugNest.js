import { createTile, dataTile } from "../Modules/tile"
import { stateIntoTileData } from "../app/global_ability"
// 创建一个虫巢Tile并将对应的数据装入其中
export function createBugNestTile(bugNest){
	createTile("虫巢",bugNest)
}

export function updateBugNestTile(bugNest){
	const tile_data = stateIntoTileData(bugNest)
	dataTile("虫巢",tile_data)
}
