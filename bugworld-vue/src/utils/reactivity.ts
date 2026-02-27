import { ref, type Ref } from 'vue'

/**
 * 游戏对象更新通知系统
 * 用于在核心逻辑修改对象后通知 Vue 组件更新
 */

type UpdateListener = () => void

// 全局更新监听器映射
const updateListeners = new Map<any, Set<UpdateListener>>()

// 全局更新计数器（用于强制触发响应式更新）
const updateCounter = ref(0)

/**
 * 通知对象已更新
 * @param object 被更新的对象
 */
export function notifyObjectUpdate(object: any): void {
  const listeners = updateListeners.get(object)
  if (listeners) {
    listeners.forEach(listener => listener())
  }
  // 触发全局更新
  updateCounter.value++
}

/**
 * 订阅对象更新
 * @param object 要监听的对象
 * @param listener 更新回调
 * @returns 取消订阅函数
 */
export function subscribeObjectUpdate(object: any, listener: UpdateListener): () => void {
  if (!updateListeners.has(object)) {
    updateListeners.set(object, new Set())
  }
  updateListeners.get(object)!.add(listener)

  return () => {
    const listeners = updateListeners.get(object)
    if (listeners) {
      listeners.delete(listener)
      if (listeners.size === 0) {
        updateListeners.delete(object)
      }
    }
  }
}

/**
 * 创建一个响应式的游戏对象引用
 * @param object 游戏对象
 * @returns 响应式引用
 */
export function useGameObject<T = any>(object: T): Ref<T> {
  const objectRef = ref(object) as Ref<T>

  // 订阅对象更新
  subscribeObjectUpdate(object, () => {
    // 强制触发响应式更新
    objectRef.value = { ...objectRef.value } as T
  })

  return objectRef
}

/**
 * 获取全局更新计数器（用于强制组件重新渲染）
 */
export function getUpdateCounter(): Ref<number> {
  return updateCounter
}
