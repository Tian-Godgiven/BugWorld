import { random } from "lodash"
import { stateValue } from "../../State/State"

export const 虫群折损 = {
    开始:function(event,bugNest){
        const 强度 = stateValue(event,"强度")
        const min = Math.min(1,强度)
        const max = Math.max(10,强度 * 5)
        const value = random(min,max)
        console.log(`虫群折损了${value}个单位`)
    },
    开始需求:function(event,bugNest){
        return true
    }
}