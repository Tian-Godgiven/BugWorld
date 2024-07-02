import { objectToDiv } from "../../Modules/objectDiv"
import { getFreeBug } from "../../Object/Bug"
import { getFocusingBugNest } from "../../Object/BugNest"
import { createFacility } from "../../Object/Facility"
import { startWork } from "../../Object/Work"
import { haveEntry } from "../../State/Entry"
import { stateValue } from "../../State/State"
import { createChooseTile } from "../../Tiles/chooseTile"
import { createOrderDiv } from "../../Tiles/order_tile/orderMenu"
import { getOffsetBeside } from "../../app/global_ability"

export const 产卵 = {
    效果:function(work,object){
	    //令对象所在的虫巢增加其"产卵"属性对应数量的"虫卵"单位
	    var value = stateValue(object,"产卵") * stateValue(object,"数量")
    },
    需求:function(work,object){
        //对象的工作属性>=5，且具备词条[产卵者]
        return (stateValue(object,"工作") >= 5 && haveEntry(object,"产卵者"))
    },
    效率:function(work,object){
        //返回对象的产卵属性值
	    return stateValue(object,"产卵")
    }
}


export const 觅食 = {
    效果:function(work,object){
	    //获得等同于效率的食物
    },
    需求:function(work,object){
        //对象的工作属性不低于5，拥有[成虫]词条
	    return (stateValue(object,"工作") >= 5 && haveEntry(object,"成虫"))
    },
    效率:function(work,object){
        //返回单位的工作能力
	    return stateValue(object,"工作") * 10
    }
}

export const 探索 = {
    效果:function(work,object){
    },
    需求:function(work,object){
        //对象的工作属性不低于5，拥有[成虫]词条
	    return (stateValue(object,"工作") >= 5 && haveEntry(object,"成虫"))
    },
    效率:function(work,object){
        //返回单位的工作能力
	    return stateValue(object,"工作")
    }
}

export const 哺育 = {
    效果:function(work,object){
    },
    需求:function(work,object){
        //对象拥有[成虫]或[虫母]词条
	    return haveEntry(object,"成虫","虫母")
    },
    效率:function(work,object){
	    return 1
    }
}

export const 修建设施 = {
    选择:function(work,div){
        //获得其choose_id用作chooseTile_id
        const choose_id = $(div).attr("choose_id")

        //创建一个选择Tile，内容为该虫巢当前已解锁的设施
        const choose_title= "选择设施"
        const choose_inner = "<div>选择修建的目标设施:</div>"
        //生成选项
        const choices = []
        const bugNest = getFocusingBugNest()
        for(let facility_key in bugNest.已解锁.设施建造){
            let facility = createFacility(facility_key,"预览",null)
            const objectDiv = $(objectToDiv(facility)).data("object",facility)
            choices.push({
                选项内容:objectDiv,
                选项事件:{
                    选择时:function(){
                        //返回设施对应的建造工作
                        return bugNest.已解锁.设施建造[facility_key]
                    }
                }
            })
            //清除临时的设施对象
            facility = null
        }
        const choose_ability = {
            chooseTile_id:choose_id,
            重复:"关闭",
            选项排列:"竖向",
            复选样式:"arrow",
            位置:getOffsetBeside($(div))
        }
        const result = createChooseTile(choose_title,choose_inner,choices,choose_ability)
        if(result){
            const {chooseTile,submitEmitter,submit_id} = result
            //监听对应的submit_id的返回的建造工作信息，开始这个建造工作
            submitEmitter.on(submit_id,(build_work)=>{
                if(build_work){
                   startWork(bugNest,build_work,"facility")
                }
            })
        }
        
    }
}