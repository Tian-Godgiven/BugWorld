//这里是建设设施的工作函数

export const 虫母室 = {
    建设 : {
        结算 : function(work){
            //增加该工作的当前进度，增加量等同于效率
            var old_progress = getState(work,"当前进度")
            var effeciency = getState(work,"效率")
            changeState(work,"当前进度",old_progress + effeciency)
        },
        效果 : function(work,bugNest){
            //为该工作所属的虫巢添加虫母室x1
            var facility = createFacility("虫母室",1)
            appendFacility(bugNest,facility)
        },
        需求 : function(work,object){
            //对象的虫均当前工作>=10，且具备词条[成虫]
            var 当前工作 = getEqualWorkPower(object)
            return (当前工作 >= 10 && haveEntry(object,"成虫"))
        },
        效率 : function(work,object){
            //返回对象的工作属性值
            return getState(object,"工作")
        }
    },
    升级 : {
        加固 : {
            结算 : function(work){
                //增加该工作的当前进度，增加量等同于工作效率
                var old_progress = getState(work,"当前进度")
                var effeciency = getState(work,"效率")
                changeState(work,"当前进度",old_progress + effeciency)
            },
            效果 : function(work,bugNest){
                //令该工作所属的虫巢的虫母室等级+1，令虫巢对象强度+1
                var 来源 = work.功能.来源
                addState(bugNest,"强度",+1)
                addState(来源,"等级",+1)
            },
            需求 : function(work,object){
                //对象的虫均当前工作>=10，且具备词条[成虫]
                var 当前工作 = getEqualWorkPower(object)
                return (当前工作 >= 10 && haveEntry(object,"成虫"))
            },
            效率 : function(work,object){
                //返回对象的工作属性值
                return getState(object,"工作")
            }
        },
        扩建 : {
            结算 : function(work){
                //增加该工作的当前进度，增加量等同于工作效率
                var old_progress = getState(work,"当前进度")
                var effeciency = getState(work,"效率")
                changeState(work,"当前进度",old_progress + effeciency)
            },
            效果 : function(bugNest,work){
                //令该工作所属的虫母室等级+1，令虫巢对象最大空间+5
                var 来源 = work.功能.来源
                addState(bugNest,"最大空间",+5)
                addState(来源,"等级",+1)
            },
            需求 : function(object){
                //对象的虫均当前工作>=10，且具备词条[成虫]
                var 当前工作 = getEqualWorkPower(object)
                return (当前工作 >= 10 && haveEntry(object,"成虫"))
            },
            效率 : function(object){
                //返回对象的工作属性值
                return getState(object,"工作")
            }
        }
    }
    
}

export const 孵化室 = {
    建设:{
        结算 : function(work){
            //增加该工作的当前进度，增加量等同于效率
            var old_progress = getState(work,"当前进度")
            var effeciency = getState(work,"效率")
            changeState(work,"当前进度",old_progress + effeciency)
        },
        效果 : function(work,bugNest){
            //为该工作所属的虫巢添加虫母室x1
            var facility = createFacility("孵化室",1)
            appendFacility(bugNest,facility)
        },
        需求 : function(work,object){
            //对象的虫均当前工作>=10，且具备词条[成虫]
            var 当前工作 = getEqualWorkPower(object)
            return (当前工作 >= 10 && haveEntry(object,"成虫"))
        },
        效率 : function(work,object){
            //返回对象的工作属性值
            return getState(object,"工作")
        }
    }
}