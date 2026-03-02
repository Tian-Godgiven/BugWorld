/**
 * 信息显示工具函数 - 桥接层
 *
 * 这些函数保留用于兼容性，实际使用中应该直接使用 InformationModal.vue 组件
 */

import { stateValue } from "../core/state/State"
import { objectStateToTileData } from "./stateDiv"

/**
 * 显示对象信息
 *
 * @param object - 游戏对象
 *
 * 注意：在 Vue 中，应该使用 InformationModal.vue 组件
 * 此函数保留用于向后兼容
 */
export function showInformation(object: any): void {
    console.warn("[showInformation] 此函数是桥接函数，请使用 InformationModal.vue 组件")

    const name = stateValue(object, "名称")
    const information = objectStateToTileData(object)

    // 应该通过 InformationModal 组件来显示
    console.log("显示对象信息：", { name, information, object })
}
