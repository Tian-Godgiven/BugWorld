/**
 * 命令 Tile 系统
 *
 * 从 src/js/Tiles/order_tile/orderTile.js 迁移
 */

// OrderTile 组件引用
let orderTileRef: any = null

/**
 * 设置 OrderTile 组件引用
 */
export function setOrderTileRef(ref: any): void {
    orderTileRef = ref
}

/**
 * 更新命令 Tile
 */
export function updateOrderTile(): void {
    if (orderTileRef) {
        orderTileRef.update()
    } else {
        console.warn('[ORDER_TILE] OrderTile 组件引用未设置')
    }
}

/**
 * 更新命令 Tile 中的虫群 Div
 *
 * @param bug - 虫群对象
 */
export function updateOrderTileBugDiv(bug: any): void {
    // OrderTile.vue 使用 computed 自动响应数据变化
    // 只需触发更新即可
    if (orderTileRef) {
        orderTileRef.update()
    }
}
