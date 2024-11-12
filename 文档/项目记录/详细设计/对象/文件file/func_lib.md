[toc]

# 对象行为文件func_lib

是存储着object对象的[行为]属性的行为Movement对象的文件，是一个js文件

## 结构

func_lib文件内容标准格式，结构1,2,3均为不定数量的结构，但是结构3不可以出现在结构1,2的内容当中，结构1,2,3都可以出现在结构3的内容中。

~~~
export const object对象的唯一key = {
	//结构1：完整的行为对象结构必须搭配“时间标识（也就是“之前”，“当时”，“之后”使用
	行为对象的key : {
		*之前:{
			*词条:词条数组,默认为空数组
			*优先级:数字,默认为0
			效果:函数function,不可为空
		},
		当时:{内容同上}//如果使用了“之前”或“之后”，则“当时”不可为空
		*之后:{内容同上}
	}
	
	//结构2：简略版，直接使用一个函数作为该行为对象的[当时→效果]，其余值均为默认
	行为对象的key : 函数function
	//或者指名对应函数的时间
	行为对象的key : {
		之前 : 函数function
		当时 : 函数function	
	}
	
	//结构3：行为对象字典
	行为对象字典key : {
		行为对象的key : 行为对象值，即为上述两种结构的内容
		行为对象字典key{} //在字典内可以继续防止字典
	}
}
~~~

### 结构实例

~~~
export const 孵化室 = {
	//结构1
	获得 : {
		之前: {
			词条:["aaa","bbb"],
			优先级:999,
			效果:function(){}
		},
		当时: {
			词条:["ccc","ddd"],
			优先级:123,
			效果:function(){}
		}
	}
	//结构2
	失去 : function(){},
	效果 : {
		之前:function(){}
	}
	//结构3
	操作 : {
		启用:function(){},
		停用:function(){
			当时 : function(){},
			之后 : {
				词条:["eee","fff"],
				优先级:-100,
				效果:function(){}
			}
		}
	}
}
~~~



## 使用

​	1.通过`import "自定义变量名称" from "调用者到func_lib.js文件的路径"`获得该func_lib的内容，存储在“自定义变量名称”当中
​	2.通过object_key获取到对应object的func内容，并使用深复制获得对应的拷贝

~~~
eg：const object_func = _.cloneDeep(自定义变量名称[object_key])
~~~

​	3.使用`initMovement()`函数初始化行为对象，并绑定在object[行为]中
~~~
initMovement(object,object_func)
~~~

​	4.使用`runObejectMovement()`函数调用对象的指名行为
~~~
runObjectMovement(object,行为key/行为key数组)
eg:
	runObjectMovement(object,"获得")
	runObjectMovement(object,["操作","启用"])
~~~

