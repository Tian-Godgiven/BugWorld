import { popFromState, pushToState } from "./State";

//使得对象获得词条
export function getEntry(object,entry){
    pushToState(object,"词条",entry)
}
//返回对象是否具有某个/某些词条,传入多个参数将以“或”的方式寻找到最前的符合的词条/词条组
export function haveEntry(object, ...entrys) {
	let bool = false
	const 词条 = object.属性.词条
	//按照传入的词条组的顺序进行判断
	for(let entry of entrys){
		//如果entry是一个数组，则要求对象具备其中的所有词条
		if(_.isArray(entry)){
			bool = _.every(词条, element => _.includes(entry, element));
		}
		//否则判断对象词条当中是否具备这个词条
		else{
			bool = 词条.includes(entry)
		}
		//一旦检测到对应的词条存在，则结束判断
		if(bool){
			break
		}
	}

	return bool
	
}
//使得对象失去指定的词条
export function loseEntry(object,entry){
	//找到指定的词条
	//使得失去对应的词条
	popFromState(object,"词条",entry)
}