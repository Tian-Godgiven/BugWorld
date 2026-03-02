/**
 * 设施行为函数库
 */

/**
 * 设施行为对象接口
 */
interface FacilityBehavior {
    获得?: (facility: any, bugNest: any) => void
    效果?: (facility: any, bugNest: any) => void
    操作?: Record<string, () => void>
    [key: string]: any
}

/**
 * 虫母室设施
 */
export const 虫母室: FacilityBehavior = {
    获得: function (facility, bugNest) {
        // 令虫巢对象最大空间+5
    },
    效果: function (facility, bugNest) {
        // 令虫巢对象中的[虫母]的防御+5*等级
    },
    操作: {
        测试1: function () {
            console.log("123")
        }
    }
}

/**
 * 孵化室设施
 */
export const 孵化室: FacilityBehavior = {
    获得: function (facility, bugNest) {
        // 令虫巢对象最大空间+1
    },
    效果: function (facility, bugNest) {
        // TODO: 实现效果
    },
    操作: {
        启用: function () {
            console.log("123")
        },
        停用: function () {
            console.log("测试2")
        }
    }
}
