// 日志管理模块
// 提供统一的日志接口，供游戏逻辑层调用

export interface LogEntry {
  时间: number
  内容: any[]
}

// 日志存储
const logs: LogEntry[] = []

// 日志监听器（供Vue组件订阅）
type LogListener = (log: LogEntry) => void
const listeners: LogListener[] = []

// 添加日志
export function appendLog(information: any[]): void {
  const log: LogEntry = {
    时间: Date.now(),
    内容: information
  }
  logs.push(log)

  // 通知所有监听器
  listeners.forEach(listener => listener(log))
}

// 清空日志
export function clearLog(): void {
  logs.length = 0
}

// 获取所有日志
export function getLogs(): LogEntry[] {
  return logs
}

// 订阅日志更新（供Vue组件使用）
export function subscribeLog(listener: LogListener): () => void {
  listeners.push(listener)
  // 返回取消订阅函数
  return () => {
    const index = listeners.indexOf(listener)
    if (index > -1) {
      listeners.splice(index, 1)
    }
  }
}
