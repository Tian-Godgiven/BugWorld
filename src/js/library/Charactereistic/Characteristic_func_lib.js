import { addAbleWorkToBugNest } from "../../Object/Work"
import { appendFunction } from "../../app/global_ability"
import { haveState , appendState , getState, pushToState , changeState } from "../../State/State"
import { getEntry } from "../../State/Entry"
import { createImpact, impactToObjectState, loseImapctFrom } from "../../State/Impact"
import { createEffect, getEffectFrom , loseEffectFrom , runEffect , stopEffect } from "../../State/Effect"
import { loseCharacteristic, runCharaFunction, runCharacteristic } from "../../Object/Characteristic"

//嗉囊特性的通用函数
	function 嗉囊func(){
		const 函数 = {
			//获得这个特性时,令其生效
			获得 : function(chara){
				runCharaFunction(chara,"生效")
			},
			//失去这个特性时,令对象失去对应的效果
			失去 : function(chara){
				runCharaFunction(chara,"失效")
			},
			//令对象的"储备max"添加对应参数的影响
			生效 : function(chara,object,paras){
				if(getState(object,"储备")){
					const value = getState(chara,["参数","储备"])
					const impact = createImpact(chara,value,1)
					impactToObjectState(impact,object,"储备","max")
				}
				else{
					console.log("该单位不具备储备属性")
				}
			},
			//失去对储备属性施加的影响
			失效 : function(chara,object){
				loseImapctFrom(object,"储备",chara)
			}
		}
		
		return 函数
	}
	//令对象的"最大储备"+140
	export const 大嗉囊 = 嗉囊func()
	//令对象的"最大储备"+90
	export const 嗉囊 = 嗉囊func()
	//令对象的"最大储备"+40
	export const 小嗉囊 = 嗉囊func()


//虫母特性
export const 虫母 = function(){
	return {
		获得 : function(chara){
			runCharaFunction(chara,"生效")
			//测试：使得对象获得“+4卵/回合”的影响
			const value = "+4"
			const object = getState(chara,"所属")
			const impact = createImpact(chara,value,1)
			impactToObjectState(impact,object,"产卵")
		},
		失去 : function(chara){
			runCharaFunction(chara,"失效")
		},
		生效:function(chara,object){
			//令对象获得新词条：产卵者，这是可以进行产卵工作的标志词条
			getEntry(object,"产卵者")
			// //为对象的"加入"行为中添加一个效果对象：令其所属的虫巢获得产卵工作,这个工作的来源为该特性
			// const 词条 = ["身份"]
			// const 优先级 = 0
			// const 函数 = {
			// 	生效 : function(effec,object){

			// 	}
			// }
			
			// const func = function(object,bugNest){
			// 	addAbleWorkToBugNest(bugNest,chara,"产卵")
			// }
			// appendFunction(object,"加入",func)
			//令对象获得特殊属性：产卵
			if(!haveState(object,"产卵")){
				const value = getState(chara,"产卵")
				const new_state = {
					产卵 : {
						数值 : value,
						单位 : "卵/回合"
					}
				}
				appendState(object,chara,"特殊",new_state)
			}
		},
		失效:function(chara,object,para,source){
			//令对象失去
		}
		
	}
}()