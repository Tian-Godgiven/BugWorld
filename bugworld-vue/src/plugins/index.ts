/**
 * BugWorld 插件系统
 *
 * 提供完整的插件开发接口，支持：
 * - 数据注册：注册自定义虫群、设施、工作、事件等
 * - 组件注册：注册自定义 Vue 组件
 * - 事件监听：监听游戏事件并响应
 * - 插件管理：安装、卸载、配置插件
 */

export { dataRegistry } from './DataRegistry'
export type { DataRegistry } from './DataRegistry'

export { componentRegistry } from './ComponentRegistry'
export type { ComponentInfo } from './ComponentRegistry'

export { eventBus } from './EventBus'
export type { GameEvents } from './EventBus'

export { pluginManager, PluginStatus } from './PluginManager'
export type { Plugin, PluginContext } from './PluginManager'

/**
 * 插件开发示例：
 *
 * ```typescript
 * import { Plugin, PluginContext } from '@/plugins'
 *
 * const myPlugin: Plugin = {
 *   id: 'my-plugin',
 *   name: '我的插件',
 *   version: '1.0.0',
 *   description: '这是一个示例插件',
 *   author: '作者名',
 *
 *   install(context: PluginContext) {
 *     // 注册自定义虫群
 *     context.dataRegistry.registerBug('custom_bug', {
 *       名称: '自定义虫子',
 *       属性: { ... }
 *     })
 *
 *     // 注册自定义组件
 *     context.componentRegistry.registerTile(
 *       'custom-tile',
 *       CustomTileComponent,
 *       '自定义面板'
 *     )
 *
 *     // 监听游戏事件
 *     context.eventBus.on('bug:create', (event) => {
 *       console.log('虫子创建:', event.bug)
 *     })
 *   },
 *
 *   uninstall() {
 *     // 清理资源
 *   }
 * }
 *
 * // 注册插件
 * pluginManager.register(myPlugin)
 * ```
 */
