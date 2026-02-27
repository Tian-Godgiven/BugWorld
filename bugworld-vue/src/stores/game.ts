import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useGameStore = defineStore('game', () => {
  // 当前聚焦的虫巢
  const focusingBugNest = ref<any>(null)

  // 游戏回合数
  const 回合数 = ref(0)

  // 所有区域
  const areas = ref<any[]>([])

  // 移动到指定虫巢
  function moveToBugNest(bugNest: any) {
    focusingBugNest.value = bugNest
  }

  // 下一回合
  function nextTurn() {
    回合数.value++
    // 触发回合结算逻辑
    // TODO: 实现回合结算
  }

  return {
    focusingBugNest,
    回合数,
    areas,
    moveToBugNest,
    nextTurn
  }
})
