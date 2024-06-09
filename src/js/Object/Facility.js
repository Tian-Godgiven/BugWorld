import Facility_lib from "../library/Facility/Facility_lib.json"
import Facility_Work_lib from "../library/Facility/Facility_Work_lib.json"
import * as Facility_func_lib from "../library/Facility/Facility_func_lib"
import * as Facility_Work_func_lib from "../library/Facility/Facility_Work_func_lib"
import { changeState, countState, stateValue } from "../State/State"
import { initObject } from "./Object"


class Facility{
	constructor(){
		this.属性 = {
			数量 : 0,
			名称 : null,
			词条 : [],
			效果 : null,
			信息 : null,
			等级 : 0,
			所属 : null
		},
		this.行为 = {
			获得 : null,
			效果 : null,
			结算 : null,
			摧毁 : null
		}
	}
}

//创建一个设施对象并返回
export function createFacilityObject(facility_key,num,source,states){
	const facility = new Facility() 
	//初始化
	const json = Facility_lib[facility_key]
	const more_states = {
		数量 : num
	}
	Object.assign(more_states,states)
	const facility_func = _.cloneDeep(Facility_func_lib[facility_key])
	initObject(facility,source,json,facility_func,more_states)
	
	return facility
}


