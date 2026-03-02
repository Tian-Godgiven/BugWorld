/**
 * 设施 Tile 系统
 *
 * 从 src/js/Tiles/facility_tile/facilityTile.js 迁移
 */

// FacilityTile 组件引用
let facilityTileRef: any = null

/**
 * 设置 FacilityTile 组件引用
 */
export function setFacilityTileRef(ref: any): void {
    facilityTileRef = ref
}

/**
 * 更新设施 Tile
 *
 * @param bugNest - 虫巢对象
 */
export function updateFacilityTile(bugNest: any): void {
    if (facilityTileRef) {
        facilityTileRef.update(bugNest)
    } else {
        console.warn('[FACILITY_TILE] FacilityTile 组件引用未设置')
    }
}
