import { addAbleWorkToBugNest } from "../../Object/Work"
import { appendFunction } from "../../app/global_ability"
import { haveState , appendState , getState, pushToState , changeState } from "../../State/State"
import { getEntry } from "../../State/Entry"
import { createImpact, impactToObjectState } from "../../State/Impact"
import { createEffect, getEffectFrom , loseEffectFrom , runEffect , stopEffect } from "../../State/Effect"
import { create } from "lodash"

//嗉囊特性的通用函数
	function 嗉囊func(){
		//创建一个效果对象的初步构造
		const 词条 = ["器官"]
		const 优先级 = 0
		const 函数 = {
			生效 : function(effect,object){
				if(getState(object,"储备")){
					//令对象的"储备max"添加对应参数的影响
					const value = effect.参数
					const impact = createImpact(effect,"+"+value,1)
					impactToObjectState(impact,object,"储备","max")
				}
				else{
					console.log("该单位不具备储备属性")
				}
			},
			失效 : function(effect,object){
				//失去这个效果与其施加的一切影响
				loseImpactFromEffect(effect,object)
			}
		}
		let effect = createEffect(词条,优先级,函数)
		
		return {
			//获得这个特性时,令对象获得对应的效果
			获得 : function(chara,object){
				const para = getState(chara,"储备")
				getEffectFrom(object,effect,para,chara)
				//使得该效果起效
				runEffect(effect)
			},
			//失去这个特性时,令对象失去对应的效果
			失去 : function(chara,object){
				loseEffectFrom(object,effect,chara)
			}
		}
	}
	//令对象的"最大储备"+140
	export const 大嗉囊 = 嗉囊func()
	//令对象的"最大储备"+90
	export const 嗉囊 = 嗉囊func()
	//令对象的"最大储备"+40
	export const 小嗉囊 = 嗉囊func()


//虫母特性
export const 虫母 = function(){
	//创建效果对象
	const 词条 = ["身份"]
	const 优先级 = 0
	const 函数 = {
		生效:function(effect,object,para,chara){
			//令对象获得新词条：产卵者，这是可以进行产卵工作的标志词条
			getEntry(object,"产卵者")
			// //为对象的"加入"行为中添加效果：令其所属的虫巢获得产卵工作,这个工作的来源为该特性
			// const func = function(object,bugNest){
			// 	addAbleWorkToBugNest(bugNest,chara,"产卵")
			// }
			// appendFunction(object,"加入",func)
			//令对象获得特殊属性：产卵
			if(!haveState(object,"产卵")){
				const new_state = {
					产卵 : {
						数值 : para,
						单位 : "卵/回合"
					}
				}
				appendState(object,effect,"特殊",new_state)
			}
		},
		失效:function(effect,object,para,chara){
			//令对象失去
		}
	}
	const effect = createEffect(词条,优先级,函数)
	return {
		获得 : function(chara,object){
			const para = getState(chara,"产卵")
			getEffectFrom(object,effect,para,chara)
			runEffect(effect)
		},
		失去 : function(chara,object){
			loseEffectFrom(object,effect,chara)
			stop(effect)
		}
	}
}()