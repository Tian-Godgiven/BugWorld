//虫群对象的函数lib
import { spaceEnoughForBug } from "../../Object/Bug"
import { occupyBugNestSpace } from "../../Object/BugNest"


export const 虫后 = {
    加入需求:function(bug,bugNest){
        //空间足够就行
        return spaceEnoughForBug(bug,bugNest)
    },
    加入 : function(bug,bugNest){
        //占据空间
        occupyBugNestSpace(bugNest,bug)
    }
}