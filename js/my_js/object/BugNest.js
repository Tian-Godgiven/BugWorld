class BugNest {
  constructor() {
  	this.属性 = {
	  	名称: null,
	  	参数: {
	    	耐久: {
	      		当前耐久: 0,
	      		最大耐久: 0
	   		},
	    	强度: 0,
	    	空间: {
	      		当前空间: 0,
	      		最大空间: 0
	    	},
		    储备: {
		      	当前储备: 0,
		      	最大储备: 0
		    },
		    储物: {
		      	当前储物: 0,
		      	最大储物: 0
		    }
		},
		系数: {
			生产: 0,
			消耗: 0
		},
		虫群: [],
		设施: {},
		状态: [],
		特殊: {},
		特性: [],
		词条: [],
		信息: null,
		其他: []
	};
	this.单位 = {
		生产: "营养/回合",
		消耗: "营养/回合"
	};
	this.当前工作 = {};
	this.可进行工作 = {};
  }
}

var BugNest_dic = {}

//向虫巢字典中加入一个虫巢对象
function appendBugNest(bugNest){
	BugNest_dic[getState(bugNest,"名称")] = bugNest
}

//从字典中返回指定对象所属的虫巢对象
function getBugNest(object){
	var bugNest_name = getState(object,"所属")
	return BugNest_dic[bugNest_name]
}

//在指定的地区创建一个虫巢对象
function createBugNest(area){
	//创建对象并修改值
	var bugNest = new BugNest

	//修改虫巢的属性
	changeState(bugNest,"名称","母巢")
	changeState(bugNest,"耐久",50)
	changeState(bugNest,"强度",0)
	changeState(bugNest,"最大空间",20000)
	changeState(bugNest,"储物",0)
	changeState(bugNest,"词条","巢穴")
	changeState(bugNest,"信息","虫群的巢穴，永恒的温床。母亲的宫殿，我们的故乡。")

	appendBugNest(bugNest)

	//加入地区内
	$(area).data("虫巢").push(bugNest)

	return bugNest
}

//获得虫巢当前正在进行的某个工作
function getBugNestWork(bugNest,work_name){
	if(bugNest == undefined){
		console.log("该对象不存在")
		return undefined
	}
	return bugNest.当前工作[work_name]
}




