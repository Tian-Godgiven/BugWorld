//特性对象
class Characteristic {
	constructor() {
		this.属性 = {
			名称 : null,
			词条 : null,
			信息 : null
		},
		this.函数 = {
			效果 : null
		}
		
  	}
}

//特性字典
var characteristic_dic = {}

//创建一个特性，将其加入特性字典中
function appendCharacteristicDic(characteristic){
	//将其添加进特性字典中
	var name = getState(characteristic,"名称")
	characteristic_dic[name] = characteristic
}

//为一个对象附加指定的特性
function appendCharacteristic(object,characteristic_name){
	var characteristic = characteristic_dic[characteristic_name]
	//将特性对象添加进对象的特性中
	changeState(object,"特性",characteristic)

	//触发特性对象的效果函数
	useFunction(characteristic,"效果",object)
}