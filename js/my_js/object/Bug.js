//虫群单位数据结构
class Bug {
  constructor() {
	this.属性 = {
		名称: null,
	  	数量: null,
	  	所属: null,
	  	参数: {
			寿命: {
		  		当前寿命: 0,
		  		最大寿命: 0
			},
			生命: {
		  		当前生命: 0,
		  		最大生命: 0
			},
			储备: {
				当前储备: 0,
				最大储备: 0
			},
			攻击: 0,
			防御: 0,
			工作: 0,
			空间: 0
	  	},
		系数: {
			生产: 0,
			消耗: 0,
			饥饿: 0,
			回复: 0
	  	},
	  	特殊: {},
	  	特性: [],
	  	词条: [],
	  	信息: null
	};
	this.单位 = {
		寿命: "回合",
		空间: "空间",
		生产: "营养/回合",
		消耗: "营养/回合",
		饥饿: "生命/回合",
		回复: "生命/回合"
	};
	this.工作 = {};
	this.函数 = {
		加入:null,
		退出:null
	}
  }
}

//虫群单位字典
var bug_func_dic = {}

//令虫族对象加入字典
function appendBugDic(bug_name,bug_func){
	bug_func_dic[bug_name] = bug_func
}

//创建虫群对象
function createBug(bug_name,bug_num){
	var bug_func = bug_func_dic[bug_name]
	return bug_func(bug_num)
}

//令虫群单位加入虫巢
function addBug(bugNest,bug){
	//判断是否允许加入:1.虫巢空间是否足够
	var bug_num = getState(bug,"数量")
	var available_space = getState(bugNest,"最大空间") - getState(bugNest,"当前空间")
	//允许进入
	if(available_space >= getState(bug,"空间") * bug_num){
		//触发该对象的加入函数
		useFunction(bug,"加入",bugNest,bug)
		//日志输出
		appendLog([bug,"x"+getState(bug,"数量"), "进入了" , bugNest])
		//如果已有完全相同的对象，则令其数量增加Num个
		var bugGroup = getState(bugNest,"虫群")
		var index = bugGroup.indexOf(bug)
		if(index != -1){
			var old_bug = bugGroup[index]
			var old_num = getState(old_bug,"数量")
			changeState(old_bug,"数量",old_num + bug_num)
			//并令这个虫族对象删除
			bug = null
		}
		//否则直接加入虫群
		else{
			changeState(bugNest,"虫群",bug)
			//修改虫群的所属
			changeState(bug,"所属",getState(bugNest,"名称"))
		}
		//修改BugNest Tile显示
		updateBugNestTile(bugNest)
	}
	else{
		//空间不足的情况下，缩减进入虫巢的数量
		var available_num = Math.floor(available_space / getState(bug,"空间"))
		if(available_num > 0){
			changeState(bug,"数量",available_num)
			addBug(bugNest,bug)
			appendLog(["空间不足," ,bug , "x" + (bug_num-available_num) , "无法进入", bugNest])
		}
		//若无法进入虫巢，则删除对象
		else{
			appendLog(["空间不足,",bug,"无法进入",bugNest])
			bug = null
		}
		
	}
}

