var focusing_area
var area_id = 0

//获取Area_lib中的数据
import Area_lib from "../library/Area/Area_lib.json"
import _ from "lodash"
import { initObject } from "./Object";

class Area{
	constructor(){
		this.属性 = {
			虫巢:[]
		};
	}
}

//创建一个指定类型的地区用以虫群建立虫巢
export function createArea(area_key,states){
	let area = new Area()
	let area_json = _.cloneDeep(Area_lib[area_key])
	//初始化
	initObject(area,area_json,states)

	area["id"]=area_id
	
	area_id += 1
	focusing_area = area
	return area
}

//返回当前聚焦的地区
function returnFocusingArea(){
	return focusing_area
}