

//虫母室
function ChongMuShi(num){
	var 虫母室 = new Facility()
	虫母室.功能.升级 = true

	虫母室.升级 = ["加固虫母室","扩建虫母室"]

	changeState(虫母室,{
		"数量":num,
		"名称":"虫母室",
		"词条":["洞穴","独一"],
		"效果":"令所属虫巢空间+20,令所属虫巢内的[虫母]防御+5。",
		"信息":"虫母的宫殿，卧室和产房。",
		"等级":1
	})

	虫母室.函数.加入 = function(bugNest){
		//令虫巢对象最大空间+5
		var old_state = getState(bugNest,"最大空间")
		changeState(bugNest,"最大空间",old_state + 5)
		//令虫巢对象可进行升级工作
		appendWork(bugNest,虫母室,"加固虫母室")
		appendWork(bugNest,虫母室,"扩建虫母室")
	}
	虫母室.函数.效果 = function(bugNest,bug,facility){
		//令虫巢对象中的[虫母]的防御+5*等级
	}
	虫母室.函数.建设 = getWorkFuncByName("建设虫母室")

	return 虫母室
}
appendFacilityDic("虫母室",ChongMuShi)

//孵化室
function FuHuaShi(num){
	var 孵化室 = new Facility()
	孵化室.功能.拆除 = true
	孵化室.功能.升级 = true

	changeState(孵化室,{
		"数量":num,
		"名称":"孵化室",
		"词条":["洞穴"],
		"效果":"令所属虫巢内最多10个[虫卵]所需要的孵化时间-1回合。",
		"信息":"虫母的宫殿，卧室和产房。",
		"等级":1
	})

	孵化室.函数.加入 = function(bugNest){
		//令虫巢对象最大空间+1
		var old_state = getState(bugNest,"最大空间")
		changeState(bugNest,"最大空间",old_state + 1)
	}
	孵化室.函数.建设 = getWorkFuncByName("建设孵化室")

	return 孵化室
}
appendFacilityDic("孵化室",FuHuaShi)