import { pushToState } from "./State";

//使得对象获得词条
export function getEntry(object,entry){
    pushToState(object,"词条",entry)
}
//返回对象是否具有某个词条
export function haveEntry(object, entry) {
	var object_entry = object.属性.词条
	return object_entry.includes(entry)
}
