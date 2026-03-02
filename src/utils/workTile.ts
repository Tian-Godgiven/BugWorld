/**
 * 工作 Tile 系统
 *
 * 从 src/js/Tiles/work_tile/workTile.js 迁移
 */

// WorkTile 组件引用
let workTileRef: any = null

/**
 * 设置 WorkTile 组件引用
 */
export function setWorkTileRef(ref: any): void {
    workTileRef = ref
}

/**
 * 更新工作 Tile
 *
 * @param bugNest - 虫巢对象（可选）
 */
export function updateWorkTile(bugNest?: any): void {
    if (workTileRef) {
        workTileRef.update(bugNest)
    } else {
        console.warn('[WORK_TILE] WorkTile 组件引用未设置')
    }
}

/**
 * 添加工作 Div 到工作 Tile
 *
 * @param work - 工作对象
 */
export function appendWorkTileDiv(work: any): void {
    // WorkTile.vue 使用 computed 自动响应数据变化，无需手动添加
    // 只需触发更新即可
    if (workTileRef) {
        workTileRef.update()
    }
}

/**
 * 从工作 Tile 中删除工作 Div
 *
 * @param work - 工作对象
 */
export function deleteWorkTileDiv(work: any): void {
    // WorkTile.vue 使用 computed 自动响应数据变化，无需手动删除
    // 只需触发更新即可
    if (workTileRef) {
        workTileRef.update()
    }
}
