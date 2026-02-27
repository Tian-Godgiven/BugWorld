// 游戏启动逻辑（从原start.js迁移）
import { createArea, bugNestJoinArea } from '../core/objects/Area'
import { createBug } from '../core/objects/Bug'
import { bugJoinToBugNest, createBugNest, moveToBugNest } from '../core/objects/BugNest'
import { createFacility, facilityJoinToBugNest, unlockFacilityToBugNest } from '../core/objects/Facility'
import { unlockWorkToBugNest, startWork, joinWork } from '../core/objects/Work'
import { createEvent, startEvent } from '../core/objects/Event'
import { useGameStore } from '../stores/game'
import _ from 'lodash'

export function startGame() {
  const gameStore = useGameStore()

  // 创建区域
  const area = createArea('平原', '测试')

  // 在区域内创建一座虫巢并移动过去
  const bugNest = createBugNest('genisis-nest', '测试')
  bugNestJoinArea(bugNest, area)
  moveToBugNest(bugNest)

  // 更新store
  gameStore.moveToBugNest(bugNest)
  gameStore.areas.push(area)

  // 为虫巢创建虫群，并将她们安置入巢
  const Queen = createBug('虫后', 2, '测试')
  const Worker = createBug('工虫', 10, '测试')
  const Worker2 = createBug('工虫', 10, '测试')
  const Soldier = createBug('兵虫', 10, '测试')

  bugJoinToBugNest(Queen, bugNest)
  bugJoinToBugNest(Worker, bugNest)
  bugJoinToBugNest(Worker2, bugNest)
  bugJoinToBugNest(Soldier, bugNest)

  // 为虫巢解锁这些工作
  unlockWorkToBugNest('觅食', bugNest, bugNest)
  unlockWorkToBugNest('探索', bugNest, bugNest)
  unlockWorkToBugNest('哺育', bugNest, bugNest)
  unlockWorkToBugNest('修建设施', bugNest, bugNest)

  // 开始这些工作
  const findFood = startWork(bugNest, '觅食')
  const adventure1 = startWork(bugNest, '探索')
  const adventure2 = startWork(bugNest, '探索')
  const feed = startWork(bugNest, '哺育')

  // 测试：安排工虫参与工作
  joinWork(Worker, 5, findFood)
  joinWork(Worker, 2, adventure1)
  joinWork(Soldier, 3, adventure2)
  joinWork(Queen, 2, feed)

  // 添加可修建设施
  unlockFacilityToBugNest('虫母室', '测试', bugNest)
  unlockFacilityToBugNest('孵化室', '测试', bugNest)

  // 为虫巢添加一些设施
  const facility = createFacility('虫母室', '测试', 1)
  const facility2 = createFacility('孵化室', '测试', 1)
  // 令其加入虫巢
  facilityJoinToBugNest(facility, bugNest)
  facilityJoinToBugNest(facility2, bugNest)

  // 创建一个事件
  const event1 = createEvent('虫群折损', '测试')
  // 令其开始
  const eventpower = _.random(1, 10)
  startEvent(event1, bugNest, '测试', eventpower)
}
