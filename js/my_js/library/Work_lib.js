//产卵
function ChanLuan(){
	var 产卵 = new Work;

	产卵.id = "work_0001"

	changeState(产卵,{
		"名称" : "产卵",
		"进度" : "无",
		"效率" : 0,
		"工作量" : 5,
		"需求" : "[产卵者]",
		"词条" : "工作",
		"信息" : "在下一回合产下虫卵，虫卵可以孵化为幼虫。"
	})

	产卵.函数.结算 = function(object){
		//令对象所在的虫巢增加其"产卵"属性对应数量的"虫卵"单位
		var value = getState(object,"产卵") * getState(object,"数量")

	}

	产卵.函数.需求 = function(object){
		//对象的虫均当前工作>=5，且具备词条[产卵者]
		var 当前工作 = getEqualWorkPower(object)
		return (当前工作 >= 5 && haveEntry(object,"产卵者"))
	}
	产卵.函数.效率 = function(object){
		//返回1个对象的产卵属性值
		return getState(object,"产卵")
	}

	产卵.单位["效率"] = "虫卵"

	return 产卵	
}
appendWorkDic("产卵","work_0001",ChanLuan)

//觅食
function MiShi(){
	var 觅食 = new Work;
	觅食.id = "work_0002"

	changeState(觅食,{
		"名称" : "觅食",
		"进度" : "无",
		"效率" : 0,
		"工作量" : "全部",
		"需求" : "[成虫]",
		"词条" : "行动",
		"信息" : "前往虫巢之外的世界中寻找食物。"
	})

	觅食.函数.效果 = function(object){
		//获得等同于工作量的食物
	}

	觅食.函数.需求 = function(object){
		//平均工作量不低于10，拥有[成虫]词条
		var 当前工作 = getEqualWorkPower(object)
		return (当前工作 >= 10 && haveEntry(object,"成虫"))
	}
	觅食.函数.效率 = function(object){
		//返回单位的工作能力
		return getState(object,"工作")
	}

	觅食.单位["效率"] = "食物"

	return 觅食
}
appendWorkDic("觅食","work_0002",MiShi)

