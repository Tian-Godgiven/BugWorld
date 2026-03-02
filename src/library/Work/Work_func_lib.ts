/**
 * 工作函数库
 * 从 src/js/library/Work/Work_func_lib.js 迁移
 */

import { stateValue } from '@/core/state/State'
import { haveEntry } from '@/core/state/Entry'
import { hiddenValue } from '@/core/state/Hidden'
import { getFocusingBugNest } from '@/core/objects/BugNest'
import { createFacility } from '@/core/objects/Facility'
import { startWork } from '@/core/objects/Work'
import { createChooseTile, getSubmitEmitter } from '@/composables/useChooseTile'
import { createObjectDiv } from '@/utils/objectDiv'

/**
 * 产卵工作
 */
export const 产卵 = {
    效果: function (work: any, object: any) {
        // 令对象所在的虫巢增加其"产卵"属性对应数量的"虫卵"单位
        const value = stateValue(object, '产卵') * stateValue(object, '数量')
    },
    需求: function (work: any, object: any) {
        // 对象的工作属性>=5，且具备词条[产卵者]
        return stateValue(object, '工作') >= 5 && haveEntry(object, '产卵者')
    },
    效率: function (work: any, object: any) {
        // 返回对象的产卵属性值
        return stateValue(object, '产卵')
    }
}

/**
 * 觅食工作
 */
export const 觅食 = {
    效果: function (work: any, object: any) {
        // 获得等同于效率的食物
    },
    需求: function (work: any, object: any) {
        // 对象的工作属性不低于5，拥有[成虫]词条
        return stateValue(object, '工作') >= 5 && haveEntry(object, '成虫')
    },
    效率: function (work: any, object: any) {
        // 返回单位的工作能力
        return stateValue(object, '工作') * 10
    }
}

/**
 * 探索工作
 */
export const 探索 = {
    效果: function (work: any, object: any) {},
    需求: function (work: any, object: any) {
        // 对象的工作属性不低于5，拥有[成虫]词条
        return stateValue(object, '工作') >= 5 && haveEntry(object, '成虫')
    },
    效率: function (work: any, object: any) {
        // 返回单位的工作能力
        return stateValue(object, '工作')
    }
}

/**
 * 哺育工作
 */
export const 哺育 = {
    效果: function (work: any, object: any) {},
    需求: function (work: any, object: any) {
        // 对象拥有[成虫]或[虫母]词条
        return haveEntry(object, '成虫', '虫母')
    },
    效率: function (work: any, object: any) {
        return 1
    }
}

/**
 * 修建设施工作
 */
export const 修建设施 = {
    选择: function (work: any, element: HTMLElement) {
        // 获取其choose_id用作chooseTile_id
        const choose_id = element.getAttribute('choose_id')

        // 创建一个选择Tile，内容为该虫巢当前已解锁的设施
        const choose_title = '选择设施'
        const choose_text = '<div>选择修建的目标设施:</div>'

        // 生成选项
        const choices: any[] = []
        const bugNest = getFocusingBugNest()
        const 设施建造 = hiddenValue(bugNest, ['已解锁', '设施建造'])

        for (const facility_key in 设施建造) {
            const facility = createFacility(facility_key, '预览', null)
            if (facility) {
                const objectDiv = createObjectDiv(facility)
                choices.push({
                    选项内容: objectDiv,
                    选项事件: {
                        选择时: function () {
                            // 返回设施对应的建造工作
                            return 设施建造[facility_key]
                        }
                    }
                })
            }
        }

        const choose_ability = {
            chooseTile_id: choose_id,
            重复: '关闭',
            选项排列: '竖向',
            复选样式: 'arrow'
            // 位置: getOffsetBeside(element) // TODO: 需要时实现位置计算
        }

        const result = createChooseTile(choose_title, choose_text, choices, choose_ability)
        if (result) {
            const { submit_id } = result
            const submitEmitter = getSubmitEmitter()

            // 监听对应的submit_id的返回的建造工作信息，开始这个建造工作
            submitEmitter.on(submit_id, (build_work: any) => {
                if (build_work) {
                    startWork(bugNest, build_work, 'facility')
                }
            })
        }
    }
}
