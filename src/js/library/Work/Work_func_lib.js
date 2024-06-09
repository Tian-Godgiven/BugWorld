import { haveEntry } from "../../State/Entry"
import { stateValue } from "../../State/State"

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