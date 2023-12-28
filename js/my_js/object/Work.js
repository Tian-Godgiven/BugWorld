//工作对象
class Work{
	constructor() {
		this.属性 = {
			名称 : null,
			进度 : {
				当前进度 : null,
				需求进度 : null
			},
			工作量 : null,
			需求 : "无",
			参与 : [],
			效率 : null,
			所属 : "无",
			词条 : "无",
			信息 : "无"
		},
		this.函数 = {
			//工作对象在这个虫巢中开始工作时，触发其"开始"
			开始 : null,
			//工作对象对参加工作的虫群对象的需求
			需求 : null,
			//工作对象如何通过参加工作的虫群对象获得“效率”属性
			效率 : null,
			//每回合结束时，触发该工作对象的结算
			结算 : null,
			//每回合开始时，若工作对象的当前进度>=需求进度，触发其效果
			效果 : null,
		},
		this.单位 = {};
		this.功能 = {
			来源 : null,
			显示 : true
		}
		this.id = null
  	}
}

//工作词典
var work_func_dic = {}
//工作id词典
var work_id_dic = {}
//工作名称词典
var work_name_dic = {}

//创建一个工作函数索引,将其加入工作词典中
function appendWorkDic(name,id,func){
	work_func_dic[name] = func
	work_id_dic[id] = name
	work_name_dic[name] = id
}

//获取工作对象
function getWorkFuncById(work_id){
	//先找到名称
	var work_name = work_id_dic[work_id]
	var work_func = work_func_dic[work_name]
	return work_func
}
function getWorkFuncByName(work_name){
	var work_func = work_func_dic[work_name]
	return work_func
}

//令虫巢可以进行某一个工作对象
function appendWork(bugNest,work_source,work_id){
	//如果是name则先转换为id
	if(!work_id.startsWith("work_")){
		var work_id = work_name_dic[work_id]
	}
	//保存工作id和这些工作的来源
	bugNest.可进行工作[work_id] = {来源:work_source}
}

//令虫巢开始进行某一个工作对象
function startWork(bugNest,work_name){
	var the_name = work_name
	var work_func = work_func_dic[work_name]
	var work_id = work_name_dic[work_name]
	//如果这个虫巢的可进行工作中包含这个工作
	if(work_id in bugNest.可进行工作){
		//获取这个work的来源
		var work_source = bugNest.可进行工作[work_id].来源
		var work = work_func(work_source)
		//如果已经有重名的工作对象了，则按顺序赋名1234……
		var i = 0
		while(Object.keys(bugNest.当前工作).includes(work_name)){
			i += 1
			work_name = the_name + i
		}
		//如果对象拥有“独一”词条，则令其从“可进行工作”中删除
		if(haveEntry(work,"独一")){
			var work_id = work.id
			delete bugNest.可进行工作[work_id]
			//刷新新增工作菜单
			updateAddWorkMenu(bugNest)
		}
		//将工作与虫巢绑定
		bugNest.当前工作[work_name] = work
		//将虫巢与工作绑定
		changeState(work,"名称",work_name)
		changeState(work,"所属",getState(bugNest,"名称"))
		//同时将其加入工作Tile的work_container中
		var work_div = createWorkDiv(work)
		$("#work_container").append(work_div)
		//令“工作Tile”弹出至最上方
		upToTop($("#工作"))
	}
	else{
		console.log("虫巢无法进行这个工作")
		work = null
	}
}

//令虫巢结束某一个工作对象
function stopWork(bugNest,work){
	//删除虫巢中当前工作中的这个工作对象
	var work_name = getState(work,"名称")
	delete bugNest.当前工作[work_name]
	//如果对象拥有“独一”词条，则令其加入“可进行工作”，
	if(haveEntry(work,"独一")){
		var work_id = work.id
		bugNest.可进行工作[work_id] = {来源:work.功能.来源}
		//刷新新增工作菜单
		updateAddWorkMenu(bugNest)
	}
	//删除这个工作对象
	work = null
}

//令指定虫群对象的指定个数参与指定的工作，一个对象无法参加相同的工作
function joinWork(bug,num,work){
	if(!(work instanceof Work)){
		//从虫群对象所在的虫巢中得到指定的工作
		var bugNest = getBugNest(bug)
		work = getBugNestWork(bugNest,work)
	}
	if(work == undefined){
		//console.log("不存在指定工作")
		return false
	}
	//若该对象符合工作需求
	if(ableToWork(bug,work)){
		var bug_num = getState(bug,"数量")
		var work_num = getWorkNum(bug,work)
		//并且指定的数量不大于没有参与这个工作的数量
		if(num <=  (bug_num - work_num)){
			//令对象参与这个工作
			//如果对象没有参与这个工作，将其加入
			if(!getState(work,"参与").includes(bug)){
				changeState(work,"参与",bug)
			}
			//修改对象的参与工作数
			changeWorkNum(bug,work_num + num,work)
			//计算对象参与所增加的工作效率
			var add_效率 = useFunction(work,"效率",bug) * num
			var new_效率 = countState(work,"效率",add_效率)
			changeState(work,"效率",new_效率)
			
			updateWorkDiv(work)
		}
	}
}

//令指定虫群对象的指定个数退出指定的工作
function resignWork(bug,num,work){
	//首先对象要具备这个工作
	if(haveWork(bug,work)){
		//令这个对象的参与工作数量-num
		var new_num = getWorkNum(bug,work) - num
		//如果new_num = 0，该修改函数会自动令虫群对象辞职
		changeWorkNum(bug,new_num,work)
		//计算对象减少所减少的工作效率
		var sub_效率 =  - useFunction(work,"效率",bug) * num
		var new_效率 = countState(work,"效率",sub_效率)
		changeState(work,"效率",new_效率)

		updateWorkDiv(work)
	}
}

//判断对象是否满足工作需求
function ableToWork(bug,work){
	//符合工作需求并且还有个体没有参与这个工作
	var work_num = getWorkNum(bug,work)
	var bug_num = getState(bug,"数量")
	return (useFunction(work,"需求",bug) && (work_num < bug_num))
}

//返回对象当中还能参与这个工作的数量
function ableWorkNum(bug,work){
	var bug_num = getState(bug,"数量")
	var 工作量 = getState(work,"工作量")
	if(工作量 == 0){
		return bug_num
	}
	else{
		if(typeof 工作量 == "number"){
			//减去参加了同id工作的数量
			bug_num -= getTypeWorkNum(bug,work)
		}
		else if(工作量 == "全部"){
			//减去参加其他工作的数量(包括了同id)
			for(work_name in bug.工作){
				bug_num -= bug.工作[work_name].数量
			}
		}
		return bug_num
	}
}

