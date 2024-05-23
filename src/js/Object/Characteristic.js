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
            词条 : [],
            信息 : null,
            所属 : null
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
	console.log(特性)
	for(let chara_key of 特性){
		appendCharacteristic(object,chara_key,source)
	}
}

//为一个对象附加指定的特性对象
export function appendCharacteristic(object,chara_key,source){
	//创建特性对象
	let chara = createCharacteristic(chara_key)

	//将【特性对象】与【对象】双向绑定
	changeState(chara,"所属",object)
	//将特性对象加入指定对象的“特性”属性当中
	pushToState(object,"特性",chara)

	//触发【特性】的获得函数
	runObjectFunction(chara,"获得",object)
}



//触发一个对象的特性的"触发"函数