import { random } from "lodash"
import { stateValue } from "../../core/state/State"

/**
 * 事件行为对象接口
 */
interface EventBehavior {
    开始?: (event: any, bugNest: any, eventStrength?: number) => void
    开始需求?: (event: any, bugNest: any) => boolean
    结束?: (event: any, bugNest: any) => void
    [key: string]: any
}

/**
 * 虫群折损事件
 */
export const 虫群折损: EventBehavior = {
    开始: function (event, bugNest) {
        const 强度 = stateValue(event, "强度")
        const min = Math.min(1, 强度)
        const max = Math.max(10, 强度 * 5)
        const value = random(min, max)
        console.log(`虫群折损了${value}个单位`)
    },
    开始需求: function (event, bugNest) {
        return true
    }
}
