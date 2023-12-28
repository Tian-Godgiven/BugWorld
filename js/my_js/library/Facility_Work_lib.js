//这里是建设设施的工作

//建设虫母室
function ChongMuShi_build(){
	var 虫母室_build = new Work;

	虫母室_build.id = "build_0001"

	changeState(虫母室_build,{
		"名称" : "建设虫母室",
		"词条" : ["建设","工作","独一"],
		"需求" : "[成虫]",
		"信息" : "为这座巢穴增添一座虫母室。",
		"效率" : 0,
		"工作量" : "全部",
		"当前进度" : 0,
		"需求进度" : "20",
	})

	虫母室_build.函数.结算 = function(work){
		//增加该工作的当前进度，增加量等同于效率
		var old_progress = getState(work,"当前进度")
		var effeciency = getState(work,"效率")
		changeState(work,"当前进度",old_progress + effeciency)
	}
	虫母室_build.函数.效果 = function(bugNest,work){
		//为该工作所属的虫巢添加虫母室x1
		var facility = createFacility("虫母室",1)
		appendFacility(bugNest,facility)
	}
	虫母室_build.函数.需求 = function(object){
		//对象的虫均当前工作>=10，且具备词条[成虫]
		var 当前工作 = getEqualWorkPower(object)
		return (当前工作 >= 10 && haveEntry(object,"成虫"))
	}
	虫母室_build.函数.效率 = function(object){
		//返回对象的工作属性值
		return getState(object,"工作")
	}

	虫母室_build.单位["效率"] = "进度"

	return 虫母室_build
}
appendWorkDic("建设虫母室","build_0001",ChongMuShi_build)

//加固虫母室
function ChongMuShi_JiaGu(facility){
	if(getState(facility,"名称") != "虫母室"){
		return '必须指定“虫母室”'
	}

	var 虫母室_加固 = new Work;

	虫母室_加固.id = "build_0001_1"

	虫母室_加固.功能.来源 = facility

	changeState(虫母室_加固,{
		"名称" : "加固虫母室",
		"词条" : ["设施升级","工作","独一"],
		"需求" : "[成虫]",
		"信息" : "加固这座巢穴的虫母室，令其等级+1，令其为虫巢中的[虫母]提供的防御+5，令虫巢强度+1。",
		"效率" : 0,
		"工作量" : "全部",
		"当前进度" : 0,
		"需求进度" : "20",
	})

	虫母室_加固.函数.结算 = function(work){
		//增加该工作的当前进度，增加量等同于工作效率
		var old_progress = getState(work,"当前进度")
		var effeciency = getState(work,"效率")
		changeState(work,"当前进度",old_progress + effeciency)
	}
	虫母室_加固.函数.效果 = function(bugNest,work){
		//令该工作所属的虫巢的虫母室等级+1，令虫巢对象强度+1
		var 来源 = work.功能.来源
		addState(bugNest,"强度",+1)
		addState(来源,"等级",+1)
	}
	虫母室_加固.函数.需求 = function(object){
		//对象的虫均当前工作>=10，且具备词条[成虫]
		var 当前工作 = getEqualWorkPower(object)
		return (当前工作 >= 10 && haveEntry(object,"成虫"))
	}
	虫母室_加固.函数.效率 = function(object){
		//返回对象的工作属性值
		return getState(object,"工作")
	}

	虫母室_加固.单位["效率"] = "进度"

	return 虫母室_加固
}
appendWorkDic("加固虫母室","build_0001_1",ChongMuShi_JiaGu)

//扩建虫母室
function ChongMuShi_KuoJian(facility){
	if(getState(facility,"名称") != "虫母室"){
		return '必须指定“虫母室”'
	}

	var 虫母室_扩建 = new Work;

	虫母室_扩建.id = "build_0001_2"

	虫母室_扩建.功能.来源 = facility

	changeState(虫母室_扩建,{
		"名称" : "扩建虫母室",
		"词条" : ["设施升级","工作","独一"],
		"需求" : "[成虫]",
		"信息" : "扩建虫母室，令其Lv+1，令其为虫巢提供的空间+5。",
		"效率" : 0,
		"工作量" : "全部",
		"当前进度" : 0,
		"需求进度" : "20",
	})

	虫母室_扩建.函数.结算 = function(work){
		//增加该工作的当前进度，增加量等同于工作效率
		var old_progress = getState(work,"当前进度")
		var effeciency = getState(work,"效率")
		changeState(work,"当前进度",old_progress + effeciency)
	}
	虫母室_扩建.函数.效果 = function(bugNest,work){
		//令该工作所属的虫母室等级+1，令虫巢对象最大空间+5
		var 来源 = work.功能.来源
		addState(bugNest,"最大空间",+5)
		addState(来源,"等级",+1)
	}
	虫母室_扩建.函数.需求 = function(object){
		//对象的虫均当前工作>=10，且具备词条[成虫]
		var 当前工作 = getEqualWorkPower(object)
		return (当前工作 >= 10 && haveEntry(object,"成虫"))
	}
	虫母室_扩建.函数.效率 = function(object){
		//返回对象的工作属性值
		return getState(object,"工作")
	}

	虫母室_扩建.单位["效率"] = "进度"

	return 虫母室_扩建
}
appendWorkDic("扩建虫母室","build_0001_2",ChongMuShi_KuoJian)


//建设孵化室
function FuHuaShi_build(){
	var 孵化室_build = new Work;

	孵化室_build.id = "build_0002"

	changeState(孵化室_build,{
		"名称" : "建设孵化室",
		"词条" : ["建设","工作"],
		"需求" : "[成虫]",
		"信息" : "为这座巢穴增添一座孵化室。",
		"效率" : 0,
		"工作量" : "全部",
		"当前进度" : 0,
		"需求进度" : "20",
	})

	孵化室_build.函数.结算 = function(work){
		//增加该工作的当前进度，增加量等同于效率
		var old_progress = getState(work,"当前进度")
		var effeciency = getState(work,"效率")
		changeState(work,"当前进度",old_progress + effeciency)
	}
	孵化室_build.函数.效果 = function(bugNest,work){
		//为该工作所属的虫巢添加虫母室x1
		var facility = createFacility("孵化室",1)
		appendFacility(bugNest,facility)
	}
	孵化室_build.函数.需求 = function(object){
		//对象的虫均当前工作>=10，且具备词条[成虫]
		var 当前工作 = getEqualWorkPower(object)
		return (当前工作 >= 10 && haveEntry(object,"成虫"))
	}
	孵化室_build.函数.效率 = function(object){
		//返回对象的工作属性值
		return getState(object,"工作")
	}

	孵化室_build.单位["效率"] = "进度"

	return 孵化室_build
}
appendWorkDic("建设孵化室","build_0002",FuHuaShi_build)