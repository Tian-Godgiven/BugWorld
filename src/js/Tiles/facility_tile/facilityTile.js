import { createTile, createTileMenu, dataTile, rebindTileData } from "../../Modules/tile/tile"
import { objectToDiv } from "../../Modules/objectDiv";
import Facility_Work_lib from "../../library/Facility/Facility_Work_lib.json"
import { getUnit } from "../../State/State"
import { stateValue } from "../../State/State"
import "../../../css/Tiles/facility.css"
import { clearTileData } from "../../Modules/tile/tileData";
import { showFacilityMenu } from "./facilityMenu";

let facility_tile
//创建[设施]tile，包含一个menu子元素
export function createFacilityTile(bugNest){
	const ability = {
		关闭 : "cube",
		对象 : bugNest
	}
	facility_tile = createTile("设施",null,ability)
	//子菜单
	createTileMenu("设施控制",facility_tile)
	updateFacilityTile(bugNest)
}

//更新[设施]tile，将对应bugNest中的内容装入其中
export function updateFacilityTile(bugNest){
	//清空原本的Tile
	clearTileData(facility_tile)
	//更新绑定对象
	rebindTileData(facility_tile,"object",bugNest)

	//当前设施栏，显示虫巢中目前拥有的设施与这些设施的效果
	const all_container_div = $("<div>")
	//遍历虫巢中的设施
	const facilities = stateValue(bugNest,"设施")
	for(let key in facilities){
		for(let facility of facilities[key]){
			const facility_div = createFacilityTileDiv(facility)
			//放入总容器
			$(all_container_div).append(facility_div)
		}
	}
	dataTile(facility_tile,all_container_div)
}

//创建一个设施div
function createFacilityTileDiv(facility){
	//设施名称，如果有等级则还会显示等级
	const object_div = objectToDiv(facility,"level")
	//设施数量
	const num = stateValue(facility,"数量")
	//设施词条
	let entry = ""
	for(let i of stateValue(facility,"词条")){
		entry += "["+i+"]"
	}
	//设施效果
	const ability = stateValue(facility,"效果")

	const facility_div = $("<div>",{class:"facilityTile_div"})
		.append(object_div,`
			<div>数量：${num}</div>
			<div>${entry}</div>
			<div>${ability}</div>
			<div class="facilityDiv_btnContainer">
				<div class="button facilityDiv_控制">控制</div>
			</div>`)
	
	$(facility_div).data("object",facility)

	return facility_div
}

//点击设施的“控制”按键，显示对应设施的菜单
$("#main").on("click",".facilityDiv_控制",function(){
	const facility = $(this).parents(".facilityTile_div").data("object")
	showFacilityMenu(facility)
})

