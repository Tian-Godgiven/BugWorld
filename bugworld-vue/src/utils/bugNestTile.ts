/**
 * 虫巢 Tile 系统
 *
 * 从 src/js/Tiles/bugNestTile.js 迁移
 */

// BugNestTile 组件引用
let bugNestTileRef: any = null

/**
 * 设置 BugNestTile 组件引用
 */
export function setBugNestTileRef(ref: any): void {
    bugNestTileRef = ref
}

/**
 * 更新虫巢 Tile
 *
 * @param bugNest - 虫巢对象
 */
export function updateBugNestTile(bugNest: any): void {
    if (bugNestTileRef) {
        bugNestTileRef.update(bugNest)
    } else {
        console.warn('[BUGNEST_TILE] BugNestTile 组件引用未设置')
    }
}
