import { popFromState, pushToState } from "./State"

/**
 * 状态对象类
 */
export class Status {
    type: string
    key: string
    属性: {
        名称: string | null
        持续: number | null
        信息: string | null
    }

    constructor() {
        this.type = "object"
        this.key = ""
        this.属性 = {
            名称: null,
            持续: null,
            信息: null
        }
    }
}

/**
 * 添加一个状态对象到 object 的[属性→状态]中
 */
export function getStatusToObject(object: any, status: any): void {
    pushToState(object, "状态", status)
}

/**
 * 从对象的[属性→状态]中去除一个状态对象
 */
export function loseStatusFromObject(object: any, status: any): void {
    popFromState(object, "状态", status)
}
