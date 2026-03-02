import { ref } from 'vue'
import { EventEmitter } from 'events'
import { createRandomId } from '@/utils/global_ability'

/**
 * ChooseTile管理器
 *
 * 用于创建和管理选择对话框
 */

export interface ChoiceOption {
    选项内容: string | HTMLElement
    选项事件?: {
        选中时?: (containerObject: any, choiceObject: any, choiceDiv: any) => any
        失去选中时?: (containerObject: any, choiceObject: any, choiceDiv: any) => any
        选择时?: (containerObject: any, choiceObject: any, choiceDiv: any) => any
        未选择时?: (containerObject: any, choiceObject: any, choiceDiv: any) => any
    }
    选项样式类?: string[]
    选项样式?: Record<string, string>
    对象?: any
    优先级?: number | string
    默认选中?: boolean
}

export interface ChooseTileAbility {
    chooseTile_id?: string
    重复?: boolean | '关闭' | '取代'
    标题居中?: boolean
    对象?: any
    立即选择?: boolean
    关闭?: boolean
    复选?: {
        max?: number
        min?: number
    }
    复选样式?: 'checkbox' | 'arrow' | false
    确认?: boolean
    取消?: boolean
    返回?: boolean | 'auto'
    选项排列?: '横向' | '竖向'
    通用样式?: Record<string, string>
    位置?: { top?: number; left?: number; right?: number; bottom?: number }
    尺寸?: { width?: string | number; height?: string | number }
}

export interface ChooseTileInstance {
    id: string
    title: string
    text: string | HTMLElement
    choices: ChoiceOption[]
    ability: ChooseTileAbility
    submitId: string
    已选择: number[]
    复选值: { max: number; min: number }
    复选样式: 'checkbox' | 'arrow' | false
    选项排列: '横向' | '竖向'
    确认: boolean
    取消: boolean
    返回: boolean | 'auto'
    自动关闭: boolean
    立即选择: boolean
    通用样式?: Record<string, string>
}

const chooseTiles = ref<ChooseTileInstance[]>([])
const submitEmitter = new EventEmitter()

/**
 * 创建选择Tile
 */
export function createChooseTile(
    title: string = '选择',
    text: string | HTMLElement,
    choice: ChoiceOption[],
    ability: ChooseTileAbility = {}
): { chooseTile: ChooseTileInstance; submitEmitter: EventEmitter; submit_id: string } | false {
    // 检查是否存在相同chooseTile_id的元素
    const chooseTile_id = ability.chooseTile_id
    if (chooseTile_id) {
        const existingIndex = chooseTiles.value.findIndex((t) => t.id === chooseTile_id)
        if (existingIndex !== -1) {
            const 重复 = ability.重复 || false

            if (重复 === true) {
                // 允许重复，不做处理
            } else if (重复 === '关闭') {
                // 关闭旧的chooseTile
                chooseTiles.value.splice(existingIndex, 1)
                return false
            } else if (重复 === '取代') {
                // 取代旧的chooseTile
                chooseTiles.value.splice(existingIndex, 1)
            } else {
                // 默认禁止创建新的chooseTile
                return false
            }
        }
    }

    // 复选设置
    let max = 1
    let min = 1
    if (ability.复选) {
        max = ability.复选.max && ability.复选.max >= 1 ? ability.复选.max : 1
        min = ability.复选.min && ability.复选.min >= 1 ? ability.复选.min : 1
    }
    if (max < min) {
        throw new Error('错误：在设置选项容器的复选值时，复选值的max小于了min')
    }

    // 复选样式
    let 复选样式: 'checkbox' | 'arrow' | false = false
    if (max > 1) {
        复选样式 = 'checkbox'
    }
    if (ability.复选样式 != null) {
        复选样式 = ability.复选样式
    }

    // 确认按钮
    const 确认 = ability.确认 !== false

    // 取消按钮
    const 取消 = ability.取消 !== false

    // 返回值设置
    let 返回: boolean | 'auto' = 'auto'
    if (ability.返回 === true || ability.返回 === false) {
        返回 = ability.返回
    }

    // 选项排列
    let 选项排列: '横向' | '竖向' = '横向'
    if (max > 1) {
        选项排列 = '竖向'
    }
    if (ability.选项排列) {
        选项排列 = ability.选项排列
    }

    // 自动关闭
    let 自动关闭 = false
    if (ability.关闭 !== true && ability.关闭 !== false) {
        自动关闭 = true
    }

    // 立即选择
    const 立即选择 = ability.立即选择 === true

    // 生成submit_id
    const submit_id = 'submit_id_' + createRandomId(8)

    // 创建实例
    const instance: ChooseTileInstance = {
        id: chooseTile_id || createRandomId(8),
        title,
        text,
        choices: choice,
        ability,
        submitId: submit_id,
        已选择: [],
        复选值: { max, min },
        复选样式,
        选项排列,
        确认,
        取消,
        返回,
        自动关闭,
        立即选择,
        通用样式: ability.通用样式
    }

    // 添加到列表
    chooseTiles.value.push(instance)

    return {
        chooseTile: instance,
        submitEmitter,
        submit_id
    }
}

/**
 * 移除选择Tile
 */
export function removeChooseTile(id: string): void {
    const index = chooseTiles.value.findIndex((t) => t.id === id)
    if (index !== -1) {
        chooseTiles.value.splice(index, 1)
    }
}

/**
 * 获取所有选择Tile
 */
export function getChooseTiles() {
    return chooseTiles
}

/**
 * 获取EventEmitter
 */
export function getSubmitEmitter() {
    return submitEmitter
}
