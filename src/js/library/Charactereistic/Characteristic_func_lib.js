import { unlockWorkToBugNest, deleteWorkFrom } from "../../Object/Work"
import { addMovementEffect, deleteMovementEffect } from "../../State/Movement"
import { haveState , addStateTo , stateValue, pushToState , changeState, deleteStateFrom } from "../../State/State"
import { getEntry, loseEntry } from "../../State/Entry"
import { createImpact, impactToObject, loseImapctFrom } from "../../State/Impact"
import { loseCharacteristic, runCharaFunction, runCharacteristic } from "../../Object/Characteristic"

//嗉囊特性的通用行为
	function 嗉囊func(){
		return {
			//获得这个特性时,令其生效
			获得 : function(chara){
				runCharaFunction(chara,"生效")
			},
			//失去这个特性时,令对象失去对应的效果
			失去 : function(chara){
				runCharaFunction(chara,"失效")
			},
			//令对象的"储备max"添加对应参数的影响
			生效 : function(chara,object){
				if(stateValue(object,"储备")){
					const value = stateValue(chara,["参数","储备"])
					const impact = createImpact(chara,value,1)
					impactToObject(impact,object,["储备","max"])
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
		},
		失去 : function(chara){
			runCharaFunction(chara,"失效")
		},
		生效:function(chara,object){
			//令对象获得新词条：产卵者，这是可以进行产卵工作的标志词条
			getEntry(object,"产卵者")
			//当对象加入虫巢时，令其所属的虫巢获得产卵工作,这个工作的来源为该特性
			const move_effect = {
				优先级 : 0,
				效果 : function(object,bugNest){
					unlockWorkToBugNest("产卵",bugNest,chara)
				}
			}
			addMovementEffect(object,"加入",move_effect, chara, "当时", "new")
			//令对象获得特殊属性：产卵
			if(!haveState(object,"产卵")){
				const 产卵属性 = {
					属性名 : "产卵",
					数值 : stateValue(chara,"产卵"),
					单位 : "卵/回合"
				}
				addStateTo(object,chara,"特殊",产卵属性)
			}
		},
		失效:function(chara,object){
			//令对象失去产卵者词条
			loseEntry(object,"产卵者")
			//从对象的“加入”行为中删除对应来源为chara的行为对象
			deleteMovementEffect(object,chara,"加入")
			//从对象所在的虫巢中删除对应来源的可进行工作
			const bugNest = stateValue(object,"所属")
			deleteWorkFrom(bugNest,chara)
			//令对象失去对应参数的产卵属性
			deleteStateFrom(object,chara,["特殊","产卵"])
		}
	}
}()

