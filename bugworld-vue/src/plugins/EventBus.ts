import mitt, { type Emitter, type EventType } from 'mitt'

/**
 * 事件总线 - 用于插件间通信和游戏事件监听
 */

type GameEvents = {
  // 游戏生命周期事件
  'game:start': void
  'game:pause': void
  'game:resume': void
  'game:end': void
  'game:save': void
  'game:load': void

  // 回合事件
  'turn:start': { turn: number }
  'turn:end': { turn: number }

  // 虫巢事件
  'bugNest:create': { bugNest: any }
  'bugNest:focus': { bugNest: any }
  'bugNest:update': { bugNest: any }

  // 虫群事件
  'bug:create': { bug: any }
  'bug:join': { bug: any; target: any }
  'bug:occupy': { bug: any; source: any; num: number }
  'bug:unoccupy': { bug: any; source: any; num: number }
  'bug:update': { bug: any }

  // 工作事件
  'work:start': { work: any; bugNest: any }
  'work:stop': { work: any; reason: string }
  'work:progress': { work: any; progress: number }
  'work:complete': { work: any }

  // 设施事件
  'facility:create': { facility: any }
  'facility:join': { facility: any; bugNest: any }
  'facility:update': { facility: any }

  // 事件对象事件
  'event:create': { event: any }
  'event:start': { event: any }
  'event:end': { event: any }

  // UI 事件
  'ui:tileOpen': { tileType: string; data: any }
  'ui:tileClose': { tileType: string }
  'ui:menuOpen': { menuType: string; data: any }
  'ui:menuClose': { menuType: string }

  // 自定义事件（插件可以发送任意事件）
  [key: string]: any
}

class EventBusImpl {
  private emitter: Emitter<GameEvents>

  constructor() {
    this.emitter = mitt<GameEvents>()
  }

  /**
   * 监听事件
   * @param type 事件类型
   * @param handler 事件处理函数
   */
  on<Key extends keyof GameEvents>(
    type: Key,
    handler: (event: GameEvents[Key]) => void
  ): void {
    this.emitter.on(type, handler as any)
  }

  /**
   * 监听事件（一次性）
   * @param type 事件类型
   * @param handler 事件处理函数
   */
  once<Key extends keyof GameEvents>(
    type: Key,
    handler: (event: GameEvents[Key]) => void
  ): void {
    const wrappedHandler = (event: GameEvents[Key]) => {
      handler(event)
      this.off(type, wrappedHandler as any)
    }
    this.on(type, wrappedHandler as any)
  }

  /**
   * 取消监听事件
   * @param type 事件类型
   * @param handler 事件处理函数（可选，不传则取消该类型的所有监听）
   */
  off<Key extends keyof GameEvents>(
    type: Key,
    handler?: (event: GameEvents[Key]) => void
  ): void {
    if (handler) {
      this.emitter.off(type, handler as any)
    } else {
      this.emitter.off(type)
    }
  }

  /**
   * 发送事件
   * @param type 事件类型
   * @param event 事件数据
   */
  emit<Key extends keyof GameEvents>(type: Key, event: GameEvents[Key]): void {
    this.emitter.emit(type, event)
  }

  /**
   * 清空所有事件监听
   */
  clear(): void {
    this.emitter.all.clear()
  }

  /**
   * 获取所有事件监听器
   */
  getAllListeners(): Map<any, any[]> {
    return new Map(this.emitter.all as any)
  }
}

// 导出单例
export const eventBus = new EventBusImpl()
export type { GameEvents }
