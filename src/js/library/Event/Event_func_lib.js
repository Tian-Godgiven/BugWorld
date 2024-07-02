import { random } from "lodash"

export const 虫群折损 = {
    "开始":function(event,bugNest){
        const value = random(1,10)
        console.log(`虫群折损了${value}个单位`)
    },
    "开始需求":function(event,bugNest){
        return true
    }
}