//特性库

//「大嗉囊」
function DaSuNang(){
	var 大嗉囊 = new Characteristic
	changeState(大嗉囊,{
		"名称":"大嗉囊",
		"词条":"器官",
		"信息":"该单位可以将获取的营养物质存储在庞大的嗉囊器官内，\
               	并通过交哺的方式分享给其他个体。<br>\
           		令该单位的最大储备+140。"
	})
	
	大嗉囊.函数.效果 = function(object){
		//令对象的"最大储备"+140
		var value = getState(object,"最大储备")
		if(value != undefined){
			changeState(object,"最大储备",value + 140)
		}
		else{
			console.log("该单位不具备储备属性")
		}
	}

    appendCharacteristicDic(大嗉囊)
};
DaSuNang()

//「嗉囊」
function SuNang() {
	var 嗉囊 = new Characteristic
	changeState(嗉囊,{
		"名称":"嗉囊",
		"词条":"器官",
		"信息":"该单位可以将获取的营养物质存储在嗉囊器官内，\
                并通过交哺的方式分享给其他个体。<br>\
               	令该单位的最大储备+90。"
	})

	嗉囊.函数.效果 = function(object){
		//令对象的"最大储备"+90
		var value = getState(object,"最大储备")
		if(value != undefined){
			changeState(object,"最大储备",value + 90)
		}
		else{
			console.log("该单位不具备储备属性")
		}
	}

    appendCharacteristicDic(嗉囊)
};
SuNang()

//「小嗉囊」
function XiaoSuNang(){
	var 小嗉囊 = new Characteristic
	changeState(小嗉囊,{
		"名称":"小嗉囊",
		"词条":"器官",
		"信息":"该单位可以将获取的营养物质存储在较小的嗉囊器官内，\
                并通过交哺的方式分享给其他个体。<br>\
               	令该单位的最大储备+40。"
	})
	
	
	小嗉囊.函数.效果 = function(object){
		//令对象的"最大储备"+40
		var value = getState(object,"最大储备")
		if(value != undefined){
			changeState(object,"最大储备",value + 40)
		}
		else{
			console.log("该单位不具备储备属性")
		}
	}

    appendCharacteristicDic(小嗉囊)
};
XiaoSuNang()

//「虫母」
function ChongMu(){
	var 虫母 = new Characteristic
	changeState(虫母,{
		"名称":"虫母",
		"词条":"身份",
		"信息":"该单位能够产下虫卵，借此逐步扩张虫群。<br>\
				令该单位获得词条：[产卵者]，解锁工作：[产卵]<br>\
				令该单位获得特殊属性：[产卵：+5卵/回合]。"
	})
	虫母.函数.效果 = function(object){
		//令对象获得新词条：产卵者，这是可以进行产卵工作的标志词条
		changeState(object,"词条","产卵者")
		
		//增加对象的进入函数，令其进入某个虫巢时，令该虫巢获得产卵工作
		var func = function(bugNest){
			appendWork(bugNest,bugNest,"产卵")
		}
		appendFunction(object,"进入",func)
		
		//令对象获得特殊属性：产卵
		if(!haveState(object,"产卵")){
			appendState(object,"特殊","产卵","+5","卵/回合")
		}
	}

	appendCharacteristicDic(虫母)
}
ChongMu()













