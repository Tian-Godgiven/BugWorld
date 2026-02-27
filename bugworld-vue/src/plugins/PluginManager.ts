import { dataRegistry, type DataRegistry } from './DataRegistry'
import { componentRegistry } from './ComponentRegistry'
import { eventBus } from './EventBus'

/**
 * 插件接口
 */
export interface Plugin {
  /** 插件唯一标识 */
  id: string
  /** 插件名称 */
  name: string
  /** 插件版本 */
  version: string
  /** 插件描述 */
  description?: string
  /** 插件作者 */
  author?: string
  /** 插件依赖 */
  dependencies?: string[]
  /** 插件安装函数 */
  install: (context: PluginContext) => void | Promise<void>
  /** 插件卸载函数（可选） */
  uninstall?: () => void | Promise<void>
}

/**
 * 插件上下文 - 提供给插件的 API
 */
export interface PluginContext {
  /** 数据注册表 */
  dataRegistry: DataRegistry
  /** 组件注册表 */
  componentRegistry: typeof componentRegistry
  /** 事件总线 */
  eventBus: typeof eventBus
  /** 插件配置 */
  config: Record<string, any>
}

/**
 * 插件状态
 */
enum PluginStatus {
  UNINSTALLED = 'uninstalled',
  INSTALLING = 'installing',
  INSTALLED = 'installed',
  FAILED = 'failed'
}

interface PluginInfo {
  plugin: Plugin
  status: PluginStatus
  error?: Error
  installedAt?: Date
}

/**
 * 插件管理器
 */
class PluginManagerImpl {
  private plugins = new Map<string, PluginInfo>()
  private configs = new Map<string, Record<string, any>>()

  /**
   * 注册插件
   * @param plugin 插件对象
   */
  async register(plugin: Plugin): Promise<void> {
    if (this.plugins.has(plugin.id)) {
      throw new Error(`插件 "${plugin.id}" 已注册`)
    }

    // 检查依赖
    if (plugin.dependencies) {
      for (const depId of plugin.dependencies) {
        const dep = this.plugins.get(depId)
        if (!dep || dep.status !== PluginStatus.INSTALLED) {
          throw new Error(`插件 "${plugin.id}" 依赖的插件 "${depId}" 未安装`)
        }
      }
    }

    // 标记为安装中
    this.plugins.set(plugin.id, {
      plugin,
      status: PluginStatus.INSTALLING
    })

    try {
      // 创建插件上下文
      const context: PluginContext = {
        dataRegistry,
        componentRegistry,
        eventBus,
        config: this.configs.get(plugin.id) || {}
      }

      // 执行安装
      await plugin.install(context)

      // 标记为已安装
      this.plugins.set(plugin.id, {
        plugin,
        status: PluginStatus.INSTALLED,
        installedAt: new Date()
      })

      console.log(`插件 "${plugin.name}" (${plugin.id}) 安装成功`)
    } catch (error) {
      // 标记为失败
      this.plugins.set(plugin.id, {
        plugin,
        status: PluginStatus.FAILED,
        error: error as Error
      })

      console.error(`插件 "${plugin.name}" (${plugin.id}) 安装失败:`, error)
      throw error
    }
  }

  /**
   * 卸载插件
   * @param pluginId 插件 ID
   */
  async unregister(pluginId: string): Promise<void> {
    const pluginInfo = this.plugins.get(pluginId)
    if (!pluginInfo) {
      throw new Error(`插件 "${pluginId}" 未注册`)
    }

    if (pluginInfo.status !== PluginStatus.INSTALLED) {
      throw new Error(`插件 "${pluginId}" 未安装`)
    }

    // 检查是否有其他插件依赖此插件
    for (const [id, info] of this.plugins) {
      if (
        info.status === PluginStatus.INSTALLED &&
        info.plugin.dependencies?.includes(pluginId)
      ) {
        throw new Error(`插件 "${pluginId}" 被插件 "${id}" 依赖，无法卸载`)
      }
    }

    try {
      // 执行卸载
      if (pluginInfo.plugin.uninstall) {
        await pluginInfo.plugin.uninstall()
      }

      // 移除插件
      this.plugins.delete(pluginId)

      console.log(`插件 "${pluginInfo.plugin.name}" (${pluginId}) 卸载成功`)
    } catch (error) {
      console.error(`插件 "${pluginInfo.plugin.name}" (${pluginId}) 卸载失败:`, error)
      throw error
    }
  }

  /**
   * 获取插件信息
   */
  getPlugin(pluginId: string): PluginInfo | undefined {
    return this.plugins.get(pluginId)
  }

  /**
   * 获取所有插件
   */
  getAllPlugins(): Map<string, PluginInfo> {
    return new Map(this.plugins)
  }

  /**
   * 获取已安装的插件
   */
  getInstalledPlugins(): Map<string, PluginInfo> {
    const result = new Map<string, PluginInfo>()
    for (const [id, info] of this.plugins) {
      if (info.status === PluginStatus.INSTALLED) {
        result.set(id, info)
      }
    }
    return result
  }

  /**
   * 设置插件配置
   */
  setConfig(pluginId: string, config: Record<string, any>): void {
    this.configs.set(pluginId, config)
  }

  /**
   * 获取插件配置
   */
  getConfig(pluginId: string): Record<string, any> | undefined {
    return this.configs.get(pluginId)
  }

  /**
   * 清空所有插件
   */
  async clear(): Promise<void> {
    const installedPlugins = Array.from(this.plugins.keys()).filter(
      id => this.plugins.get(id)?.status === PluginStatus.INSTALLED
    )

    for (const pluginId of installedPlugins) {
      try {
        await this.unregister(pluginId)
      } catch (error) {
        console.error(`清空插件时出错 (${pluginId}):`, error)
      }
    }

    this.plugins.clear()
    this.configs.clear()
  }
}

// 导出单例
export const pluginManager = new PluginManagerImpl()
export { PluginStatus }
