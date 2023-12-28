//根据虫巢内虫群更新虫巢Tile的部分属性
function updateBugNestTile(bugNest){
	//更新生产和消耗
	var 总生产 = 0
	var 总消耗 = 0
	var 总空间 = 0
	var 总当前储备 = 0
	var 总最大储备 = 0
	var bug_list = getState(bugNest,"虫群")
	for (i in bug_list){
		var bug = bug_list[i]
		var num = getState(bug,"数量")
		总生产 += getState(bug,"生产") * num
		总消耗 += getState(bug,"消耗") * num
		总空间 += getState(bug,"空间") * num
		总当前储备 += getState(bug,"当前储备") * num
		总最大储备 += getState(bug,"最大储备") * num
	}
	changeState(bugNest,"生产",总生产)
	changeState(bugNest,"消耗",总消耗)
	changeState(bugNest,"当前空间",总空间)
	changeState(bugNest,"当前储备",总当前储备)
	changeState(bugNest,"最大储备",总最大储备)

	//刷新虫巢Tile的数据
	bugNest_data = stateIntoDiv(bugNest)
	dataTile("虫巢",bugNest_data)
}