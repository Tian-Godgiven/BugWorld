import { getFreeBug } from "../../core/objects/Bug"
import { getFocusingBugNest } from "../../core/objects/BugNest"
import { createFacility } from "../../core/objects/Facility"
import { startWork } from "../../core/objects/Work"
import { haveEntry } from "../../core/state/Entry"
import { hiddenValue } from "../../core/state/Hidden"
import { stateValue } from "../../core/state/State"
// createChooseTile 和 createOrderDiv 由UI层提供，此处暂时注释
// import { createChooseTile } from "../../components/tiles/ChooseTile.vue"
// import { createOrderDiv } from "../../components/menus/OrderMenu.vue"
// import { getOffsetBeside } from "../../utils/global_ability"

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
    // 选择函数为UI层职责，由Vue组件实现
    // 原始实现依赖jQuery DOM操作和createChooseTile，迁移后由组件层接管
    选择:function(work: any, div: any){
        // TODO: 由Vue组件层实现此UI交互逻辑
        // 原逻辑：创建选择Tile，展示已解锁设施列表，选择后开始建造工作
        const bugNest = getFocusingBugNest()
        const 设施建造 = hiddenValue(bugNest,["已解锁","设施建造"])
        // UI交互部分由组件层处理
    }
}