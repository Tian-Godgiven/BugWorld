import _ from 'lodash'
import BugNest_lib from '../../library/data/BugNest_lib.json'
import { initObject } from './Object'
import { bugJoinTo } from './Bug'
import { notifyObjectUpdate } from '../../utils/reactivity'

class BugNest {
  属性: any
  单位: any
  隐藏: any

  constructor() {
    this.属性 = {
      名称: null,
      参数: {},
      系数: {},
      虫群: {},
      设施: {},
      状态: [],
      特殊: {},
      特性: [],
      词条: [],
      所处: {
        数组: [],
        数量: 1
      },
      信息: null,
      其他: []
    }
    this.单位 = {
      生产: '营养/回合',
      消耗: '营养/回合'
    }
    this.隐藏 = {
      已解锁: {
        工作: [],
        设施建造: {}
      },
      进行中: {
        事件: [],
        工作: []
      },
      事件信息: {
        概率边界: 50,
        倾向边界: 0
      }
    }
  }
}

// 当前聚焦中的虫巢对象，即界面上显示的虫巢对象
let focusing_bugNest: any

// 返回当前聚焦中的虫巢对象
export function getFocusingBugNest(): any {
  return focusing_bugNest
}

// 创建一个指定类型的虫巢对象
export function createBugNest(bugNest_key: string, source: any, more_state?: any): any {
  // 创建对象
  const bugNest = new BugNest()
  // 初始化
  const bugNest_json = (BugNest_lib as any)[bugNest_key]
  const bugNest_func = null
  initObject(bugNest, bugNest_key, source, bugNest_json, bugNest_func, more_state)

  return bugNest
}

// 移动到指定的虫巢对象
export function moveToBugNest(bugNest: any): void {
  focusing_bugNest = bugNest
}

// 令虫群对象加入虫巢
export function bugJoinToBugNest(bug: any, bugNest: any): void {
  if (bugJoinTo(bug, bugNest)) {
    // 通知虫巢对象更新
    notifyObjectUpdate(bugNest)
  }
}
