import type { Component } from 'vue'

/**
 * 组件注册表 - 用于插件注册自定义 Vue 组件
 * 支持注册 Tile 组件、UI 组件等
 */

interface ComponentInfo {
  component: Component
  name: string
  description?: string
  category?: string
}

class ComponentRegistryImpl {
  private tiles = new Map<string, ComponentInfo>()
  private uiComponents = new Map<string, ComponentInfo>()

  /**
   * 注册 Tile 组件
   * @param key 组件唯一标识
   * @param component Vue 组件
   * @param name 组件显示名称
   * @param description 组件描述
   * @param category 组件分类
   */
  registerTile(
    key: string,
    component: Component,
    name: string,
    description?: string,
    category?: string
  ): void {
    if (this.tiles.has(key)) {
      console.warn(`Tile 组件 "${key}" 已存在，将被覆盖`)
    }
    this.tiles.set(key, { component, name, description, category })
  }

  /**
   * 注册 UI 组件
   * @param key 组件唯一标识
   * @param component Vue 组件
   * @param name 组件显示名称
   * @param description 组件描述
   * @param category 组件分类
   */
  registerUIComponent(
    key: string,
    component: Component,
    name: string,
    description?: string,
    category?: string
  ): void {
    if (this.uiComponents.has(key)) {
      console.warn(`UI 组件 "${key}" 已存在，将被覆盖`)
    }
    this.uiComponents.set(key, { component, name, description, category })
  }

  /**
   * 获取 Tile 组件
   */
  getTile(key: string): ComponentInfo | undefined {
    return this.tiles.get(key)
  }

  /**
   * 获取 UI 组件
   */
  getUIComponent(key: string): ComponentInfo | undefined {
    return this.uiComponents.get(key)
  }

  /**
   * 获取所有 Tile 组件
   */
  getAllTiles(): Map<string, ComponentInfo> {
    return new Map(this.tiles)
  }

  /**
   * 获取所有 UI 组件
   */
  getAllUIComponents(): Map<string, ComponentInfo> {
    return new Map(this.uiComponents)
  }

  /**
   * 按分类获取 Tile 组件
   */
  getTilesByCategory(category: string): Map<string, ComponentInfo> {
    const result = new Map<string, ComponentInfo>()
    for (const [key, info] of this.tiles) {
      if (info.category === category) {
        result.set(key, info)
      }
    }
    return result
  }

  /**
   * 按分类获取 UI 组件
   */
  getUIComponentsByCategory(category: string): Map<string, ComponentInfo> {
    const result = new Map<string, ComponentInfo>()
    for (const [key, info] of this.uiComponents) {
      if (info.category === category) {
        result.set(key, info)
      }
    }
    return result
  }

  /**
   * 注销 Tile 组件
   */
  unregisterTile(key: string): boolean {
    return this.tiles.delete(key)
  }

  /**
   * 注销 UI 组件
   */
  unregisterUIComponent(key: string): boolean {
    return this.uiComponents.delete(key)
  }

  /**
   * 清空所有注册组件
   */
  clear(): void {
    this.tiles.clear()
    this.uiComponents.clear()
  }
}

// 导出单例
export const componentRegistry = new ComponentRegistryImpl()
export type { ComponentInfo }
