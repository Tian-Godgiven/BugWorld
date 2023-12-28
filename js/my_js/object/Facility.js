//设施对象
class Facility{
	constructor() {
		this.属性 = {
			名称 : null,
			等级 : null,
			数量 : 0,
			所属 : null,
			效果 : null,
			词条 : null,
			信息 : null
		},
		this.函数 = {
			需求 : null,
			效果 : null,
			加入 : null,
			建设 : null
		}
		this.功能 = {
			//默认禁止拆除和升级
			拆除 : false,
			升级 : false,
		}
		this.升级 = []
  	}
}

var Facility_func_lib  = {}

//令设施对象函数加入设施字典中
function appendFacilityDic(facility_name,facility_func){
	Facility_func_lib[facility_name] = facility_func
}

//创建设施对象
function createFacility(facility_name,num){
	var create_func = Facility_func_lib[facility_name]
	return create_func(num)
}

//令虫巢获得指定设施
function appendFacility(bugNest,facility){
	//判断该虫巢是否满足添加设施对象的需求
	var tmp = useFunction(facility,"需求",bugNest,facility)
	//允许添加
	if(tmp){
		//触发该对象的加入函数
		useFunction(facility,"加入",bugNest,facility)
		//日志输出
		appendLog([bugNest,"获得了",facility,"x"+getState(facility,"数量")])
		//如果已有同名的对象，则令其数量增加Num个
		var facility_name = getState(facility,"名称")
		if(facility_name in getState(bugNest,"设施")){
			//增加旧对象的数量
			var old_facility = getState(bugNest,"设施")[facility_name]
			var add_num = getState(facility,"数量")
			addState(old_facility,"数量", add_num)
			//令这个对象被删除
			facility = null
		}
		//否则直接加入设施
		else{
			getState(bugNest,"设施")[facility_name] = facility
			//修改设施的所属
			changeState(facility,"所属",getState(bugNest,"名称"))
		}
		//修改BugNest Tile显示
		updateBugNestTile(bugNest)
	}
	//否则将这个设施对象删除
	else{
		facility = null
	}


	
}


