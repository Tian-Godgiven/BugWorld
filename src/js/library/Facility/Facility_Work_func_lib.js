//这里是建造设施的工作行为
import { haveEntry } from "../../State/Entry"
import { stateValue } from "../../State/State"

export const 虫母室 = {
    建造 : {
        结算 : function(work){
            //增加该工作的当前进度，增加量等同于效率
            var old_progress = stateValue(work,"当前进度")
            var effeciency = stateValue(work,"效率")
            
        },
        效果 : function(work,bugNest){
            //为该工作所属的虫巢添加虫母室x1
        },
        需求 : function(work,object){
            //对象工作>=10，且具备词条[成虫]
            return (stateValue(object,"工作") >= 10 && haveEntry(object,"成虫"))
        },
        效率 : function(work,object){
            //返回对象的工作属性值
            console.log("123")
            return stateValue(object,"工作")
        }
    },
    升级 : {
        加固 : {
            结算 : function(work){
                //增加该工作的当前进度，增加量等同于工作效率
                var old_progress = stateValue(work,"当前进度")
                var effeciency = stateValue(work,"效率")
                changeState(work,"当前进度",old_progress + effeciency)
            },
            效果 : function(work,bugNest){
                //令该工作所属的虫巢的虫母室等级+1，令虫巢对象强度+1
            },
            需求 : function(work,object){
                //对象的虫均当前工作>=10，且具备词条[成虫]
                return (stateValue(object,"工作") >= 10 && haveEntry(object,"成虫"))
            },
            效率 : function(work,object){
                //返回对象的工作属性值
                return stateValue(object,"工作")
            }
        },
        扩建 : {
            结算 : function(work){
                //增加该工作的当前进度，增加量等同于工作效率
            },
            效果 : function(work,bugNest){
                //令该工作所属的虫母室等级+1，令虫巢对象最大空间+5
            },
            需求 : function(work,object){
                //对象的虫均当前工作>=10，且具备词条[成虫]
                return (stateValue(object,"工作") >= 10 && haveEntry(object,"成虫"))
            },
            效率 : function(work,object){
                //返回对象的工作属性值
                return stateValue(object,"工作")
            }
        }
    },
    拆除 : {
        结算 : function(work){
            //增加该工作的当前进度，增加量等同于工作效率
            var old_progress = stateValue(work,"当前进度")
            var effeciency = stateValue(work,"效率")
            changeState(work,"当前进度",old_progress + effeciency)
        },
        效果 : function(work,bugNest){
            //令虫巢失去这座虫母室
        },
        需求 : function(work,object){
            //对象的虫均当前工作>=10，且具备词条[成虫]
            return (stateValue(object,"工作") >= 10 && haveEntry(object,"成虫"))
        },
        效率 : function(work,object){
            //返回1
            return 1
        }
    }
    
}

export const 孵化室 = {
    建造:{
        结算 : function(work){
            //增加该工作的当前进度，增加量等同于效率
        },
        效果 : function(work,bugNest){
            //为该工作所属的虫巢添加虫母室x1
        },
        需求 : function(work,object){
            //对象的虫均当前工作>=10，且具备词条[成虫]
            return (stateValue(object,"工作") >= 10 && haveEntry(object,"成虫"))
        },
        效率 : function(work,object){
            //返回对象的工作属性值
            return stateValue(object,"工作")
        }
    },
    拆除:{
        结算 : function(work){
            //增加该工作的当前进度，增加量等同于工作效率
            var old_progress = stateValue(work,"当前进度")
            var effeciency = stateValue(work,"效率")
            changeState(work,"当前进度",old_progress + effeciency)
        },
        效果 : function(work,bugNest){
            //令虫巢失去这座孵化室
        },
        需求 : function(work,object){
            //对象的虫均当前工作>=10，且具备词条[成虫]
            return (stateValue(object,"工作") >= 10 && haveEntry(object,"成虫"))
        },
        效率 : function(work,object){
            //返回1
            return 1
        }
    }
}