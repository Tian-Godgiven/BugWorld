import _ from "lodash"
import { newError } from "../../utils/global_ability"

/**
 * 获得一个实体对象的[隐藏]类属性的值
 * 要求这个路径全程有效
 */
export function hiddenValue(object: any, path: string | string[]): any {
    // 如果传入了多个实体对象，则会返回这些实体对象的值的数组
    if (_.isArray(object)) {
        let value_array: any[] = []
        // 遍历实体对象数组
        for (let object_i of object) {
            // 分别获取其功能属性值
            const value = hiddenValue_inner(object_i, path)
            // 如果这个值是一个数组，则将其中的元素添加进 value_array
            if (_.isArray(value)) {
                value_array = value_array.concat(value)
            } else {
                value_array.push(value)
            }
        }
        return value_array
    } else if (object.type === "object") {
        return hiddenValue_inner(object, path)
    }

    function hiddenValue_inner(object: any, path: string | string[]): any {
        let the_object = object["隐藏"]
        let value: any

        if (_.isArray(path)) {
            for (let key of path) {
                if (!the_object) {
                    newError("000", [
                        "访问隐藏属性的路径有误：",
                        object,
                        path
                    ])
                }
                the_object = the_object[key]
            }
            value = the_object
        } else {
            value = the_object[path]
        }

        return value
    }
}

/**
 * 设置或修改隐藏属性的值
 */
export function setHidden(object: any, path: string | string[], value: any): void {
    // 如果传入了多个实体对象，则会设置所有实体对象的值
    if (_.isArray(object)) {
        // 遍历实体对象数组
        for (let object_i of object) {
            setHidden_inner(object_i, path, value)
        }
    } else if (object.type === "object") {
        setHidden_inner(object, path, value)
    }

    function setHidden_inner(object: any, path: string | string[], value: any): void {
        let the_object = object["隐藏"]

        if (_.isArray(path)) {
            const path_copy = [...path] // 复制数组避免修改原数组
            const last_key = path_copy.pop()
            for (let key of path_copy) {
                if (!the_object) {
                    newError("000", [
                        "访问隐藏属性的路径有误：",
                        object,
                        path
                    ])
                }
                the_object = the_object[key]
            }
            if (last_key) {
                the_object[last_key] = value
            }
        } else {
            the_object[path] = value
        }
    }
}
