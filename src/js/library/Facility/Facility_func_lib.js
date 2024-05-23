import { changeState, getState } from "../../State/State"

export const 虫母室 = {
	获得 : function(facility,bugNest){
		//令虫巢对象最大空间+5
		var old_state = getState(bugNest,"空间").max
		changeState(bugNest,"空间",old_state + 5,"dictionary","max")
	},
	结算 : function(facility,bugNest){
		//令虫巢对象中的[虫母]的防御+5*等级
	},
}

export const 孵化室 = {
	获得 : function(facility,bugNest){
		//令虫巢对象最大空间+1
		var old_state = getState(bugNest,"最大空间")
		changeState(bugNest,"最大空间",old_state + 1)
	},
	效果 : function(facility,bugNest){

	}
}
