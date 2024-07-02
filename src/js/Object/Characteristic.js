import { runObjectMovement } from "../State/Movement.js"
import { appendObjectToState, stateValue, popFromState, pushToState } from "../State/State.js"
import { changeState } from "../State/State.js"
import Chara_lib from "../library/Charactereistic/Characteristic_lib.json"
import * as Chara_func_lib from "../library/Charactereistic/Characteristic_func_lib.js"
import _ from "lodash"
import { addImpactToObjectState, createImpact } from "../State/Impact.js"
import { initObject, loseSource } from "./Object.js"

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
		this.行为 = {}
	}
}

//创建一个特性对象
export function createCharacteristic(chara_key,source){
	const chara = new Characteristic()
	const chara_state = Chara_lib[chara_key]
	const chara_func = Chara_func_lib[chara_key]
	//初始化
	initObject(chara,chara_key,source,chara_state,chara_func)

	return chara
}

//在对象初始化时，为其绑定属性中指定的特性对象
export function bindObjectCharacteristic(object,source){
	// 这里需要将原本填装着chara_key的属性清空，再装入【特性对象】
	// 因此需要先将这个“特性”属性深复制下来，再遍历
	const 特性 = _.cloneDeep(stateValue(object,"特性"))
	changeState(object,"特性",[])
	//遍历其“特性”属性,为其添加对应的特性对象
	for(let chara_key of 特性){
		//创建特性对象
		let chara = createCharacteristic(chara_key,source)
		//使得对象获得特性对象
		getCharacteristic(object,chara,source)
	}
}

//令一个对象获得指定chara_key的特性对象,并触发其“获得”行为
export function getCharacteristic(object,chara){	
	//修改【特性对象】的“所属”
	chara.属性.所属 = object
	//将特性对象加入指定对象的“特性”属性当中
	pushToState(object,"特性",chara)
	//触发【特性对象】的获得行为
	runCharaFunction(chara,"获得")
}

//触发特性对象的“失去”行为，并使得指定对象失去该的特性
export function loseCharacteristic(object,chara,source){
	//触发其“失去”行为
	runCharaFunction(chara,"失去")
	//令对象中对应的特性对象失去对应的“source”，如果来源为空，则返回false
	if(!loseSource(chara,source)){
		//来源为空时，删除对象中的特性对象
		popFromState(object,"特性",chara)
	}
}

//触发一个特性的指定函数
export function runCharaFunction(chara,func_key){
	//触发指定的函数
	const chara_belong = stateValue(chara,"所属")
	runObjectMovement(chara,func_key,chara_belong)
}
