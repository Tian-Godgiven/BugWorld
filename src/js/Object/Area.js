var focusing_area
var area_id = 0

//获取Area_lib中的数据
import Area_lib from "../library/Area/Area_lib.json"
import _ from "lodash"
import { initObject } from "./Object";
import { changeState, pushToState } from "../State/State";

class Area{
	constructor(){
		this.属性 = {
			名称:null,
			参数:{},
			状态:null,
			虫巢:[],
			来源:null
		};
	}
}

//创建一个指定key的地区
export function createArea(area_key,source,states){
	let area = new Area()
	let area_json = _.cloneDeep(Area_lib[area_key])
	const area_func = null
	//初始化
	initObject(area,area_key,source,area_json.属性,area_func,states)

	area["id"]=area_id
	
	area_id += 1
	focusing_area = area
	return area
}

//返回当前聚焦的地区
export function returnFocusingArea(){
	return focusing_area
}

//令虫巢加入一个地区
export function bugNestJoinArea(bugNest,area){
	//令该虫巢的[属性→所处]为该地区
	changeState(bugNest,"所处",area)
	//将其加入该地区的"虫巢"当中
	pushToState(area,"虫巢",bugNest)
}