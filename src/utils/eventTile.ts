/**
 * 事件 Tile 系统
 *
 * 从 src/js/Tiles/event_tile/eventTile.js 迁移
 */

// EventTile 组件引用
let eventTileRef: any = null

/**
 * 设置 EventTile 组件引用
 */
export function setEventTileRef(ref: any): void {
    eventTileRef = ref
}

/**
 * 添加事件 Div 到事件 Tile
 *
 * @param event - 事件对象
 */
export function appendEventTileDiv(event: any): void {
    // EventTile.vue 使用 computed 自动响应数据变化
    // 只需触发更新即可
    if (eventTileRef) {
        eventTileRef.update()
    } else {
        console.warn('[EVENT_TILE] EventTile 组件引用未设置')
    }
}

/**
 * 从事件 Tile 中删除事件 Div
 *
 * @param event - 事件对象
 */
export function deleteEventTileDiv(event: any): void {
    // EventTile.vue 使用 computed 自动响应数据变化
    // 只需触发更新即可
    if (eventTileRef) {
        eventTileRef.update()
    }
}
