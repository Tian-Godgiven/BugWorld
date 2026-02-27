import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { subscribeLog, getLogs, clearLog as clearLogUtil, type LogEntry } from '../utils/log'

export const useLogStore = defineStore('log', () => {
  const logs = ref<LogEntry[]>(getLogs())

  // 订阅日志更新
  subscribeLog((log) => {
    logs.value.push(log)
  })

  // 清空日志
  function clearLog() {
    clearLogUtil()
    logs.value = []
  }

  return {
    logs,
    clearLog
  }
})
