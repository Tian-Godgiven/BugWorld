

export const 虫母室 = {
	获得 : function(facility,bugNest){
		//令虫巢对象最大空间+5
		
	},
	效果 : function(facility,bugNest){
		//令虫巢对象中的[虫母]的防御+5*等级
	},
	操作:{
		测试1:function(){
			console.log("123")
		}
	}
}

export const 孵化室 = {
	获得 : function(facility,bugNest){
		//令虫巢对象最大空间+1
	},
	效果 : function(facility,bugNest){

	},
	操作 : {
		启用:function(){
			console.log("123")
		},
		停用:function(){
			console.log("测试2")
		}
	}
}
