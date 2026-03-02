/**
 * 数据注册表 - 用于插件注册自定义游戏数据
 * 支持注册虫群、设施、工作、事件、特性等游戏对象
 */

interface DataRegistry {
  bugs: Map<string, any>
  facilities: Map<string, any>
  works: Map<string, any>
  events: Map<string, any>
  characteristics: Map<string, any>
  areas: Map<string, any>

  registerBug(key: string, data: any): void
  registerFacility(key: string, data: any): void
  registerWork(key: string, data: any): void
  registerEvent(key: string, data: any): void
  registerCharacteristic(key: string, data: any): void
  registerArea(key: string, data: any): void

  getBug(key: string): any | undefined
  getFacility(key: string): any | undefined
  getWork(key: string): any | undefined
  getEvent(key: string): any | undefined
  getCharacteristic(key: string): any | undefined
  getArea(key: string): any | undefined

  getAllBugs(): Map<string, any>
  getAllFacilities(): Map<string, any>
  getAllWorks(): Map<string, any>
  getAllEvents(): Map<string, any>
  getAllCharacteristics(): Map<string, any>
  getAllAreas(): Map<string, any>

  clear(): void
}

class DataRegistryImpl implements DataRegistry {
  bugs = new Map<string, any>()
  facilities = new Map<string, any>()
  works = new Map<string, any>()
  events = new Map<string, any>()
  characteristics = new Map<string, any>()
  areas = new Map<string, any>()

  /**
   * 注册虫群数据
   */
  registerBug(key: string, data: any): void {
    if (this.bugs.has(key)) {
      console.warn(`虫群数据 "${key}" 已存在，将被覆盖`)
    }
    this.bugs.set(key, data)
  }

  /**
   * 注册设施数据
   */
  registerFacility(key: string, data: any): void {
    if (this.facilities.has(key)) {
      console.warn(`设施数据 "${key}" 已存在，将被覆盖`)
    }
    this.facilities.set(key, data)
  }

  /**
   * 注册工作数据
   */
  registerWork(key: string, data: any): void {
    if (this.works.has(key)) {
      console.warn(`工作数据 "${key}" 已存在，将被覆盖`)
    }
    this.works.set(key, data)
  }

  /**
   * 注册事件数据
   */
  registerEvent(key: string, data: any): void {
    if (this.events.has(key)) {
      console.warn(`事件数据 "${key}" 已存在，将被覆盖`)
    }
    this.events.set(key, data)
  }

  /**
   * 注册特性数据
   */
  registerCharacteristic(key: string, data: any): void {
    if (this.characteristics.has(key)) {
      console.warn(`特性数据 "${key}" 已存在，将被覆盖`)
    }
    this.characteristics.set(key, data)
  }

  /**
   * 注册区域数据
   */
  registerArea(key: string, data: any): void {
    if (this.areas.has(key)) {
      console.warn(`区域数据 "${key}" 已存在，将被覆盖`)
    }
    this.areas.set(key, data)
  }

  /**
   * 获取虫群数据
   */
  getBug(key: string): any | undefined {
    return this.bugs.get(key)
  }

  /**
   * 获取设施数据
   */
  getFacility(key: string): any | undefined {
    return this.facilities.get(key)
  }

  /**
   * 获取工作数据
   */
  getWork(key: string): any | undefined {
    return this.works.get(key)
  }

  /**
   * 获取事件数据
   */
  getEvent(key: string): any | undefined {
    return this.events.get(key)
  }

  /**
   * 获取特性数据
   */
  getCharacteristic(key: string): any | undefined {
    return this.characteristics.get(key)
  }

  /**
   * 获取区域数据
   */
  getArea(key: string): any | undefined {
    return this.areas.get(key)
  }

  /**
   * 获取所有虫群数据
   */
  getAllBugs(): Map<string, any> {
    return new Map(this.bugs)
  }

  /**
   * 获取所有设施数据
   */
  getAllFacilities(): Map<string, any> {
    return new Map(this.facilities)
  }

  /**
   * 获取所有工作数据
   */
  getAllWorks(): Map<string, any> {
    return new Map(this.works)
  }

  /**
   * 获取所有事件数据
   */
  getAllEvents(): Map<string, any> {
    return new Map(this.events)
  }

  /**
   * 获取所有特性数据
   */
  getAllCharacteristics(): Map<string, any> {
    return new Map(this.characteristics)
  }

  /**
   * 获取所有区域数据
   */
  getAllAreas(): Map<string, any> {
    return new Map(this.areas)
  }

  /**
   * 清空所有注册数据
   */
  clear(): void {
    this.bugs.clear()
    this.facilities.clear()
    this.works.clear()
    this.events.clear()
    this.characteristics.clear()
    this.areas.clear()
  }
}

// 导出单例
export const dataRegistry = new DataRegistryImpl()
export type { DataRegistry }
