/**
 * 对象显示工具函数 - 桥接层
 *
 * 这些函数保留用于兼容性，实际使用中应该直接使用 ObjectDiv.vue 组件
 *
 * 使用 ObjectDiv.vue 组件的方式：
 * ```vue
 * <ObjectDiv :object="object" :method="method" @click="handleClick" />
 * ```
 */

import { stateValue } from "../core/state/State"

/**
 * 将一个对象转化为显示信息
 *
 * @param object - 对象
 * @param method - 显示方法（"num" 显示数量，"level" 显示等级）
 * @returns 对象的显示信息
 *
 * 注意：在 Vue 中，应该使用 ObjectDiv.vue 组件
 * 此函数保留用于向后兼容
 */
export function objectToDiv(object: any, method?: "num" | "level"): any {
    if (!object) {
        console.log("对象异常，不存在，其具体值为：" + object)
        return false
    }

    const info: any = {
        object,
        method,
        isCharacteristic: object?.constructor?.name === "Characteristic",
        名称: object.type === "object" ? stateValue(object, "名称") : object,
        数量: method === "num" && object.type === "object" ? stateValue(object, "数量") : null,
        等级: method === "level" && object.type === "object" ? stateValue(object, "等级") : null
    }

    return info
}

/**
 * 显示对象信息
 *
 * @param object - 对象
 *
 * 注意：在 Vue 中，应该通过 InformationModal 组件来显示信息
 * 此函数保留用于向后兼容
 */
export function showInformation(object: any): void {
    console.warn("[showInformation] 请使用 InformationModal 组件")
    console.log("显示对象信息：", object)
}

/**
 * 创建对象显示的DOM元素（用于GridManager等需要原生DOM的场景）
 *
 * @param object - 游戏对象
 * @param method - 显示模式（可选）
 * @returns DOM元素
 */
export function createObjectDiv(object: any, method?: "num" | "level"): HTMLElement {
    const div = document.createElement("div")
    div.className = "object-div"

    const name = stateValue(object, "名称")
    if (method === "num") {
        const num = stateValue(object, "数量")
        div.textContent = `${name} x ${num}`
    } else if (method === "level") {
        const level = stateValue(object, "等级")
        div.textContent = `${name} Lv.${level}`
    } else {
        div.textContent = name
    }

    // 绑定对象数据
    ;(div as any).__object__ = object

    return div
}

/**
 * 将对象数组转换为可折叠的显示元素
 *
 * @param objectArray - 对象数组（按名称分组）
 * @returns DOM元素
 */
export function objectArrayToDiv(objectArray: any): HTMLElement {
    const container = document.createElement("div")
    container.className = "objectArray"

    for (const key in objectArray) {
        const objects = objectArray[key]

        if (objects.length === 1) {
            const object = objects[0]
            const objectDiv = createObjectDiv(object, "num")
            container.appendChild(objectDiv)
        } else {
            // 获取同名对象的总数
            let objectNum_all = 0
            const objectInner = document.createElement("div")
            objectInner.className = "objectArray_inner"
            objectInner.style.display = "none" // 默认折叠

            for (const object of objects) {
                objectNum_all += stateValue(object, "数量")
                const objectDiv = createObjectDiv(object, "num")
                objectInner.appendChild(objectDiv)
            }

            // 创建标题
            const objectTitle = document.createElement("div")
            objectTitle.className = "objectArray_title"
            objectTitle.textContent = `${key} x ${objectNum_all}`
            objectTitle.style.cursor = "pointer"

            // 绑定点击事件（折叠/展开）
            objectTitle.addEventListener("click", () => {
                if (objectInner.style.display === "none") {
                    objectInner.style.display = "block"
                } else {
                    objectInner.style.display = "none"
                }
            })

            const wrapper = document.createElement("div")
            wrapper.appendChild(objectTitle)
            wrapper.appendChild(objectInner)
            container.appendChild(wrapper)
        }
    }

    return container
}
