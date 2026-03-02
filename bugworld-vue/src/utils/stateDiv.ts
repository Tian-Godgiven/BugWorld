/**
 * 属性显示工具函数 - 桥接层
 *
 * 这些函数保留用于兼容性，实际使用中应该直接使用 StateDisplay.vue 组件
 *
 * 使用 StateDisplay.vue 组件的方式：
 * ```vue
 * <StateDisplay :object="object" :states="object.属性" />
 * ```
 */

/**
 * 将对象的属性转化为显示数据
 *
 * @param object - 游戏对象
 * @returns 属性显示数据
 *
 * 注意：在 Vue 中，应该使用 StateDisplay.vue 组件
 * 此函数保留用于向后兼容
 */
export function objectStateToTileData(object: any): any {
    return {
        object,
        states: object.属性
    }
}

/**
 * 将属性对象转换为显示数据
 *
 * @param object - 游戏对象
 * @param state_name - 属性名
 * @param state_object - 属性对象
 * @returns 属性显示数据
 *
 * 注意：在 Vue 中，应该使用 StateDisplay.vue 组件
 * 此函数保留用于向后兼容
 */
export function stateToDiv(object: any, state_name: string, state_object: any): any {
    if (!state_object) {
        console.error("属性对象不存在：", object, state_name, state_object)
        return false
    }

    return {
        name: state_name,
        value: state_object,
        object
    }
}
