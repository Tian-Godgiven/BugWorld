import { ref } from 'vue'

/**
 * 日志系统
 *
 * 从 src/js/Tiles/logTile.js 迁移
 *
 * 功能：
 * 1. 向日志中添加信息
 * 2. 支持对象和文本混合显示
 * 3. 与LogTile组件配合使用
 */

// LogTile组件的引用
let logTileRef: any = null

/**
 * 设置LogTile组件引用
 */
export function setLogTileRef(ref: any): void {
    logTileRef = ref
}

/**
 * 向日志中添加信息
 *
 * @param information - 信息数组，可以包含字符串或对象
 *
 * 示例：
 * appendLog(['开始工作：', workObject])
 * appendLog(['信息：', object])
 */
export function appendLog(information: any[]): void {
    // 如果LogTile组件已初始化，则添加到UI
    if (logTileRef && logTileRef.appendLog) {
        logTileRef.appendLog(information)
    }
}

/**
 * 创建日志栏（已废弃）
 *
 * 在Vue版本中，LogTile通过GameView.vue直接创建
 * 这个函数保留是为了兼容旧代码
 */
export function createLogTile(): void {
    // 在Vue版本中不需要手动创建，LogTile在GameView中声明式创建
}
