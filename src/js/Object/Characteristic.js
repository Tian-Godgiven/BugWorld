import { runObjectFunction } from "../app/global_ability"
import { appendObjectToState, getState, pushToState } from "../State/State.js"
import { changeState } from "../State/State.js"
import Chara_lib from "../library/Charactereistic/Characteristic_lib.json"
import * as Chara_func_lib from "../library/Charactereistic/Characteristic_func_lib.js"
import _ from "lodash"
import { addImpactToObjectState, createImpact } from "../State/Impact.js"
import { initObject } from "./Object.js"

class Characteristic{
	constructor(){
		this.属性 = {
			名称 : null,
			参数 : null,
            词条 : [],
			优先级 : null,
            信息 : null,
            所属 : null,
			来源 : null
		}
		this.函数 = {}
	}
}

//创建一个特性对象
function createCharacteristic(chara_key){
	let chara = new Characteristic()
	let chara_json = Chara_lib[chara_key]
	//初始化
	initObject(chara,chara_json)
	//为【特性对象】绑定函数
	chara.函数 = Chara_func_lib[chara_key]
	
	return chara
}

//在对象初始化时，为其绑定属性中指定的特性对象
export function bindObjectCharacteristic(object,source){
	// 这里需要将原本填装着chara_key的属性清空，再装入【特性对象】
	// 因此需要先将这个“特性”属性深复制下来，再遍历
	const 特性 = _.cloneDeep(getState(object,"特性"))
	changeState(object,"特性",[])
	//遍历其“特性”属性,为其添加对应的特性对象
	for(let chara_key of 特性){
		getCharacteristic(object,chara_key,source)
	}
}

//令一个对象获得指定chara_key的特性对象,并触发其“获得”函数
export function getCharacteristic(object,chara_key,source){
	//创建特性对象
	let chara = createCharacteristic(chara_key)
	//修改【特性】的“所属”和“来源”
	changeState(chara,{
		"所属":object,
		"来源":source
	})
	//将特性对象加入指定对象的“特性”属性当中
	pushToState(object,"特性",chara)

	//触发【特性】的获得函数
	runObjectFunction(chara,"获得")
}

//触发特性对象的“失去”函数，并使得指定对象失去该的特性
export function loseCharacteristic(object,chara){
	//触发其“失去”函数
	runCharaFunction(chara,"失去")
	//删除对象中的特性对象
	popFromState(object,"特性",chara)
}

//触发一个特性的指定函数
export function runCharaFunction(chara,func_key){
	//先获取函数需要用到的参数
	const paras = getState(chara,"参数")
	const target = getState(chara,"所属")
	const source = getState(chara,"来源")
	//再触发指定函数
	runObjectFunction(chara,func_key,[target,paras,source])
}
